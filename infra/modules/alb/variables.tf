variable "project" {
  type = string
}
variable "env" {
  type = string
}
variable "region" {
  type = string
}
variable "vpc_id" {
  type = string
}
variable "public_subnet_ids" {
  type = list(string)
}
variable "container_port" {
  type = number
}

variable "primary_domain_root" {
  type = string
}
variable "primary_zone_id" {
  type = string
}
variable "primary_subdomain" {
  type = string
}
variable "secondary_domain_root" {
  type = string
}
