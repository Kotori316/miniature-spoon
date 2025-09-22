variable "project_name" {
  type    = string
  default = "kotori316-mods-resources"
}

variable "cloudflare_zone_name" {
  type    = string
  default = "kotori316.com"
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "base_name" {
  type    = string
  default = "reposilite-server"
}

variable "reposilite_image" {
  type    = string
  default = "docker.io/dzikoysk/reposilite:3.5.26"
}

variable "domain" {
  type    = string
  default = "maven2.kotori316.com"
}
