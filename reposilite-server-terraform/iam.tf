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
    "roles/secretmanager.secretAccessor",
    "roles/workflows.invoker", // Terraform doesn't support Workflows iam
    google_project_iam_custom_role.firestore_adder.name,
  ])
}

resource "google_project_iam_member" "copy_flow" {
  for_each = local.copy_flow_roles
  role     = each.key
  member   = "serviceAccount:${google_service_account.copy_flow_runner.email}"
  project  = var.project_name
}

resource "google_project_iam_custom_role" "firestore_adder" {
  role_id     = replace("firestore.${var.base_name}.adder", "-", "_")
  title       = "Firestore Adder for ${var.base_name}"
  description = "Add Firestore data only. For ${var.base_name}"
  permissions = [
    "datastore.entities.allocateIds",
    "datastore.entities.create",
    "datastore.entities.delete",
    "datastore.entities.get",
    "datastore.entities.list",
    "datastore.entities.update",
  ]
}

resource "google_cloud_run_v2_job_iam_member" "copy_task" {
  name     = google_cloud_run_v2_job.copy_task.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.copy_flow_runner.email}"
  project  = var.project_name
  location = google_cloud_run_v2_job.copy_task.location
}
