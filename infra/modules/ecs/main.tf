locals {
  selected_subnets = var.use_public_subnets ? var.public_subnet_ids : var.private_subnet_ids
}

resource "aws_security_group" "svc" {
  name   = "${var.project}-${var.env}-svc-sg"
  vpc_id = var.vpc_id
  ingress {
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [var.alb_sg_id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_cluster" "this" {
  name = "${var.project}-${var.env}-cluster"
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.project}-${var.env}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.task_exec_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([
    {
      "name" : "app",
      "image" : "${var.ecr_repository_url}:${var.image_tag}",
      "essential" : true,
      "portMappings" : [{
        "containerPort" : "${var.container_port}",
        "hostPort" : "${var.container_port}",
        "protocol" : "tcp"
      }],
      "logConfiguration" : {
        "logDriver" : "awslogs",
        "options" : {
          "awslogs-group" : "${var.log_group_name}",
          "awslogs-region" : "${var.region}",
          "awslogs-stream-prefix" : "app"
        }
      },
      "environment" : [
        { "name" : "NODE_ENV", "value" : var.env == "prod" ? "production" : "development" },
        {
          "name" : "SECRET_KEY",
          "value" : "6D73BA9299F16F711BA1492172A4C"
        },
        {
          "name" : "JWT_SECRET",
          "value" : "GrKf4CmzWpdL9fN4QCd1uAixRFuMNXJ5"
        },
        {
          "name" : "SESSION_LIFE_TIME",
          "value" : "3600000"
        },
        {
          "name" : "ALLOWED_ORIGINS",
          "value" : var.env == "prod" ? local.prod_domains : local.dev_domains
        },
        {
          "name" : "SERVER_URL",
          "value" : "http://cdn.ebanking-service.net"
        },
        {
          "name" : "COOKIES_TOKEN_INDEX",
          "value" : "7Iq6PFV181p4PNjoc4jEGakA7tq8TZmp"
        },
        {
          "name" : "LOG_LEVEL",
          "value" : "debug"
        },
        {
          "name" : "PORT",
          "value" : "3000"
        },
        {
          "name" : "APPS_TO_SYNC",
          "value" : "livingrock"
        },
        {
          "name" : "FRONTEND_URL",
          "value" : var.env == "prod" ? "https://onboarding.livingrock.mx" : "https://onboarding-dev.livingrock.mx"
        }
      ],
      "secrets" : [
        {
          "name" : "REDIS_URI",
          "valueFrom" : var.redis_uri_secret_arn
        },
        {
          "name" : "PGDB_URI",
          "valueFrom" : var.pgdb_uri_secret_arn
        },
        {
          "name" : "USER_FOR_SYNC_LIVINGROCK",
        "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:USER_FOR_SYNC::" },
        {
          "name" : "PASS_FOR_SYNC_LIVINGROCK",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:PASS_FOR_SYNC::"
        },
        {
          "name" : "URL_FOR_SYNC_LIVINGROCK",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:URL_FOR_SYNC::"
        },
        {
          "name" : "KEY_FOR_SYNC_LIVINGROCK",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:KEY_FOR_SYNC::"
        },
        {
          "name" : "USER_FOR_SYNC_XECORA",
        "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:USER_FOR_SYNC_XECORA::" },
        {
          "name" : "PASS_FOR_SYNC_XECORA",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:PASS_FOR_SYNC_XECORA::"
        },
        {
          "name" : "URL_FOR_SYNC_XECORA",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:URL_FOR_SYNC_XECORA::"
        },
        {
          "name" : "KEY_FOR_SYNC_XECORA",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:KEY_FOR_SYNC_XECORA::"
        },
        {
          "name" : "API_LAYER_KEY",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:API_LAYER_KEY::"
        },
        {
          "name" : "SENTRY_DNS",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:SENTRY_DNS::"
        },
        {
          "name" : "RESEND_API_TOKEN_LIVINGROCK",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:RESEND_API_TOKEN_LIVINGROCK::"
        },
        {
          "name" : "RESEND_API_TOKEN_MIDDLEWARE",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:RESEND_API_TOKEN_MIDDLEWARE::"
        },
        {
          "name" : "CLERK_SECRET_KEY",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:CLERK_SECRET_KEY::"
        },
        {
          "name" : "RESEND_API_TOKEN",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:RESEND_API_TOKEN::"
        },
        {
          "name" : "CLERK_PUBLISHABLE_KEY",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:CLERK_PUBLISHABLE_KEY::"
        },
        {
          "name" : "DB_URI",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:DB_URI::"
        },
        {
          "name" : "AZURE_TENANT_ID",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:AZURE_TENANT_ID::"
        },
        {
          "name" : "AZURE_CLIENT_ID",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:AZURE_CLIENT_ID::"
        },
        {
          "name" : "AZURE_CLIENT_SECRET",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:AZURE_CLIENT_SECRET::"
        },
        {
          "name" : "SHAREPOINT_SITE_ID",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:SHAREPOINT_SITE_ID::"
        },
        {
          "name" : "SHAREPOINT_DRIVE_ID",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:SHAREPOINT_DRIVE_ID::"
        },
        {
          "name" : "SHAREPOINT_FOLDER_PATH",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:SHAREPOINT_FOLDER_PATH::"
        },
        {
          "name" : "ONBOARDING_API_KEY",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:ONBOARDING_API_KEY::"
        },
        {
          "name" : "DIDIT_WORKFLOW_ID",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:DIDIT_WORKFLOW_ID::"
        },
        {
          "name" : "DIDIT_API_KEY",
          "valueFrom" : "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${var.secrets_prefix}:DIDIT_API_KEY::"
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "app" {
  name            = "${var.project}-${var.env}-svc"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = local.selected_subnets
    security_groups  = [aws_security_group.svc.id]
    assign_public_ip = var.use_public_subnets
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = "app"
    container_port   = var.container_port
  }

  lifecycle {
    # ignore_changes = [task_definition]
  }
}

# Application Auto Scaling target for ECS service DesiredCount
resource "aws_appautoscaling_target" "svc" {
  max_capacity       = var.asg_max_capacity
  min_capacity       = var.asg_min_capacity
  resource_id        = "service/${aws_ecs_cluster.this.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# Target tracking (CPU 90%)
resource "aws_appautoscaling_policy" "cpu_target" {
  name               = "${var.project}-${var.env}-cpu90"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.svc.resource_id
  scalable_dimension = aws_appautoscaling_target.svc.scalable_dimension
  service_namespace  = aws_appautoscaling_target.svc.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 90
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    scale_in_cooldown  = 60
    scale_out_cooldown = 60
  }
}

# Target tracking (Memory 90%)
resource "aws_appautoscaling_policy" "memory_target" {
  name               = "${var.project}-${var.env}-memory90"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.svc.resource_id
  scalable_dimension = aws_appautoscaling_target.svc.scalable_dimension
  service_namespace  = aws_appautoscaling_target.svc.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 90
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    scale_in_cooldown  = 60
    scale_out_cooldown = 60
  }
}

locals {
  dev_domains  = "[[\"\\\\.livingrock\\\\.mx$\",\"\"],[\"\\\\.ebanking-service\\\\.net$\",\"\"],\"http://localhost:3000\",\"http://localhost:5173\",\"http://localhost:5174\", [\"\\\\.amplifyapp\\\\.com$\",\"\"],\"https://xecora-lab.kubitpay.com\"]"
  prod_domains = "[[\"\\\\.livingrock\\\\.mx$\",\"\"],[\"\\\\.ebanking-service\\\\.net$\",\"\"],[\"\\\\.xecora\\\\.mx$\",\"\"],[\"\\\\.amplifyapp\\\\.com$\",\"\"]]"
}
