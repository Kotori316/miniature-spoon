provider "github" {
  owner = var.github_owner
}

data "github_repository" "repo" {
  full_name = "${var.github_owner}/${var.github_repo}"
}

resource "github_repository_environment" "workers_env" {
  environment = "workers"
  repository  = data.github_repository.repo.name
  deployment_branch_policy {
    custom_branch_policies = true
    protected_branches     = false
  }
}

resource "github_repository_environment_deployment_policy" "policy" {
  branch_pattern = "main"
  environment    = github_repository_environment.workers_env.environment
  repository     = data.github_repository.repo.name
}

resource "github_repository_environment" "workers_preview" {
  environment = "workers_preview"
  repository  = data.github_repository.repo.name
}
