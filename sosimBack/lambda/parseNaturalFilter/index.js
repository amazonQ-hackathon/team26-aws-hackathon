const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const bedrock = new BedrockRuntimeClient({
    region: 'us-east-1'
});

exports.handler = async (event) => {
    console.log('Bedrock 파싱 시작:', JSON.stringify(event));
    
    try {
        const body = JSON.parse(event.body);
        const { type, content } = body;
        
        console.log('입력 데이터:', { type, content });
        
        const result = await parseWithBedrock(content);
        
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

async function parseWithBedrock(textInput) {
    const prompt = `부동산 관심조건을 JSON으로 변환하세요.

입력: "${textInput}"

다음 형태로만 응답:
{
  "originalInput": "${textInput}",
  "filterName": "AI가 생성한 이름",
  "conditions": {
    "local1": "시",
    "local2": "구", 
    "propertyType": "LEASE/RENT/SALE",
    "priceMax": 30000,
    "direction": ["남"]
  },
  "humanReadable": "읽기 쉬운 설명"
}`;

    try {
        const command = new InvokeModelCommand({
            modelId: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });
        
        const response = await bedrock.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const content = responseBody.content[0].text;
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('JSON 파싱 실패');
        
    } catch (error) {
        console.error('Bedrock 에러:', error);
        
        // 폴백: 규칙 기반 파싱
        return parseText(textInput);
    }
}

function parseText(text) {
    const conditions = {};
    let filterName = "";
    
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
    
    const priceMatch = text.match(/(\d+)억/);
    if (priceMatch) {
        const price = parseInt(priceMatch[1]) * 10000;
        if (text.includes('이하')) {
            conditions.priceMax = price;
        } else if (text.includes('이상')) {
            conditions.priceMin = price;
        } else {
            conditions.priceMax = price;
        }
    }
    
    const monthlyPriceMatch = text.match(/(\d+)만원/);
    if (monthlyPriceMatch) {
        const price = parseInt(monthlyPriceMatch[1]) * 10;
        if (text.includes('이하')) {
            conditions.priceMax = price;
        } else {
            conditions.priceMax = price;
        }
    }
    
    const directions = [];
    if (text.includes('남향')) directions.push('남');
    if (text.includes('동향')) directions.push('동');
    if (text.includes('서향')) directions.push('서');
    if (text.includes('북향')) directions.push('북');
    if (directions.length > 0) {
        conditions.direction = directions;
    }
    
    if (!filterName) {
        filterName = "관심조건";
    } else {
        filterName += "관심조건";
    }
    
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