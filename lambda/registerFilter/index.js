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

        // Request body 파싱
        const body = JSON.parse(event.body);
        const { filterName, conditions } = body;

        if (!filterName) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: {
                        code: 'INVALID_INPUT',
                        message: 'filterName is required'
                    }
                })
            };
        }

        // 새로운 filterId 생성 (현재 최대값 + 1)
        const queryParams = {
            TableName: process.env.USER_FILTERS_TABLE,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false,
            Limit: 1
        };

        const existingFilters = await dynamodb.query(queryParams).promise();
        const newFilterId = existingFilters.Items.length > 0 
            ? existingFilters.Items[0].filterId + 1 
            : 1;

        // DynamoDB에 필터 저장
        const item = {
            userId: userId,
            filterId: newFilterId,
            filterName: filterName,
            conditions: conditions || {},
            isActive: true,
            createdAt: new Date().toISOString()
        };

        await dynamodb.put({
            TableName: process.env.USER_FILTERS_TABLE,
            Item: item
        }).promise();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                filterId: newFilterId
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