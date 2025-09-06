exports.handler = async (event) => {
    console.log('스마트 파싱 시작:', JSON.stringify(event));
    
    try {
        const body = JSON.parse(event.body);
        const { type, content } = body;
        
        console.log('입력 데이터:', { type, content });
        
        // 간단한 규칙 기반 파싱
        const result = parseText(content);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(result)
        };
        
    } catch (error) {
        console.error('파싱 에러:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: {
                    code: 'PARSING_ERROR',
                    message: error.message
                }
            })
        };
    }
};

function parseText(text) {
    const conditions = {};
    let filterName = "";
    
    // 지역 파싱
    const regions = ['강남구', '마포구', '서초구', '송파구', '노원구', '분당', '홍대', '신촌'];
    for (const region of regions) {
        if (text.includes(region)) {
            if (region === '분당') {
                conditions.local1 = '성남시';
                conditions.local2 = '분당구';
            } else if (region === '홍대' || region === '신촌') {
                conditions.local1 = '서울시';
                conditions.local2 = '마포구';
            } else {
                conditions.local1 = '서울시';
                conditions.local2 = region;
            }
            filterName += region + " ";
            break;
        }
    }
    
    // 거래 유형 파싱
    if (text.includes('전세')) {
        conditions.propertyType = 'LEASE';
        filterName += '전세 ';
    } else if (text.includes('월세')) {
        conditions.propertyType = 'RENT';
        filterName += '월세 ';
    } else if (text.includes('매매')) {
        conditions.propertyType = 'SALE';
        filterName += '매매 ';
    }
    
    // 가격 파싱
    const priceMatch = text.match(/(\d+)억/);
    if (priceMatch) {
        const price = parseInt(priceMatch[1]) * 10000; // 만원 단위로 변환
        if (text.includes('이하') || text.includes('이내') || text.includes('미만')) {
            conditions.priceMax = price;
        } else if (text.includes('이상')) {
            conditions.priceMin = price;
        } else {
            conditions.priceMax = price;
        }
    }
    
    const monthlyPriceMatch = text.match(/(\d+)만원/);
    if (monthlyPriceMatch) {
        const price = parseInt(monthlyPriceMatch[1]) * 10; // 만원 단위로 변환
        if (text.includes('이하') || text.includes('이내') || text.includes('미만')) {
            conditions.priceMax = price;
        } else if (text.includes('이상')) {
            conditions.priceMin = price;
        } else {
            conditions.priceMax = price;
        }
    }
    
    // 방향 파싱
    const directions = [];
    if (text.includes('남향')) directions.push('남');
    if (text.includes('동향')) directions.push('동');
    if (text.includes('서향')) directions.push('서');
    if (text.includes('북향')) directions.push('북');
    if (directions.length > 0) {
        conditions.direction = directions;
    }
    
    // 필터명 생성
    if (!filterName) {
        filterName = "관심조건";
    } else {
        filterName += "관심조건";
    }
    
    // 사람이 읽기 쉬운 설명 생성
    let humanReadable = "";
    if (conditions.local2) {
        humanReadable += conditions.local2 + " ";
    }
    if (conditions.propertyType) {
        const typeMap = { 'LEASE': '전세', 'RENT': '월세', 'SALE': '매매' };
        humanReadable += typeMap[conditions.propertyType] + " ";
    }
    if (conditions.priceMax) {
        if (conditions.priceMax >= 10000) {
            humanReadable += (conditions.priceMax / 10000) + "억원 이하 ";
        } else {
            humanReadable += (conditions.priceMax / 10) + "만원 이하 ";
        }
    }
    if (conditions.direction) {
        humanReadable += conditions.direction.join(',') + "향";
    }
    
    return {
        originalInput: text,
        filterName: filterName.trim(),
        conditions: conditions,
        humanReadable: humanReadable.trim() || "조건을 정확히 파악하기 어려워요"
    };
}