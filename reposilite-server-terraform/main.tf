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

resource "google_storage_bucket" "setting_bucket" {
  name     = "kotori316-reposilite-setting"
  location = "us-central1"
}

import {
  id = "kotori316-maven-storage"
  to = google_storage_bucket.maven_bucket
}

resource "google_storage_bucket" "maven_bucket" {
  name     = "kotori316-maven-storage"
  location = "us-central1"

  soft_delete_policy {
    retention_duration_seconds = 7 * (60 * 60 * 24)
  }
}
