module "networking" {
  source     = "./modules/networking"
  project    = var.project
  env        = local.env
  region     = var.region
  enable_nat = local.enable_nat

  enable_vpce = local.enable_vpce
}

module "ecr" {
  source  = "./modules/ecr"
  project = var.project
  env     = local.env
  region  = var.region
}

module "iam" {
  source              = "./modules/iam"
  project             = var.project
  env                 = local.env
  region              = var.region
  account_id          = var.account_id
  secrets_path_prefix = var.secrets_path_prefix
}

module "logs" {
  source  = "./modules/logs"
  project = var.project
  env     = local.env
  region  = var.region
}

module "alb" {
  source            = "./modules/alb"
  project           = var.project
  env               = local.env
  region            = var.region
  vpc_id            = module.networking.vpc_id
  public_subnet_ids = module.networking.public_subnet_ids
  container_port    = var.container_port

  primary_domain_root = var.primary_domain_root
  primary_zone_id     = var.primary_zone_id
  primary_subdomain   = local.primary_subdomain

  secondary_domain_root = var.secondary_domain_root
}

module "redis" {
  source             = "./modules/redis"
  project            = var.project
  env                = local.env
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
}

module "postgres" {
  source = "./modules/postgres"

  project = var.project
  env     = local.env

  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids

  # Only allow Postgres inbound from ECS tasks
  allowed_security_group_id = module.ecs.service_security_group_id
}

resource "aws_secretsmanager_secret" "redis_uri" {
  name = "${module.iam.secrets_prefix}/REDIS_URI"
}

resource "aws_secretsmanager_secret_version" "redis_uri" {
  secret_id     = aws_secretsmanager_secret.redis_uri.id
  secret_string = module.redis.redis_uri
}

resource "aws_secretsmanager_secret" "pgdb_uri" {
  name = "${module.iam.secrets_prefix}/PGDB_URI"
}

resource "aws_secretsmanager_secret_version" "pgdb_uri" {
  secret_id     = aws_secretsmanager_secret.pgdb_uri.id
  secret_string = module.postgres.uri
}

module "ecs" {
  source     = "./modules/ecs"
  project    = var.project
  env        = local.env
  region     = var.region
  account_id = var.account_id

  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  public_subnet_ids  = module.networking.public_subnet_ids
  alb_sg_id          = module.alb.alb_sg_id
  container_port     = var.container_port

  ecr_repository_url = module.ecr.repository_url
  image_tag          = var.image_tag
  cpu                = var.cpu
  memory             = var.memory
  desired_count      = local.desired_count

  log_group_name     = module.logs.log_group_name
  task_exec_role_arn = module.iam.task_exec_role_arn
  task_role_arn      = module.iam.task_role_arn

  target_group_arn = module.alb.target_group_arn
  secrets_prefix   = module.iam.secrets_prefix

  asg_min_capacity = local.asg_min
  asg_max_capacity = local.asg_max

  use_public_subnets = local.use_public_subnets_for_tasks

  redis_uri_secret_arn = aws_secretsmanager_secret.redis_uri.arn
  pgdb_uri_secret_arn  = aws_secretsmanager_secret.pgdb_uri.arn

  # Deprecated direct env wiring (kept for backwards compat in module vars)
  redis_uri = module.redis.redis_uri
  pgdb_uri  = module.postgres.uri
}
