resource "cloudflare_r2_bucket" "main" {
  account_id = var.account_id
  name       = var.name
}

resource "cloudflare_r2_bucket_lifecycle" "main" {
  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.main.name
  rules = [
    {
      id      = "delete-multipart-uploads"
      enabled = true
      conditions = {
        prefix = ""
      }
      abort_multipart_uploads_transition = {
        condition = {
          type    = "Age"
          max_age = 24 * 60 * 60 # seconds
        }
      }
    }
  ]
}
