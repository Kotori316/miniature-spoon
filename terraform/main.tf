terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
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

data "google_storage_bucket" "maven_storage" {
  name = var.google_storage_name
}

provider "cloudflare" {
  api_token = data.google_secret_manager_secret_version.cloudflare_token.secret_data
}

data "cloudflare_zone" "zone" {
  name = var.cloudflare_zone_name
}

resource "cloudflare_r2_bucket" "maven_bucket" {
  account_id = data.cloudflare_zone.zone.account_id
  name       = var.maven_name
}

resource "cloudflare_r2_bucket" "worker_material" {
  account_id = data.cloudflare_zone.zone.account_id
  name       = "${var.maven_name}-worker-material"
}

resource "cloudflare_workers_script" "main" {
  account_id = data.cloudflare_zone.zone.account_id
  content    = file("initial.js")
  name       = "${var.maven_name}-worker"

  r2_bucket_binding {
    bucket_name = cloudflare_r2_bucket.worker_material.name
    name        = "WORKER_MATERIAL"
  }
  plain_text_binding {
    name = "ENVIRONMENT"
    text = "production"
  }
  plain_text_binding {
    name = "RESOURCE_DOMAIN"
    text = "https://storage.googleapis.com/${data.google_storage_bucket.maven_storage.name}/maven"
  }

  lifecycle {
    ignore_changes = [
      content,
    ]
  }
}

resource "cloudflare_workers_domain" "main" {
  account_id  = data.cloudflare_zone.zone.account_id
  hostname    = "maven.${var.cloudflare_zone_name}"
  service     = cloudflare_workers_script.main.name
  zone_id     = data.cloudflare_zone.zone.id
  environment = "production"
}
