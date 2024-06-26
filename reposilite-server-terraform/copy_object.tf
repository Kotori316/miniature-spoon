
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
                next = "body"
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
          body = {
            assign = [
              {
                cloud_run_body = {
                  overrides = {
                    containerOverrides = {
                      args = [
                        "storage",
                        "cp",
                        "$${source_url}",
                        "$${destination_url}",
                      ]
                    }
                  }
                }
              }
            ]
            next = "add_task"
          }
        },
        {
          add_task = {
            call = "googleapis.cloudtasks.v2.projects.locations.queues.tasks.create"
            args = {
              parent = google_cloud_tasks_queue.copy_flow_buffer.id
              body = {
                task = {
                  httpRequest = {
                    url  = "https://run.googleapis.com/v2/${google_cloud_run_v2_job.copy_task.id}:run"
                    body = "$${base64.encode(json.encode(cloud_run_body))}"
                    oauthToken = {
                      serviceAccountEmail = google_service_account.copy_flow_runner.email
                    }
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

resource "google_cloud_run_v2_job" "copy_task" {
  name     = "${var.base_name}-copy-job"
  location = var.region

  template {
    template {
      service_account = google_service_account.copy_flow_runner.email
      containers {
        image   = "gcr.io/google.com/cloudsdktool/cloud-sdk:alpine"
        command = ["gcloud"]
        args    = ["storage", "ls"]
        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }
        env {
          name  = "AWS_DEFAULT_REGION"
          value = "auto"
        }
        env {
          name = "AWS_ENDPOINT_URL"
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

resource "google_cloud_tasks_queue" "copy_flow_buffer" {
  name     = "${var.base_name}-copy-workflow-buffer"
  location = var.region

  rate_limits {
    max_concurrent_dispatches = 1
    max_dispatches_per_second = 1
  }
  retry_config {
    max_attempts       = 30
    max_retry_duration = "0s"
    max_backoff        = "200s"
    min_backoff        = "12s"
    max_doublings      = 2
  }
}
