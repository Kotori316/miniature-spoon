resource "terraform_data" "trigger_bucket" {
  input = google_storage_bucket.maven_bucket.name
}

resource "google_workflows_workflow" "main" {
  name            = "${var.base_name}-copy-workflow"
  region          = var.region
  description     = "A workflow to copy gs object to R2"
  service_account = google_service_account.copy_flow_runner.id
  // call_log_level  = "CALL_LOG_LEVEL_UNSPECIFIED"
  source_contents = yamlencode({
    main = {
      params = ["input"]
      steps = [
        {
          init = {
            steps = [
              {
                parse_arg = {
                  assign = [
                    { project_id = "$${sys.get_env(\"GOOGLE_CLOUD_PROJECT_ID\")}" },
                    { service_account_name = "$${sys.get_env(\"GOOGLE_CLOUD_SERVICE_ACCOUNT_NAME\")}" },
                    {
                      source = {
                        bucket     = "$${input.data.bucket}"
                        objectName = "$${input.data.name}"
                      }
                    },
                    { pathSeparator = "$${sys.get_env(\"PATH_SEPARATOR\", \"/\")}" },
                    { destinationBucket = "$${sys.get_env(\"DESTINATION_BUCKET\", \"kotori316-maven\")}" },
                  ]
                }
              },
              {
                set_destination = {
                  assign = [
                    {
                      destination = {
                        bucket     = "$${destinationBucket}"
                        objectName = "$${text.replace_all_regex(source.objectName, \"^.+?\" + pathSeparator, \"\")}"
                      }
                    }
                  ]
                }
              },
              {
                set_url = {
                  assign = [
                    { source_url = "$${\"gs://\" + source.bucket + \"/\" + source.objectName}" },
                    { destination_url = "$${\"s3://\" + destination.bucket + \"/\" + destination.objectName}" },
                  ]
                }
              },
              {
                log_events = {
                  call = "sys.log"
                  args = {
                    json = {
                      source          = "$${source}"
                      destination     = "$${destination}"
                      source_url      = "$${source_url}"
                      destination_url = "$${destination_url}"
                    }
                    severity = "INFO"
                  }
                }
              },
            ]
          }
        },
        {
          check_prefix = {
            switch = [
              {
                condition = "$${text.match_regex(source.objectName, \"maven/\")}"
                assign = [
                  { doAction = "true" }
                ]
                next = "add_task"
              },
              {
                condition = "$${true}"
                assign = [
                  { doAction = "false" }
                ]
                next = "returnOutput"
              }
            ]
            next = "end"
          }
        },
        {
          add_task = {
            call = "googleapis.firestore.v1.projects.databases.documents.createDocument"
            args = {
              collectionId = "MavenCopy"
              parent       = "$${\"projects/\" + project_id + \"/databases/(default)/documents\"}"
              body = {
                fields = {
                  source_url = {
                    stringValue = "$${source_url}"
                  }
                  destination_url = {
                    stringValue = "$${destination_url}"
                  }
                }
              }
            }
            next = "returnOutput"
          }
        },
        {
          returnOutput = {
            return = {
              source      = "$${source}"
              destination = "$${destination}"
              doAction    = "$${doAction}"
            }
          }
        },
      ]
    }
  })
}

resource "google_eventarc_trigger" "bucket_trigger" {
  name            = "${google_workflows_workflow.main.name}-trigger"
  location        = google_workflows_workflow.main.region
  service_account = google_service_account.copy_flow_runner.email
  matching_criteria {
    attribute = "type"
    value     = "google.cloud.storage.object.v1.finalized"
  }
  matching_criteria {
    attribute = "bucket"
    value     = terraform_data.trigger_bucket.output
  }
  destination {
    workflow = google_workflows_workflow.main.id
  }

  lifecycle {
    replace_triggered_by = [terraform_data.trigger_bucket]
  }
}

data "google_secret_manager_secret" "cloudflare_s3_endpoint" {
  secret_id = "cloudflare_s3_endpoint"
}

data "google_secret_manager_secret" "cloudflare_access_key" {
  secret_id = "cloudflare_access_key"
}

data "google_secret_manager_secret" "cloudflare_secret_key" {
  secret_id = "cloudflare_secret_key"
}

resource "google_artifact_registry_repository" "repo" {
  location               = "us-central1"
  repository_id          = "${var.base_name}-copy-job-registory"
  description            = "Docker repository for ${var.base_name}"
  format                 = "DOCKER"
  cleanup_policy_dry_run = false
  cleanup_policies {
    id     = "delete-1day"
    action = "DELETE"
    condition {
      tag_state  = "ANY"
      older_than = "${60 * 60 * 24}s"
    }
  }
  cleanup_policies {
    id     = "keep-minimum-versions"
    action = "KEEP"
    most_recent_versions {
      keep_count = 1
    }
  }
}

data "google_artifact_registry_docker_image" "repo" {
  location      = google_artifact_registry_repository.repo.location
  repository_id = google_artifact_registry_repository.repo.repository_id
  image_name    = "copy_task:latest"
}

resource "google_cloud_run_v2_job" "copy_task" {
  name     = "${var.base_name}-copy-job"
  location = var.region

  template {
    template {
      service_account = google_service_account.copy_flow_runner.email
      containers {
        image = data.google_artifact_registry_docker_image.repo.self_link
        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }
        env {
          name  = "AWS_REGION"
          value = "auto"
        }
        env {
          name = "AWS_ENDPOINT_URL_S3"
          value_source {
            secret_key_ref {
              secret  = data.google_secret_manager_secret.cloudflare_s3_endpoint.id
              version = "latest"
            }
          }
        }
        env {
          name = "AWS_ACCESS_KEY_ID"
          value_source {
            secret_key_ref {
              secret  = data.google_secret_manager_secret.cloudflare_access_key.id
              version = "latest"
            }
          }
        }
        env {
          name = "AWS_SECRET_ACCESS_KEY"
          value_source {
            secret_key_ref {
              secret  = data.google_secret_manager_secret.cloudflare_secret_key.id
              version = "latest"
            }
          }
        }
      }
    }
  }
}

locals {
  job_run_url = "https://${google_cloud_run_v2_job.copy_task.location}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${google_cloud_run_v2_job.copy_task.project}/jobs/${google_cloud_run_v2_job.copy_task.name}:run"
}

resource "google_cloud_scheduler_job" "copy_task" {
  name        = "${google_cloud_run_v2_job.copy_task.name}-scheduler-trigger"
  description = "Scheduled trigger for ${google_cloud_run_v2_job.copy_task.name}"
  region      = google_cloud_run_v2_job.copy_task.location
  schedule    = "20 3 * * *"
  time_zone   = "Asia/Tokyo"

  http_target {
    http_method = "POST"
    uri         = local.job_run_url
    oauth_token {
      service_account_email = google_service_account.copy_flow_runner.email
      scope                 = "https://www.googleapis.com/auth/cloud-platform"
    }
  }
  depends_on = [google_cloud_run_v2_job_iam_member.copy_task]
}
