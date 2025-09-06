const AWS = require('aws-sdk');

const bedrock = new AWS.BedrockRuntime({
    region: 'us-east-1'
});

exports.handler = async (event) => {
    console.log('Bedrock 테스트 시작:', JSON.stringify(event));
    
    try {
        const body = JSON.parse(event.body);
        const { type, content } = body;
        
        console.log('입력 데이터:', { type, content });
        
        // Bedrock 호출 테스트
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
                    message: error.message,
                    stack: error.stack
                }
            })
        };
    }
};

async function parseWithBedrock(textInput) {
    const prompt = `사용자 입력: "${textInput}"

다음 JSON 형태로만 응답하세요:
{
  "originalInput": "${textInput}",
  "filterName": "관심조건",
  "conditions": {
    "local2": "강남구",
    "propertyType": "LEASE",
    "priceMax": 30000
  },
  "humanReadable": "강남구 전세 3억원 이하"
}`;

    try {
        const params = {
            modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 1000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        };
        
        console.log('Bedrock 호출 시작');
        const response = await bedrock.invokeModel(params).promise();
        console.log('Bedrock 응답 받음');
        
        const responseBody = JSON.parse(response.body.toString());
        console.log('응답 파싱 완료:', responseBody);
        
        return {
            originalInput: textInput,
            filterName: "테스트 관심조건",
            conditions: {
                local2: "강남구",
                propertyType: "LEASE",
                priceMax: 30000
            },
            humanReadable: "강남구 전세 3억원 이하"
        };
        
    } catch (error) {
        console.error('Bedrock 에러:', error);
        throw error;
    }
}