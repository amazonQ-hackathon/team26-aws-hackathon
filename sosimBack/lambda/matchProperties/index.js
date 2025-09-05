const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

exports.handler = async (event) => {
    console.log('매칭 프로세스 시작:', new Date().toISOString());
    
    try {
        // 1. 모든 활성 필터 조회
        const filtersResult = await dynamodb.scan({
            TableName: process.env.USER_FILTERS_TABLE,
            FilterExpression: 'isActive = :active',
            ExpressionAttributeValues: {
                ':active': true
            }
        }).promise();

        const filters = filtersResult.Items || [];
        console.log(`활성 필터 ${filters.length}개 발견`);

        // 2. 최근 5분간 크롤링된 새 매물 조회
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        
        const propertiesResult = await dynamodb.scan({
            TableName: process.env.PROPERTIES_TABLE,
            FilterExpression: 'crawledAt > :fiveMinutesAgo AND isActive = :active',
            ExpressionAttributeValues: {
                ':fiveMinutesAgo': fiveMinutesAgo,
                ':active': true
            }
        }).promise();

        const newProperties = propertiesResult.Items || [];
        console.log(`새 매물 ${newProperties.length}개 발견`);

        let totalMatches = 0;

        // 3. 각 필터에 대해 매칭 확인
        for (const filter of filters) {
            const matchingProperties = newProperties.filter(property => 
                matchesFilter(property, filter.conditions)
            );

            if (matchingProperties.length > 0) {
                console.log(`필터 ${filter.filterId}: ${matchingProperties.length}개 매물 매칭`);
                
                // 4. 매칭 결과 저장
                for (const property of matchingProperties) {
                    const matchId = `${filter.filterId}_${property.propertyId}_${Date.now()}`;
                    
                    await dynamodb.put({
                        TableName: process.env.USER_FILTER_MATCHES_TABLE,
                        Item: {
                            userId: filter.userId,
                            matchId: matchId,
                            filterId: filter.filterId.toString(),
                            propertyId: property.propertyId,
                            matchedAt: new Date().toISOString(),
                            notificationSent: false
                        }
                    }).promise();
                }

                // 5. 푸시 알림 발송
                await sendNotification(filter, matchingProperties.length);
                totalMatches += matchingProperties.length;
            }
        }

        console.log(`매칭 완료 - 총 ${totalMatches}개 매칭`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: '매칭 완료',
                totalMatches,
                processedFilters: filters.length,
                newProperties: newProperties.length
            })
        };

    } catch (error) {
        console.error('매칭 에러:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: '매칭 실패',
                message: error.message
            })
        };
    }
};

// 매물이 필터 조건에 맞는지 확인
function matchesFilter(property, conditions) {
    if (conditions.priceMin && property.price < conditions.priceMin) return false;
    if (conditions.priceMax && property.price > conditions.priceMax) return false;
    
    if (conditions.direction && conditions.direction.length > 0) {
        if (!conditions.direction.includes(property.direction)) return false;
    }
    
    if (conditions.approvalDateMin && property.approvalDate < conditions.approvalDateMin) return false;
    if (conditions.approvalDateMax && property.approvalDate > conditions.approvalDateMax) return false;
    
    if (conditions.local1 && property.local1 !== conditions.local1) return false;
    if (conditions.local2 && property.local2 !== conditions.local2) return false;
    if (conditions.local3 && property.local3 !== conditions.local3) return false;
    
    if (conditions.propertyType && property.propertyType !== conditions.propertyType) return false;
    
    if (conditions.floorMin && property.floor < conditions.floorMin) return false;
    if (conditions.floorMax && property.floor > conditions.floorMax) return false;
    
    return true;
}

// 푸시 알림 발송
async function sendNotification(filter, matchCount) {
    try {
        const message = `[${filter.filterName}]에 어울리는 집 ${matchCount}건 발견`;
        
        await sns.publish({
            TopicArn: process.env.SNS_TOPIC_ARN,
            Message: message,
            Subject: '새로운 매물 알림'
        }).promise();

        console.log(`알림 발송 완료: ${message}`);
    } catch (error) {
        console.error('알림 발송 실패:', error);
    }
}