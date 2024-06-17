
resource "google_storage_bucket" "setting_bucket" {
  name                        = "kotori316-reposilite-setting"
  location                    = var.region
  uniform_bucket_level_access = true
}

import {
  id = "kotori316-maven-storage"
  to = google_storage_bucket.maven_bucket
}

resource "google_storage_bucket" "maven_bucket" {
  name     = "kotori316-maven-storage"
  location = var.region

  soft_delete_policy {
    retention_duration_seconds = 7 * (60 * 60 * 24)
  }
  autoclass {
    enabled                = true
    terminal_storage_class = "ARCHIVE"
  }
}

import {
  id = "kotori316-maven-test-storage"
  to = google_storage_bucket.maven_test_bucket
}

resource "google_storage_bucket" "maven_test_bucket" {
  name     = "kotori316-maven-test-storage"
  location = var.region

  soft_delete_policy {
    retention_duration_seconds = 7 * (60 * 60 * 24)
  }
  autoclass {
    enabled                = true
    terminal_storage_class = "ARCHIVE"
  }
}

locals {
  maven_buckets = [
    google_storage_bucket.maven_bucket,
    google_storage_bucket.maven_test_bucket,
  ]
  buckets = setunion(
    local.maven_buckets,
    [
      google_storage_bucket.setting_bucket
    ]
  )
}

resource "google_storage_bucket_iam_member" "main" {
  for_each = {
    for b in local.buckets : b.name => b
  }
  bucket = each.key
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.runner.email}"
}

resource "google_pubsub_topic" "maven" {
  for_each = {
    for b in local.maven_buckets : b.name => b
  }
  name = "${each.key}-topic"
}

resource "google_storage_notification" "maven" {
  for_each = {
    for b in local.maven_buckets : b.name => b
  }
  topic          = google_pubsub_topic.maven[each.key].name
  bucket         = each.key
  payload_format = "JSON_API_V1"
  event_types    = ["OBJECT_FINALIZE"]
  # Need valid publish IAM permission to create resources
  depends_on = [google_project_iam_member.pubsub_publish]
}

data "google_storage_project_service_account" "main" {
}

resource "google_project_iam_member" "pubsub_publish" {
  project = var.project_name
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${data.google_storage_project_service_account.main.email_address}"
}
