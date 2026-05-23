output "alb_dns_name" {
  value = aws_lb.public.dns_name
}
output "alb_zone_id" {
  value = aws_lb.public.zone_id
}
output "alb_sg_id" {
  value = aws_security_group.alb.id
}
output "target_group_arn" {
  value = aws_lb_target_group.tg.arn
}
output "primary_fqdn" {
  value = local.primary_fqdn
}
output "secondary_fqdn" {
  value = local.secondary_fqdn
}
