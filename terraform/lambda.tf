# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "house-finder-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Lambda
resource "aws_iam_role_policy" "lambda_policy" {
  name = "house-finder-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.users.arn,
          aws_dynamodb_table.user_filters.arn,
          aws_dynamodb_table.properties.arn,
          aws_dynamodb_table.user_filter_matches.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.house_notifications.arn
      }
    ]
  })
}

# Lambda Functions
resource "aws_lambda_function" "register_filter" {
  filename         = "registerFilter.zip"
  function_name    = "house-finder-register-filter"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  source_code_hash = filebase64sha256("registerFilter.zip")

  environment {
    variables = {
      USER_FILTERS_TABLE = aws_dynamodb_table.user_filters.name
    }
  }
}

resource "aws_lambda_function" "get_filters" {
  filename         = "../lambda/getFilters.zip"
  function_name    = "house-finder-get-filters"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      USER_FILTERS_TABLE = aws_dynamodb_table.user_filters.name
    }
  }
}

resource "aws_lambda_function" "delete_filter" {
  filename         = "../lambda/deleteFilter.zip"
  function_name    = "house-finder-delete-filter"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      USER_FILTERS_TABLE = aws_dynamodb_table.user_filters.name
    }
  }
}

resource "aws_lambda_function" "get_history" {
  filename         = "../lambda/getHistory.zip"
  function_name    = "house-finder-get-history"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      USER_FILTER_MATCHES_TABLE = aws_dynamodb_table.user_filter_matches.name
      PROPERTIES_TABLE = aws_dynamodb_table.properties.name
    }
  }
}

resource "aws_lambda_function" "crawl_zigbang" {
  filename         = "../lambda/crawlZigbang.zip"
  function_name    = "house-finder-crawl-zigbang"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 300

  environment {
    variables = {
      PROPERTIES_TABLE = aws_dynamodb_table.properties.name
    }
  }
}

# Lambda Permissions for API Gateway
resource "aws_lambda_permission" "register_filter_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.register_filter.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.house_finder_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_filters_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_filters.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.house_finder_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "delete_filter_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_filter.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.house_finder_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_history_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_history.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.house_finder_api.execution_arn}/*/*"
}

# EventBridge Target for Crawling
resource "aws_cloudwatch_event_target" "crawling_target" {
  rule      = aws_cloudwatch_event_rule.crawling_schedule.name
  target_id = "CrawlingLambdaTarget"
  arn       = aws_lambda_function.crawl_zigbang.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.crawl_zigbang.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.crawling_schedule.arn
}