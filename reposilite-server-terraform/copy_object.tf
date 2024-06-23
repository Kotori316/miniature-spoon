
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
          init_destination = {
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
          init_url = {
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
        {
          create_param_cloud_build = {
            assign = [
              {
                substitutions = {
                  "_SOURCE_URL"      = "$${source_url}"
                  "_DESTINATION_URL" = "$${destination_url}"
                }
              }
            ]
          }
        },
        {
          copy = {
            call = "googleapis.cloudbuild.v1.projects.triggers.run"
            args = {
              projectId = "$${project_id}"
              triggerId = google_cloudbuild_trigger.main.trigger_id
              name      = google_cloudbuild_trigger.main.id
              body = {
                substitutions = {
                  "_SOURCE_URL"      = "$${source_url}"
                  "_DESTINATION_URL" = "$${destination_url}"
                }
              }
            }
            result = "copy_task_output"
          }
        },
        {
          returnOutput = {
            return = {
              source      = "$${source}"
              destination = "$${destination}"
              log         = "$${text.replace_all(text.decode(base64.decode(copy_task_output.metadata.build.results.buildStepOutputs[0])), \"\\n\", \"\")}"
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

resource "google_cloudbuild_trigger" "main" {
  name            = "${var.base_name}-copy-build"
  description     = "A CodeBuild to run copy task for ${var.base_name}"
  service_account = google_service_account.copy_flow_runner.id
  location        = "global"

  approval_config {
    approval_required = false
  }

  build {
    step {
      name       = "gcr.io/google.com/cloudsdktool/cloud-sdk:alpine"
      entrypoint = "/bin/bash"
      args = [
        "-c", "gcloud storage cp $${_SOURCE_URL} $${_DESTINATION_URL} > $${BUILDER_OUTPUT}/output"
      ]
      env = [
        "AWS_DEFAULT_REGION=auto"
      ]
      secret_env = [
        "AWS_ENDPOINT_URL",
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
      ]
    }

    available_secrets {
      secret_manager {
        env          = "AWS_ENDPOINT_URL"
        version_name = "${data.google_secret_manager_secret.cloudflare_s3_endpoint.id}/versions/latest"
      }
      secret_manager {
        env          = "AWS_ACCESS_KEY_ID"
        version_name = "${data.google_secret_manager_secret.cloudflare_access_key.id}/versions/latest"
      }
      secret_manager {
        env          = "AWS_SECRET_ACCESS_KEY"
        version_name = "${data.google_secret_manager_secret.cloudflare_secret_key.id}/versions/latest"
      }
    }
  }

  lifecycle {
    ignore_changes = [
      source_to_build[0].repo_type
    ]
  }
}
