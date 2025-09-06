exports.handler = async (event) => {
    console.log('테스트 파싱 시작:', JSON.stringify(event));
    
    try {
        const body = JSON.parse(event.body);
        const { type, content } = body;
        
        console.log('입력 데이터:', { type, content });
        
        // 간단한 파싱 로직 (Bedrock 없이)
        const result = {
            originalInput: content,
            filterName: "테스트 관심조건",
            conditions: {
                local2: "강남구",
                propertyType: "LEASE",
                priceMax: 30000,
                direction: ["남"]
            },
            humanReadable: "강남구 전세 3억원 이하 남향"
        };
        
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