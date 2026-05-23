data "aws_iam_policy_document" "task_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "task_exec" {
  name               = "${var.project}-${var.env}-task-exec"
  assume_role_policy = data.aws_iam_policy_document.task_assume.json
}

resource "aws_iam_role_policy_attachment" "exec_policy" {
  role       = aws_iam_role.task_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "exec_secrets" {
  role       = aws_iam_role.task_exec.name
  policy_arn = aws_iam_policy.secrets_access.arn
}

resource "aws_iam_role" "task_role" {
  name               = "${var.project}-${var.env}-task-role"
  assume_role_policy = data.aws_iam_policy_document.task_assume.json
}

locals {
  secrets_prefix = coalesce(var.secrets_path_prefix, "${var.project}/${var.env}")
}

data "aws_iam_policy_document" "secrets_access" {
  statement {
    actions = ["secretsmanager:GetSecretValue"]
    resources = [
      "arn:aws:secretsmanager:${var.region}:${var.account_id}:secret:${local.secrets_prefix}"
    ]
  }
}

resource "aws_iam_policy" "secrets_access" {
  name   = "${var.project}-${var.env}-secrets"
  policy = data.aws_iam_policy_document.secrets_access.json
}

resource "aws_iam_role_policy_attachment" "attach_secrets" {
  role       = aws_iam_role.task_role.name
  policy_arn = aws_iam_policy.secrets_access.arn
}
