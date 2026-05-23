output "vpc_id" {
  value = aws_vpc.this.id
}
output "public_subnet_ids" {
  value = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}
output "private_subnet_ids" {
  value = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}

# Dev → null ; Prod → IP pública del NAT
output "nat_eip" {
  value = var.enable_nat ? aws_eip.nat[0].public_ip : null
}
