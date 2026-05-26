variable "project" {
  type = string
}
variable "env" {
  type = string
}
variable "region" {
  type = string
}
variable "account_id" {
  type = string
}

variable "vpc_id" {
  type = string
}
variable "private_subnet_ids" {
  type = list(string)
}
variable "alb_sg_id" {
  type = string
}
variable "container_port" {
  type = number
}

variable "ecr_repository_url" {
  type = string
}
variable "image_tag" {
  type = string
}
variable "cpu" {
  type = number
}
variable "memory" {
  type = number
}
variable "desired_count" {
  type = number
}

variable "log_group_name" {
  type = string
}
variable "task_exec_role_arn" {
  type = string
}
variable "task_role_arn" {
  type = string
}
variable "target_group_arn" {
  type = string
}
variable "secrets_prefix" {
  type = string
}
variable "asg_min_capacity" {
  type    = number
  default = 1
}
variable "asg_max_capacity" {
  type    = number
  default = 4
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "use_public_subnets" {
  type    = bool
  default = false
}

variable "redis_uri" {
  type = string
}

variable "pgdb_uri" {
  type = string
}

variable "redis_uri_secret_arn" {
  type = string
}

variable "pgdb_uri_secret_arn" {
  type = string
}
