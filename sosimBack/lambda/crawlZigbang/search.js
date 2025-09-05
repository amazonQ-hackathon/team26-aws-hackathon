const https = require('https');

// 직방 검색 API로 매물 ID 목록 가져오기
async function searchZigbangProperties(options = {}) {
    const {
        geohash = 'wydjx', // 서울 강남 지역 기본값
        depositMin = 0,
        depositMax = 999999,
        rentMin = 0, 
        rentMax = 999999,
        salesTypes = ['전세', '월세'], // 매매 제외
        serviceTypes = ['원룸', '투룸', '쓰리룸'],
        page = 1,
        limit = 20
    } = options;
    
    return new Promise((resolve, reject) => {
        // 직방 검색 API 파라미터 구성
        const params = new URLSearchParams({
            geohash: geohash,
            depositMin: depositMin,
            depositMax: depositMax,
            rentMin: rentMin,
            rentMax: rentMax,
            salesTypes: salesTypes.join(','),
            serviceTypes: serviceTypes.join(','),
            page: page,
            limit: limit,
            sort: 'updatedAt' // 최신순 정렬
        });
        
        const url = `https://apis.zigbang.com/v2/items?${params.toString()}`;
        
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
                    
                    if (jsonData.items && Array.isArray(jsonData.items)) {
                        const itemIds = jsonData.items.map(item => item.itemId);
                        console.log(`검색 결과: ${itemIds.length}개 매물 발견`);
                        resolve(itemIds);
                    } else {
                        console.log('검색 결과 없음');
                        resolve([]);
                    }
                    
                } catch (parseError) {
                    console.error('검색 결과 파싱 에러:', parseError);
                    reject(parseError);
                }
            });
            
        }).on('error', (error) => {
            console.error('검색 API 요청 에러:', error);
            reject(error);
        });
    });
}

// 여러 지역 검색
async function searchMultipleRegions() {
    const regions = [
        { name: '강남구', geohash: 'wydjx' },
        { name: '서초구', geohash: 'wydj5' },
        { name: '송파구', geohash: 'wydmh' },
        { name: '마포구', geohash: 'wydm6' }
    ];
    
    let allItemIds = [];
    
    for (const region of regions) {
        try {
            console.log(`${region.name} 지역 검색 중...`);
            const itemIds = await searchZigbangProperties({
                geohash: region.geohash,
                limit: 50 // 지역당 50개씩
            });
            
            allItemIds = allItemIds.concat(itemIds);
            
            // API 호출 간격 (Rate Limiting 방지)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`${region.name} 검색 실패:`, error);
        }
    }
    
    // 중복 제거
    const uniqueItemIds = [...new Set(allItemIds)];
    console.log(`총 ${uniqueItemIds.length}개 고유 매물 발견`);
    
    return uniqueItemIds;
}

module.exports = {
    searchZigbangProperties,
    searchMultipleRegions
};