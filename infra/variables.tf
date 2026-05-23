variable "project" { type = string }

variable "profile" {
  type    = string
  default = null
}

variable "region" {
  type    = string
  default = "us-west-2"
}

variable "account_id" {
  type = string
}

variable "primary_domain_root" {
  type = string
}

variable "primary_zone_id" {
  type = string
}

variable "secondary_domain_root" {
  type = string
}

variable "primary_subdomain_prod" {
  type    = string
  default = "main"
}

variable "primary_subdomain_dev" {
  type    = string
  default = "dev"
}

variable "secondary_subdomain_prod" {
  type    = string
  default = "api"
}

variable "secondary_subdomain_dev" {
  type    = string
  default = "api-dev"
}

variable "cpu" {
  type    = number
  default = 256
}

variable "memory" {
  type    = number
  default = 512
}

variable "desired_count" {
  type    = number
  default = 1
}

variable "container_port" {
  type    = number
  default = 3000
}

variable "image_tag" {
  type    = string
  default = "latest"
}

variable "secrets_path_prefix" {
  type    = string
  default = null
}
