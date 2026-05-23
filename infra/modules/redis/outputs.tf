output "redis_uri" {
  value = "redis://${aws_elasticache_replication_group.this.primary_endpoint_address}:6379"
}
