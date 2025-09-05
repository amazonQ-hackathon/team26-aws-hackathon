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
        const filterId = event.pathParameters?.filterId;
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

        // Query parameters
        const page = parseInt(event.queryStringParameters?.page) || 1;
        const limit = Math.min(parseInt(event.queryStringParameters?.limit) || 20, 50);

        // 필터 존재 여부 확인
        const filterParams = {
            TableName: process.env.USER_FILTERS_TABLE,
            Key: {
                userId: userId,
                filterId: parseInt(filterId)
            }
        };

        const filterResult = await dynamodb.get(filterParams).promise();
        if (!filterResult.Item) {
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

        // 매칭 히스토리 조회 (필터 생성 이후 매물)
        const matchParams = {
            TableName: process.env.USER_FILTER_MATCHES_TABLE,
            IndexName: 'filterId-matchedAt-index', // GSI 필요
            KeyConditionExpression: 'filterId = :filterId',
            ExpressionAttributeValues: {
                ':filterId': filterId
            },
            ScanIndexForward: false, // 최신순
            Limit: limit
        };

        const matchResult = await dynamodb.query(matchParams).promise();
        
        // 매물 정보 조회
        const matches = [];
        for (const match of matchResult.Items || []) {
            try {
                const propertyParams = {
                    TableName: process.env.PROPERTIES_TABLE,
                    Key: {
                        propertyId: match.propertyId
                    }
                };
                
                const propertyResult = await dynamodb.get(propertyParams).promise();
                if (propertyResult.Item) {
                    matches.push({
                        propertyId: match.propertyId,
                        matchedAt: match.matchedAt,
                        propertyInfo: propertyResult.Item,
                        notificationSent: match.notificationSent || false,
                        clickedAt: match.clickedAt || null
                    });
                }
            } catch (error) {
                console.error(`매물 ${match.propertyId} 조회 실패:`, error);
            }
        }

        // 페이징 정보 계산
        const totalCount = matches.length; // 실제로는 별도 카운트 쿼리 필요
        const totalPages = Math.ceil(totalCount / limit);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                totalCount,
                currentPage: page,
                totalPages,
                matches
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