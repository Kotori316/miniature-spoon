terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.6.3"
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
