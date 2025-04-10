resource "random_password" "admin_password" {
  length = 32
}

resource "google_cloud_run_v2_service" "main" {
  location = var.region
  name     = "${var.base_name}-run"
  ingress  = "INGRESS_TRAFFIC_ALL"
  custom_audiences = [
    "https://${var.domain}"
  ]

  template {
    service_account                  = google_service_account.runner.email
    max_instance_request_concurrency = 100
    containers {
      image = var.reposilite_image
      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
        cpu_idle = true
      }
      // initial only
      /*env {
        name  = "REPOSILITE_OPTS"
        value = "--token admin:${random_password.admin_password.result}"
      }*/
      volume_mounts {
        name       = google_storage_bucket.setting_bucket.name
        mount_path = "/app/data"
      }
      env {
        name  = "NO_COLOR"
        value = "true"
      }
      // https://docs.aws.amazon.com/sdkref/latest/guide/feature-dataintegrity.html
      env {
        name  = "AWS_REQUEST_CHECKSUM_CALCULATION"
        value = "WHEN_REQUIRED"
      }
      env {
        name  = "AWS_RESPONSE_CHECKSUM_VALIDATION"
        value = "WHEN_REQUIRED"
      }
    }
    volumes {
      name = google_storage_bucket.setting_bucket.name
      gcs {
        bucket    = google_storage_bucket.setting_bucket.name
        read_only = false
      }
    }
  }

  depends_on = [google_project_iam_member.runner_secret]

  lifecycle {
    ignore_changes = [client]
  }
}

resource "google_cloud_run_v2_service_iam_binding" "main" {
  name     = google_cloud_run_v2_service.main.name
  members  = ["allUsers"]
  role     = "roles/run.invoker"
  location = google_cloud_run_v2_service.main.location
}

resource "google_cloud_run_domain_mapping" "mapping" {
  location = var.region
  name     = var.domain
  metadata {
    namespace = var.project_name
  }
  spec {
    route_name = google_cloud_run_v2_service.main.name
  }
}

data "cloudflare_zone" "zone" {
  filter = {
    name = var.cloudflare_zone_name
  }
}

locals {
  dns_data = google_cloud_run_domain_mapping.mapping.status[0]["resource_records"][0]
}

resource "cloudflare_dns_record" "records" {
  name    = "${local.dns_data["name"]}.${var.cloudflare_zone_name}"
  type    = local.dns_data["type"]
  zone_id = data.cloudflare_zone.zone.zone_id
  proxied = false
  ttl     = 1

  content = (local.dns_data["type"] == "CNAME"
    # Remove last period
    ? substr(local.dns_data["rrdata"], 0, length(local.dns_data["rrdata"]) - 1)
    # Use the raw value
  : local.dns_data["rrdata"])
}
