resource "google_service_account" "runner" {
  account_id = "${var.base_name}-runner"
  disabled   = false
  timeouts {}
}

resource "google_project_iam_member" "runner_secret" {
  project = var.project_name
  member  = "serviceAccount:${google_service_account.runner.email}"
  role    = "roles/secretmanager.secretAccessor"
}

resource "google_service_account" "copy_flow_runner" {
  account_id = "storage-copy-workflows-runner"
}

locals {
  copy_flow_roles = toset([
    "roles/eventarc.eventReceiver",
    "roles/logging.logWriter",
    "roles/cloudbuild.builds.builder",
    "roles/secretmanager.secretAccessor",
    "roles/workflows.invoker", // Terraform doesn't support Workflows iam
  ])
}

resource "google_project_iam_member" "copy_flow" {
  for_each = local.copy_flow_roles
  role     = each.key
  member   = "serviceAccount:${google_service_account.copy_flow_runner.email}"
  project  = var.project_name
}
