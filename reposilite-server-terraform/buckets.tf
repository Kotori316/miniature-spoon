
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
}

locals {
  buckets = [
    google_storage_bucket.maven_bucket,
    google_storage_bucket.setting_bucket,
    google_storage_bucket.maven_test_bucket,
  ]
}

resource "google_storage_bucket_iam_member" "main" {
  for_each = {
    for b in local.buckets : b.name => b
  }
  bucket = each.key
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.runner.email}"
}
