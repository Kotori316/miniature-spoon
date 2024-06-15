terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.6.2"
    }
  }

  backend "gcs" {
    bucket = "kotori316-tf-state"
    prefix = "reposilite-server-terraform"
  }
  required_version = "~> 1.6"
}

provider "google" {
  project = var.project_name
  default_labels = {
    "terraform" = true,
    "project"   = "reposilite"
  }
}

data "google_secret_manager_secret_version" "cloudflare_token" {
  secret = "cloudflare_token"
}

provider "cloudflare" {
  api_token = data.google_secret_manager_secret_version.cloudflare_token.secret_data
}

resource "random_password" "admin_password" {
  length = 32
}

resource "google_cloud_run_v2_service" "main" {
  location     = var.region
  name         = "${var.base_name}-run"
  ingress      = "INGRESS_TRAFFIC_ALL"
  launch_stage = "BETA"
  custom_audiences = [
    "https://${var.domain}"
  ]

  template {
    service_account                  = google_service_account.runner.email
    max_instance_request_concurrency = 100
    containers {
      image = var.initial_image
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
      volume_mounts {
        name       = google_storage_bucket.maven_bucket.name
        mount_path = "/maven-resources"
      }
    }
    volumes {
      name = google_storage_bucket.setting_bucket.name
      gcs {
        bucket    = google_storage_bucket.setting_bucket.name
        read_only = false
      }
    }
    volumes {
      name = google_storage_bucket.maven_bucket.name
      gcs {
        bucket    = google_storage_bucket.maven_bucket.name
        read_only = false
      }
    }
  }
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
  name = var.cloudflare_zone_name
}

locals {
  dns_data = google_cloud_run_domain_mapping.mapping.status[0]["resource_records"][0]
}

resource "cloudflare_record" "records" {
  name            = local.dns_data["name"]
  type            = local.dns_data["type"]
  value           = local.dns_data["rrdata"]
  zone_id         = data.cloudflare_zone.zone.zone_id
  proxied         = false
  ttl             = 1
  allow_overwrite = false
}
