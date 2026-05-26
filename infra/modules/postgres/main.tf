resource "aws_db_subnet_group" "this" {
  name       = "${var.project}-${var.env}-pg-subnet"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project}-${var.env}-pg-subnet"
  }
}

resource "aws_security_group" "db" {
  name        = "${var.project}-${var.env}-pg-sg"
  description = "Postgres: only reachable from ECS service SG"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.allowed_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project}-${var.env}-pg-sg"
  }
}

resource "random_password" "master" {
  length  = 32
  special = true
}

resource "aws_db_instance" "this" {
  identifier = "${var.project}-${var.env}-pg"

  engine         = "postgres"
  instance_class = var.instance_class

  db_name  = var.db_name
  username = var.db_username
  password = random_password.master.result

  allocated_storage = var.allocated_storage_gb
  storage_type      = "gp3"

  port = 5432

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.db.id]

  publicly_accessible = false
  multi_az            = false

  backup_retention_period = var.env == "prod" ? 7 : 0
  deletion_protection     = var.env == "prod"
  skip_final_snapshot     = true

  apply_immediately = true
}

