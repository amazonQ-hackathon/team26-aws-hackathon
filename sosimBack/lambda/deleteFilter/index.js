const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Header에서 userId 추출
        const userId = parseInt(event.headers['X-User-Id'] || event.headers['x-user-id']);
        if (!userId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: {
                        code: 'INVALID_INPUT',
                        message: 'X-User-Id header is required'
                    }
                })
            };
        }

        // Path parameter에서 filterId 추출
        const filterId = parseInt(event.pathParameters?.filterId);
        if (!filterId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: {
                        code: 'INVALID_INPUT',
                        message: 'filterId is required'
                    }
                })
            };
        }

        // 필터 존재 여부 확인
        const getParams = {
            TableName: process.env.USER_FILTERS_TABLE,
            Key: {
                userId: userId,
                filterId: filterId
            }
        };

        const existingFilter = await dynamodb.get(getParams).promise();
        if (!existingFilter.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: {
                        code: 'FILTER_NOT_FOUND',
                        message: 'Filter not found'
                    }
                })
            };
        }

        // 필터 삭제
        const deleteParams = {
            TableName: process.env.USER_FILTERS_TABLE,
            Key: {
                userId: userId,
                filterId: filterId
            }
        };

        await dynamodb.delete(deleteParams).promise();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Internal server error'
                }
            })
        };
    }
};