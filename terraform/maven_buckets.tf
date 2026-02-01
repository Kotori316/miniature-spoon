module "maven_bucket_main" {
  source     = "./maven_bucket"
  account_id = data.cloudflare_zone.zone.account.id
  name       = "${var.maven_name}-r2"
}

module "maven_bucket_test" {
  source     = "./maven_bucket"
  account_id = data.cloudflare_zone.zone.account.id
  name       = "${var.maven_name}-r2-test"
}
