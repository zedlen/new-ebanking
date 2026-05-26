output "https_url_primary" {
  value = "https://${local.primary_fqdn}"
}

output "https_url_secondary" {
  value = "https://${local.secondary_fqdn}"
}

output "alb_dns" {
  value = module.alb.alb_dns_name
}

output "egress_ip" {
  value = module.networking.nat_eip
}

output "ecr_repo_url" {
  value = module.ecr.repository_url
}

output "cluster_name" {
  value = module.ecs.cluster_name
}

output "service_name" {
  value = module.ecs.service_name
}

output "postgres_address" {
  value = module.postgres.address
}

output "postgres_port" {
  value = module.postgres.port
}

output "postgres_db_name" {
  value = module.postgres.db_name
}

output "postgres_username" {
  value = module.postgres.username
}

output "postgres_password" {
  value     = module.postgres.password
  sensitive = true
}

output "postgres_uri" {
  value     = module.postgres.uri
  sensitive = true
}
