variable "cloudflare_token" {
  type = string
}

variable "cloudflare_zone_name" {
  type    = string
  default = "kotori316.com"
}

variable "maven_name" {
  type    = string
  default = "kotori316-maven"
}

variable "github_owner" {
  type    = string
  default = "Kotori316"
}

variable "github_repo" {
  type    = string
  default = "miniature-spoon"
}
