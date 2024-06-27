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
  ])
}

resource "google_project_iam_member" "copy_flow" {
  for_each = local.copy_flow_roles
  role     = each.key
  member   = "serviceAccount:${google_service_account.copy_flow_runner.email}"
  project  = var.project_name
}

resource "google_project_iam_custom_role" "job_runner" {
  role_id     = replace("${var.base_name}-job-runner", "-", "_")
  title       = "${var.base_name}-job-runner"
  description = "Run with Override for ${var.base_name}"
  permissions = [
    "run.jobs.run",
    "run.jobs.runWithOverrides",
    "run.executions.get",
  ]
}

resource "google_cloud_run_v2_job_iam_binding" "copy_flow" {
  role     = google_project_iam_custom_role.job_runner.id
  members  = ["serviceAccount:${google_service_account.copy_flow_runner.email}"]
  name     = google_cloud_run_v2_job.copy_task.name
  project  = google_cloud_run_v2_job.copy_task.project
  location = google_cloud_run_v2_job.copy_task.location
}

resource "google_cloud_tasks_queue_iam_binding" "caller" {
  role = "roles/cloudtasks.enqueuer"
  members  = ["serviceAccount:${google_service_account.copy_flow_runner.email}"]
  name = google_cloud_tasks_queue.copy_flow_buffer.name
  project = google_cloud_tasks_queue.copy_flow_buffer.project
  location = google_cloud_tasks_queue.copy_flow_buffer.location
}
