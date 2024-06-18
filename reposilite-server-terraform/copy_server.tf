resource "google_cloud_run_v2_service" "copy_server" {
  location = var.region
  name     = "${var.base_name}-copy-run"
  template {
    max_instance_request_concurrency = 150
    service_account                  = google_service_account.runner.email
    containers {
      name  = "app"
      image = "us-central1-docker.pkg.dev/kotori316-mods-resources/storage-copy-application/app:latest"
      resources {
        limits = {
          cpu    = "1000m"
          memory = "1024Mi"
        }
        cpu_idle = true
      }
      env {
        name = "CLOUDFLARE_S3_ENDPOINT"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.cloudflare_s3_endpoint.id
            version = "latest"
          }
        }
      }
      env {
        name = "CLOUDFLARE_ACCESS_KEY"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.cloudflare_access_key.id
            version = "latest"
          }
        }
      }
      env {
        name = "CLOUDFLARE_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.cloudflare_secret_key.id
            version = "latest"
          }
        }
      }
    }
  }
  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      template[0].containers[0].name,
      client,
      client_version,
    ]
  }
}

resource "google_service_account" "copy_server_runner" {
  account_id = "storage-copy-server-runner"
}

resource "google_cloud_run_v2_service_iam_binding" "copy_server" {
  name     = google_cloud_run_v2_service.copy_server.name
  members  = ["serviceAccount:${google_service_account.copy_server_runner.email}"]
  role     = "roles/run.invoker"
  location = google_cloud_run_v2_service.copy_server.location
}

resource "google_project_iam_member" "copy_server_eventarc" {
  role    = "roles/eventarc.eventReceiver"
  member  = "serviceAccount:${google_service_account.copy_server_runner.email}"
  project = var.project_name
}

resource "terraform_data" "trigger_bucket" {
  input = google_storage_bucket.maven_bucket.name
}

resource "google_eventarc_trigger" "copy_server" {
  name            = "${google_cloud_run_v2_service.copy_server.name}-trigger"
  location        = google_cloud_run_v2_service.copy_server.location
  service_account = google_service_account.copy_server_runner.email
  matching_criteria {
    attribute = "type"
    value     = "google.cloud.storage.object.v1.finalized"
  }
  matching_criteria {
    attribute = "bucket"
    value     = terraform_data.trigger_bucket.output
  }
  destination {
    cloud_run_service {
      service = google_cloud_run_v2_service.copy_server.name
      region  = google_cloud_run_v2_service.copy_server.location
      path    = "/post"
    }
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
