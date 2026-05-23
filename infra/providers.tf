provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Project = var.project
      Env     = local.env
      Managed = "terraform"
    }
  }
  profile = var.profile
}

locals {
  env = terraform.workspace == "prod" ? "prod" : "development"

  primary_subdomain   = local.env == "prod" ? var.primary_subdomain_prod : var.primary_subdomain_dev
  secondary_subdomain = local.env == "prod" ? var.secondary_subdomain_prod : var.secondary_subdomain_dev

  primary_fqdn   = "${local.primary_subdomain}.${var.primary_domain_root}"
  secondary_fqdn = "${local.secondary_subdomain}.${var.secondary_domain_root}"

  # --- NUEVO ---
  enable_nat = local.env == "prod" ? true : false

  # Capacidades por entorno
  asg_min = local.env == "prod" ? 1 : 1
  asg_max = local.env == "prod" ? 4 : 2

  # VPCE solo en prod 
  enable_vpce = local.env == "prod"

  # En dev, usar subredes públicas + IP pública en las tareas
  use_public_subnets_for_tasks = local.env != "prod"

  desired_count = local.env == "prod" ? var.desired_count : 1
}
