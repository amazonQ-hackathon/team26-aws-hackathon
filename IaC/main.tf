terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# API Gateway
resource "aws_api_gateway_rest_api" "house_finder_api" {
  name        = "house-finder-api"
  description = "소심하지만 집은 구하고 싶어 API"
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "house_finder_deployment" {
  depends_on = [
    aws_api_gateway_integration.filters_post,
    aws_api_gateway_integration.filters_get,
    aws_api_gateway_integration.filters_delete,
    aws_api_gateway_integration.matches_get,
    aws_api_gateway_integration.filter_history_get,
    aws_api_gateway_integration.filters_parse_post
  ]

  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  stage_name  = "prod"
}

# DynamoDB Tables
resource "aws_dynamodb_table" "users" {
  name           = "users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  deletion_protection_enabled = false  # 개발용이므로 false

  attribute {
    name = "userId"
    type = "N"
  }

  tags = {
    Name = "house-finder-users"
  }
}

resource "aws_dynamodb_table" "user_filters" {
  name           = "user_filters"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  range_key      = "filterId"
  deletion_protection_enabled = false  # 개발용이므로 false

  attribute {
    name = "userId"
    type = "N"
  }

  attribute {
    name = "filterId"
    type = "N"
  }

  tags = {
    Name = "house-finder-user-filters"
  }
}

resource "aws_dynamodb_table" "properties" {
  name           = "properties"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "propertyId"
  deletion_protection_enabled = false  # 개발용이므로 false

  attribute {
    name = "propertyId"
    type = "S"
  }

  tags = {
    Name = "house-finder-properties"
  }
}

resource "aws_dynamodb_table" "user_filter_matches" {
  name           = "user_filter_matches"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  range_key      = "matchId"
  deletion_protection_enabled = false  # 개발용이므로 false

  attribute {
    name = "userId"
    type = "N"
  }

  attribute {
    name = "matchId"
    type = "S"
  }

  attribute {
    name = "filterId"
    type = "S"
  }

  attribute {
    name = "matchedAt"
    type = "S"
  }

  global_secondary_index {
    name     = "filterId-matchedAt-index"
    hash_key = "filterId"
    range_key = "matchedAt"
    projection_type = "ALL"
  }

  tags = {
    Name = "house-finder-user-filter-matches"
  }
}

# SNS Topic for Push Notifications
resource "aws_sns_topic" "house_notifications" {
  name = "house-notifications"
}

# S3 Bucket for temporary audio files
resource "aws_s3_bucket" "temp_audio_bucket" {
  bucket = "house-finder-temp-audio-${random_string.bucket_suffix.result}"
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_s3_bucket_lifecycle_configuration" "temp_audio_lifecycle" {
  bucket = aws_s3_bucket.temp_audio_bucket.id

  rule {
    id     = "delete_temp_files"
    status = "Enabled"

    expiration {
      days = 1
    }
  }
}

# EventBridge Rule for Crawling
resource "aws_cloudwatch_event_rule" "crawling_schedule" {
  name                = "house-finder-crawling"
  description         = "Trigger crawling every 1 minute"
  schedule_expression = "rate(1 minute)"
}