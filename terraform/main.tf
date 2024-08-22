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
  name = var.cloudflare_zone_name
}

resource "cloudflare_r2_bucket" "maven_bucket" {
  account_id = data.cloudflare_zone.zone.account_id
  name       = var.maven_name
}

resource "cloudflare_pages_project" "main" {
  account_id        = data.cloudflare_zone.zone.account_id
  name              = "${var.maven_name}-page"
  production_branch = "main"
  deployment_configs {
    preview {
      environment_variables = {
        ENVIRONMENT = "staging"
      }
      r2_buckets = {
        MAVEN_BUCKET = cloudflare_r2_bucket.maven_bucket.name
      }
    }
    production {
      environment_variables = {
        ENVIRONMENT = "production"
      }
      r2_buckets = {
        MAVEN_BUCKET = cloudflare_r2_bucket.maven_bucket.name
      }
    }
  }
  build_config {
    build_caching   = false
    destination_dir = "dist"
  }
}

resource "cloudflare_pages_domain" "main" {
  account_id   = data.cloudflare_zone.zone.account_id
  domain       = "maven.${var.cloudflare_zone_name}"
  project_name = cloudflare_pages_project.main.name
}

resource "cloudflare_record" "page" {
  name    = "maven"
  type    = "CNAME"
  zone_id = data.cloudflare_zone.zone.zone_id
  content = cloudflare_pages_project.main.subdomain
  proxied = true
  ttl     = 1
}
