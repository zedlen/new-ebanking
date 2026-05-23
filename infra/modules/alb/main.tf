data "aws_acm_certificate" "primary" {
  domain      = "*.${var.primary_domain_root}"
  statuses    = ["ISSUED"]
  most_recent = true
}

data "aws_acm_certificate" "secondary" {
  domain      = "*.${var.secondary_domain_root}"
  statuses    = ["ISSUED"]
  most_recent = true
}

resource "aws_security_group" "alb" {
  name   = "${var.project}-${var.env}-alb-sg"
  vpc_id = var.vpc_id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "public" {
  name               = "${var.project}-${var.env}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids
  idle_timeout       = 400
}

resource "aws_lb_target_group" "tg" {
  name        = "${var.project}-${var.env}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
  health_check {
    path                = "/api/health"
    matcher             = "200-399"
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.public.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type = "redirect"
    redirect {
      status_code = "HTTP_301"
      protocol    = "HTTPS"
      port        = "443"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.public.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = data.aws_acm_certificate.primary.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}

resource "aws_lb_listener_certificate" "secondary" {
  listener_arn    = aws_lb_listener.https.arn
  certificate_arn = data.aws_acm_certificate.secondary.arn
}

# Route53 record for PRIMARY domain only
data "aws_route53_zone" "primary" {
  zone_id = var.primary_zone_id
}

locals {
  primary_fqdn   = "${var.primary_subdomain}.${var.primary_domain_root}"
  secondary_fqdn = "${var.primary_subdomain}.${var.secondary_domain_root}"
}

resource "aws_route53_record" "primary_app_dns" {
  zone_id         = data.aws_route53_zone.primary.zone_id
  name            = local.primary_fqdn
  type            = "A"
  allow_overwrite = true
  alias {
    name                   = aws_lb.public.dns_name
    zone_id                = aws_lb.public.zone_id
    evaluate_target_health = false
  }
}
