terraform {
  backend "s3" {
    bucket         = "ebanking-terraform-state"
    key            = "infra/terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "terraform-locks" # ⚠️ deprecated warning
    encrypt        = true
  }
}
