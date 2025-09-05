const AWS = require('aws-sdk');
const https = require('https');
const { searchMultipleRegions } = require('./search');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// 직방 매물타입 매핑
const ZIGBANG_TYPE_MAPPING = {
    '전세': 'LEASE',
    '월세': 'RENT', 
    '매매': 'SALE'
};

// 방향 매핑
const DIRECTION_MAPPING = {
    'E': '동',
    'W': '서', 
    'S': '남',
    'N': '북'
};

exports.handler = async (event) => {
    const startTime = new Date().toISOString();
    console.log('크롤링 시작:', startTime);
    
    try {
        // 실제 검색 API로 매물 ID 목록 가져오기
        console.log('매물 검색 시작...');
        const itemIds = await searchMultipleRegions();
        
        if (itemIds.length === 0) {
            console.log('검색된 매물이 없습니다.');
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: '검색된 매물 없음',
                    timestamp: new Date().toISOString()
                })
            };
        }
        
        let successCount = 0;
        let errorCount = 0;
        
        // 최대 100개까지만 처리 (Lambda 실행 시간 제한)
        const limitedItemIds = itemIds.slice(0, 100);
        console.log(`${limitedItemIds.length}개 매물 처리 시작`);
        
        for (const itemId of limitedItemIds) {
            try {
                const propertyData = await fetchZigbangProperty(itemId);
                if (propertyData) {
                    await savePropertyToDB(propertyData);
                    successCount++;
                }
            } catch (error) {
                console.error(`매물 ${itemId} 처리 실패:`, error);
                errorCount++;
            }
        }
        
        console.log(`크롤링 완료 - 성공: ${successCount}, 실패: ${errorCount}`);
        
        // 성공 메트릭 발송
        await publishCustomMetric('CrawlingSuccess', successCount);
        await publishCustomMetric('CrawlingFailures', errorCount);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: '크롤링 완료',
                successCount,
                errorCount,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('크롤링 에러:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            event: event
        });
        
        // CloudWatch 사용자 정의 메트릭
        await publishCustomMetric('CrawlingErrors', 1);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: '크롤링 실패',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};

// CloudWatch 사용자 정의 메트릭 발송
async function publishCustomMetric(metricName, value) {
    try {
        const cloudwatch = new AWS.CloudWatch();
        await cloudwatch.putMetricData({
            Namespace: 'HouseFinder/Crawling',
            MetricData: [{
                MetricName: metricName,
                Value: value,
                Unit: 'Count',
                Timestamp: new Date()
            }]
        }).promise();
    } catch (err) {
        console.error('메트릭 발송 실패:', err);
    }
}
};

// 직방 API에서 매물 정보 가져오기
async function fetchZigbangProperty(itemId) {
    return new Promise((resolve, reject) => {
        const url = `https://apis.zigbang.com/v3/items/${itemId}?version=&domain=zigbang`;
        
        const options = {
            headers: {
                'x-zigbang-platform': 'www'
            }
        };
        
        https.get(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    
                    if (!jsonData.item) {
                        console.log(`매물 ${itemId}: 데이터 없음`);
                        resolve(null);
                        return;
                    }
                    
                    const item = jsonData.item;
                    const address = jsonData.item.addressOrigin;
                    
                    // 우리 DB 스키마에 맞게 변환
                    const propertyData = {
                        propertyId: `zigbang_${itemId}`,
                        title: item.title || '',
                        price: calculatePrice(item.price, item.salesType),
                        direction: DIRECTION_MAPPING[item.roomDirection] || item.roomDirection || '',
                        approvalDate: formatApprovalDate(item.approveDate),
                        local1: address?.local1 || '',
                        local2: address?.local2 || '',
                        local3: address?.local3 || '',
                        propertyType: ZIGBANG_TYPE_MAPPING[item.salesType] || item.salesType,
                        floor: parseInt(item.floor?.floor) || 0,
                        sourceUrl: `https://zigbang.com/home/oneroom/items/${itemId}`,
                        sourceSite: '직방',
                        crawledAt: new Date().toISOString(),
                        isActive: true
                    };
                    
                    resolve(propertyData);
                    
                } catch (parseError) {
                    console.error(`매물 ${itemId} 파싱 에러:`, parseError);
                    resolve(null);
                }
            });
            
        }).on('error', (error) => {
            console.error(`매물 ${itemId} 요청 에러:`, error);
            reject(error);
        });
    });
}

// 가격 계산 (만원 단위로 변환)
function calculatePrice(priceObj, salesType) {
    if (!priceObj) return 0;
    
    if (salesType === '전세') {
        return priceObj.deposit || 0;
    } else if (salesType === '월세') {
        // 월세는 보증금 + (월세 * 100) 형태로 계산
        return (priceObj.deposit || 0) + ((priceObj.rent || 0) * 100);
    } else if (salesType === '매매') {
        return priceObj.price || priceObj.deposit || 0;
    }
    
    return 0;
}

// 사용승인일 포맷 변환
function formatApprovalDate(approveDate) {
    if (!approveDate) return '';
    
    // "20111013" -> "2011-10-13"
    const dateStr = approveDate.toString();
    if (dateStr.length === 8) {
        return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
    }
    
    return '';
}

// DynamoDB에 매물 저장
async function savePropertyToDB(propertyData) {
    const params = {
        TableName: process.env.PROPERTIES_TABLE,
        Item: propertyData,
        ConditionExpression: 'attribute_not_exists(propertyId)' // 중복 방지
    };
    
    try {
        await dynamodb.put(params).promise();
        console.log(`매물 저장 성공: ${propertyData.propertyId}`);
    } catch (error) {
        if (error.code === 'ConditionalCheckFailedException') {
            console.log(`매물 이미 존재: ${propertyData.propertyId}`);
        } else {
            console.error(`매물 저장 실패: ${propertyData.propertyId}`, error);
            throw error;
        }
    }
}