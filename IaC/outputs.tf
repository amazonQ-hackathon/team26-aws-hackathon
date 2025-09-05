output "api_gateway_url" {
  description = "API Gateway URL"
  value       = aws_api_gateway_rest_api.house_finder_api.execution_arn
}

output "api_gateway_invoke_url" {
  description = "API Gateway Invoke URL"
  value       = "https://${aws_api_gateway_rest_api.house_finder_api.id}.execute-api.${var.aws_region}.amazonaws.com"
}

output "dynamodb_tables" {
  description = "DynamoDB table names"
  value = {
    users               = aws_dynamodb_table.users.name
    user_filters        = aws_dynamodb_table.user_filters.name
    properties          = aws_dynamodb_table.properties.name
    user_filter_matches = aws_dynamodb_table.user_filter_matches.name
  }
}

output "sns_topic_arn" {
  description = "SNS Topic ARN for notifications"
  value       = aws_sns_topic.house_notifications.arn
}