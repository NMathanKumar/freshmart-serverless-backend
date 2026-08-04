resource "aws_s3_bucket_logging" "this" {
  count = var.logging_bucket_id != "" ? 1 : 0

  bucket        = aws_s3_bucket.this.id
  target_bucket = var.logging_bucket_id
  target_prefix = "s3-access-logs/${var.app_name}/"
}
