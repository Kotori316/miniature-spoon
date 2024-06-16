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
