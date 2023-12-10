terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
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

resource "cloudflare_worker_script" "maven_viewer" {
  account_id = data.cloudflare_zone.zone.account_id
  content    = <<EOF
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
async function handleRequest(request) {
  return new Response("No content", {
    status: 400,
    headers: {
      'content-type': 'text/plain',
    },
  });
}
EOF
  name       = var.maven_name

  r2_bucket_binding {
    bucket_name = cloudflare_r2_bucket.maven_bucket.name
    name        = "MAVEN_BUCKET"
  }
}

resource "cloudflare_worker_domain" "maven_viewer" {
  account_id  = data.cloudflare_zone.zone.account_id
  hostname    = "maven.${var.cloudflare_zone_name}"
  service     = cloudflare_worker_script.maven_viewer.name
  zone_id     = data.cloudflare_zone.zone.id
  environment = "production"
}
