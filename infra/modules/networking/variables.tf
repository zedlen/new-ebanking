variable "project" {
  type = string
}
variable "env" {
  type = string
}
variable "region" {
  type = string
}
variable "enable_nat" {
  type    = bool
  default = true
}

variable "enable_vpce" {
  type    = bool
  default = true
}
