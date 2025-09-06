# API Gateway Resources and Methods

# /v1 resource
resource "aws_api_gateway_resource" "v1" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  parent_id   = aws_api_gateway_rest_api.house_finder_api.root_resource_id
  path_part   = "v1"
}

# /v1/filters resource
resource "aws_api_gateway_resource" "filters" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  parent_id   = aws_api_gateway_resource.v1.id
  path_part   = "filters"
}

# POST /v1/filters
resource "aws_api_gateway_method" "filters_post" {
  rest_api_id   = aws_api_gateway_rest_api.house_finder_api.id
  resource_id   = aws_api_gateway_resource.filters.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "filters_post" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  resource_id = aws_api_gateway_resource.filters.id
  http_method = aws_api_gateway_method.filters_post.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.register_filter.invoke_arn
}

# GET /v1/filters
resource "aws_api_gateway_method" "filters_get" {
  rest_api_id   = aws_api_gateway_rest_api.house_finder_api.id
  resource_id   = aws_api_gateway_resource.filters.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "filters_get" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  resource_id = aws_api_gateway_resource.filters.id
  http_method = aws_api_gateway_method.filters_get.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_filters.invoke_arn
}

# /v1/filters/{filterId} resource
resource "aws_api_gateway_resource" "filter_by_id" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  parent_id   = aws_api_gateway_resource.filters.id
  path_part   = "{filterId}"
}

# DELETE /v1/filters/{filterId}
resource "aws_api_gateway_method" "filters_delete" {
  rest_api_id   = aws_api_gateway_rest_api.house_finder_api.id
  resource_id   = aws_api_gateway_resource.filter_by_id.id
  http_method   = "DELETE"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "filters_delete" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  resource_id = aws_api_gateway_resource.filter_by_id.id
  http_method = aws_api_gateway_method.filters_delete.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.delete_filter.invoke_arn
}

# /v1/history resource
resource "aws_api_gateway_resource" "history" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  parent_id   = aws_api_gateway_resource.v1.id
  path_part   = "history"
}

# /v1/history/{filterId} resource
resource "aws_api_gateway_resource" "history_by_filter" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  parent_id   = aws_api_gateway_resource.history.id
  path_part   = "{filterId}"
}

# GET /v1/history/{filterId}
resource "aws_api_gateway_method" "history_get" {
  rest_api_id   = aws_api_gateway_rest_api.house_finder_api.id
  resource_id   = aws_api_gateway_resource.history_by_filter.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "history_get" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  resource_id = aws_api_gateway_resource.history_by_filter.id
  http_method = aws_api_gateway_method.history_get.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_history.invoke_arn
}

# /v1/filters/{filterId}/matches resource
resource "aws_api_gateway_resource" "filter_matches" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  parent_id   = aws_api_gateway_resource.filter_by_id.id
  path_part   = "matches"
}

# GET /v1/filters/{filterId}/matches
resource "aws_api_gateway_method" "matches_get" {
  rest_api_id   = aws_api_gateway_rest_api.house_finder_api.id
  resource_id   = aws_api_gateway_resource.filter_matches.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "matches_get" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  resource_id = aws_api_gateway_resource.filter_matches.id
  http_method = aws_api_gateway_method.matches_get.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_matches.invoke_arn
}

# /v1/filters/{filterId}/history resource
resource "aws_api_gateway_resource" "filter_history" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  parent_id   = aws_api_gateway_resource.filter_by_id.id
  path_part   = "history"
}

# GET /v1/filters/{filterId}/history
resource "aws_api_gateway_method" "filter_history_get" {
  rest_api_id   = aws_api_gateway_rest_api.house_finder_api.id
  resource_id   = aws_api_gateway_resource.filter_history.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "filter_history_get" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  resource_id = aws_api_gateway_resource.filter_history.id
  http_method = aws_api_gateway_method.filter_history_get.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_history.invoke_arn
}

# CORS 설정
resource "aws_api_gateway_method" "filters_options" {
  rest_api_id   = aws_api_gateway_rest_api.house_finder_api.id
  resource_id   = aws_api_gateway_resource.filters.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "filters_options" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  resource_id = aws_api_gateway_resource.filters.id
  http_method = aws_api_gateway_method.filters_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "filters_options" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  resource_id = aws_api_gateway_resource.filters.id
  http_method = aws_api_gateway_method.filters_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "filters_options" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  resource_id = aws_api_gateway_resource.filters.id
  http_method = aws_api_gateway_method.filters_options.http_method
  status_code = aws_api_gateway_method_response.filters_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-User-Id'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# /v1/filters/parse resource
resource "aws_api_gateway_resource" "filters_parse" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  parent_id   = aws_api_gateway_resource.filters.id
  path_part   = "parse"
}

# POST /v1/filters/parse
resource "aws_api_gateway_method" "filters_parse_post" {
  rest_api_id   = aws_api_gateway_rest_api.house_finder_api.id
  resource_id   = aws_api_gateway_resource.filters_parse.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "filters_parse_post" {
  rest_api_id = aws_api_gateway_rest_api.house_finder_api.id
  resource_id = aws_api_gateway_resource.filters_parse.id
  http_method = aws_api_gateway_method.filters_parse_post.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.parse_natural_filter.invoke_arn
}

# Lambda permission for parse endpoint
resource "aws_lambda_permission" "parse_natural_filter_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.parse_natural_filter.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.house_finder_api.execution_arn}/*/*"
}