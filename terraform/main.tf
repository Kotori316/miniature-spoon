terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }

  backend "gcs" {
    bucket = "kotori316-tf-state"
    prefix = "miniature-spoon-terraform"
  }
  required_version = "~> 1.6"
}

provider "google" {
  project = var.project_name
}

data "google_secret_manager_secret_version" "cloudflare_token" {
  secret = "cloudflare_token"
}

provider "cloudflare" {
  api_token = data.google_secret_manager_secret_version.cloudflare_token.secret_data
}

data "cloudflare_zone" "zone" {
  filter = {
    name = var.cloudflare_zone_name
  }
}

resource "cloudflare_r2_bucket" "maven_bucket" {
  account_id = data.cloudflare_zone.zone.account.id
  name       = var.maven_name
}

resource "cloudflare_r2_bucket" "worker_material" {
  account_id = data.cloudflare_zone.zone.account.id
  name       = "${var.maven_name}-worker-material"
}

resource "cloudflare_worker" "main" {
  account_id = data.cloudflare_zone.zone.account.id
  name       = "${var.maven_name}-worker"
  logpush    = false

  observability = {
    enabled            = true
    head_sampling_rate = 1
    logs = {
      enabled            = true
      head_sampling_rate = 1
      invocation_logs    = true
    }
  }

  subdomain = {
    enabled          = false
    previews_enabled = false
  }
}

resource "cloudflare_workers_custom_domain" "main" {
  account_id = data.cloudflare_zone.zone.account.id
  hostname   = "maven.${var.cloudflare_zone_name}"
  service    = cloudflare_worker.main.name
  zone_id    = data.cloudflare_zone.zone.id
  # noinspection HCLDeprecatedElement
  environment = "production"
}
