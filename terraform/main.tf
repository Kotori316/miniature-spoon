terraform {
  required_providers {
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

provider "cloudflare" {
  api_token = var.cloudflare_token
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
  value   = cloudflare_pages_project.main.subdomain
  proxied = true
  ttl     = 1
}

resource "cloudflare_worker_script" "snapshot_delete" {
  account_id = data.cloudflare_zone.zone.account_id
  name       = "snapshot_delete"
  module     = true
  content    = <<-EOF
    export default {
      async scheduled(event, env, ctx) {
        console.log("Hello scheduler at " + event.scheduledTime);
      },
    };
    EOF
  tags       = []
  r2_bucket_binding {
    bucket_name = "kotori316-maven"
    name        = "MAVEN_BUCKET"
  }
  plain_text_binding {
    name = "ENVIRONMENT"
    text = "production"
  }
  compatibility_date  = "2024-05-02"
  compatibility_flags = ["nodejs_compat"]
}

resource "cloudflare_worker_cron_trigger" "snapshot_delete" {
  account_id  = data.cloudflare_zone.zone.account_id
  script_name = cloudflare_worker_script.snapshot_delete.name
  schedules   = ["35 3 */7 * *"]
}
