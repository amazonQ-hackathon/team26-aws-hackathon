const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
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

        // 최대 filterId 조회
        const existingFilters = await dynamodb.query({
            TableName: process.env.USER_FILTERS_TABLE,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false,
            Limit: 1
        }).promise();

        const newFilterId = existingFilters.Items.length > 0 
            ? existingFilters.Items[0].filterId + 1 
            : 1;

        // DynamoDB에 저장
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
                    message: error.message
                }
            })
        };
    }
};