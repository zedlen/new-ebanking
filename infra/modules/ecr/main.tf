resource "aws_ecr_repository" "app" {
  name                 = "${var.project}-${var.env}"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  tags = { Name = "${var.project}-${var.env}-ecr" }
}

resource "aws_ecr_lifecycle_policy" "keep10" {
  repository = aws_ecr_repository.app.name
  policy     = file("${path.module}/lifecycle.json")
}
