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

        // 필터 정보 조회
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

        const filter = filterResult.Item;
        const filterCreatedAt = new Date(filter.createdAt);
        const oneWeekBefore = new Date(filterCreatedAt.getTime() - 7 * 24 * 60 * 60 * 1000);

        // 필터 생성 이전 일주일치 매물 조회
        const scanParams = {
            TableName: process.env.PROPERTIES_TABLE,
            FilterExpression: 'crawledAt BETWEEN :weekBefore AND :filterCreated',
            ExpressionAttributeValues: {
                ':weekBefore': oneWeekBefore.toISOString(),
                ':filterCreated': filterCreatedAt.toISOString()
            }
        };

        const scanResult = await dynamodb.scan(scanParams).promise();
        
        // 필터 조건에 맞는 매물 필터링
        const matchingProperties = scanResult.Items.filter(property => 
            matchesFilter(property, filter.conditions)
        );

        // 크롤링 시간 기준 내림차순 정렬
        matchingProperties.sort((a, b) => 
            new Date(b.crawledAt) - new Date(a.crawledAt)
        );

        // 페이징 처리
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProperties = matchingProperties.slice(startIndex, endIndex);

        const totalCount = matchingProperties.length;
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
                properties: paginatedProperties
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

// 매물이 필터 조건에 맞는지 확인
function matchesFilter(property, conditions) {
    // 가격 조건
    if (conditions.priceMin && property.price < conditions.priceMin) return false;
    if (conditions.priceMax && property.price > conditions.priceMax) return false;
    
    // 방향 조건
    if (conditions.direction && conditions.direction.length > 0) {
        if (!conditions.direction.includes(property.direction)) return false;
    }
    
    // 사용승인일 조건
    if (conditions.approvalDateMin && property.approvalDate < conditions.approvalDateMin) return false;
    if (conditions.approvalDateMax && property.approvalDate > conditions.approvalDateMax) return false;
    
    // 지역 조건
    if (conditions.local1 && property.local1 !== conditions.local1) return false;
    if (conditions.local2 && property.local2 !== conditions.local2) return false;
    if (conditions.local3 && property.local3 !== conditions.local3) return false;
    
    // 매물타입 조건
    if (conditions.propertyType && property.propertyType !== conditions.propertyType) return false;
    
    // 층수 조건
    if (conditions.floorMin && property.floor < conditions.floorMin) return false;
    if (conditions.floorMax && property.floor > conditions.floorMax) return false;
    
    return true;
}