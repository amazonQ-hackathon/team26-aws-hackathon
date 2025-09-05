const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

exports.handler = async (event) => {
    console.log('알림 발송 시작:', new Date().toISOString());
    
    try {
        // 알림 발송이 필요한 매칭 조회
        const pendingMatches = await getPendingMatches();
        
        if (pendingMatches.length === 0) {
            console.log('발송할 알림이 없습니다.');
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: '발송할 알림 없음',
                    timestamp: new Date().toISOString()
                })
            };
        }
        
        // 필터별로 그룹화
        const matchesByFilter = groupMatchesByFilter(pendingMatches);
        
        let successCount = 0;
        let errorCount = 0;
        
        // 각 필터별로 알림 발송
        for (const [filterId, matches] of Object.entries(matchesByFilter)) {
            try {
                await sendFilterNotification(filterId, matches);
                
                // 알림 발송 완료 표시
                await markNotificationsSent(matches);
                successCount++;
                
            } catch (error) {
                console.error(`필터 ${filterId} 알림 발송 실패:`, error);
                errorCount++;
            }
        }
        
        console.log(`알림 발송 완료 - 성공: ${successCount}, 실패: ${errorCount}`);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: '알림 발송 완료',
                successCount,
                errorCount,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('알림 발송 에러:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: '알림 발송 실패',
                message: error.message
            })
        };
    }
};

// 알림 발송이 필요한 매칭 조회
async function getPendingMatches() {
    const params = {
        TableName: process.env.USER_FILTER_MATCHES_TABLE,
        FilterExpression: 'notificationSent = :false',
        ExpressionAttributeValues: {
            ':false': false
        }
    };
    
    const result = await dynamodb.scan(params).promise();
    return result.Items || [];
}

// 필터별로 매칭 그룹화
function groupMatchesByFilter(matches) {
    const grouped = {};
    
    matches.forEach(match => {
        const filterId = match.filterId;
        if (!grouped[filterId]) {
            grouped[filterId] = [];
        }
        grouped[filterId].push(match);
    });
    
    return grouped;
}

// 필터별 알림 발송
async function sendFilterNotification(filterId, matches) {
    // 필터 정보 조회
    const filter = await getFilterInfo(filterId, matches[0].userId);
    if (!filter) {
        throw new Error(`필터 ${filterId}를 찾을 수 없습니다.`);
    }
    
    // 푸시 메시지 생성
    const message = createNotificationMessage(filter.filterName, matches.length);
    
    // SNS 발송
    const params = {
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: JSON.stringify({
            default: message,
            GCM: JSON.stringify({
                data: {
                    title: '새로운 매물 발견!',
                    body: message,
                    filterId: filterId,
                    matchCount: matches.length
                }
            })
        }),
        MessageStructure: 'json',
        Subject: '새로운 매물 알림'
    };
    
    await sns.publish(params).promise();
    console.log(`알림 발송 완료: ${filter.filterName} (${matches.length}건)`);
}

// 필터 정보 조회
async function getFilterInfo(filterId, userId) {
    const params = {
        TableName: process.env.USER_FILTERS_TABLE,
        Key: {
            userId: userId,
            filterId: parseInt(filterId)
        }
    };
    
    const result = await dynamodb.get(params).promise();
    return result.Item;
}

// 푸시 메시지 생성
function createNotificationMessage(filterName, matchCount) {
    return `[${filterName}]에 어울리는 집 ${matchCount}건 발견`;
}

// 알림 발송 완료 표시
async function markNotificationsSent(matches) {
    const updatePromises = matches.map(match => {
        const params = {
            TableName: process.env.USER_FILTER_MATCHES_TABLE,
            Key: {
                userId: match.userId,
                matchId: match.matchId
            },
            UpdateExpression: 'SET notificationSent = :true',
            ExpressionAttributeValues: {
                ':true': true
            }
        };
        
        return dynamodb.update(params).promise();
    });
    
    await Promise.all(updatePromises);
}