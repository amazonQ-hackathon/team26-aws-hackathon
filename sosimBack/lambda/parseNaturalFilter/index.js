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

// 음성을 텍스트로 변환
async function convertVoiceToText(audioData, audioFormat) {
    try {
        // Base64 디코딩
        const audioBuffer = Buffer.from(audioData.replace(/^data:audio\/[^;]+;base64,/, ''), 'base64');
        
        // S3에 임시 저장
        const s3 = new AWS.S3();
        const bucketName = process.env.TEMP_AUDIO_BUCKET;
        const fileName = `temp-audio-${Date.now()}.${audioFormat}`;
        
        await s3.putObject({
            Bucket: bucketName,
            Key: fileName,
            Body: audioBuffer,
            ContentType: `audio/${audioFormat}`
        }).promise();
        
        // Transcribe 작업 시작
        const transcribe = new AWS.TranscribeService();
        const jobName = `transcribe-job-${Date.now()}`;
        
        await transcribe.startTranscriptionJob({
            TranscriptionJobName: jobName,
            LanguageCode: 'ko-KR',
            MediaFormat: audioFormat,
            Media: {
                MediaFileUri: `s3://${bucketName}/${fileName}`
            }
        }).promise();
        
        // 작업 완료 대기
        let jobStatus = 'IN_PROGRESS';
        while (jobStatus === 'IN_PROGRESS') {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
            
            const jobResult = await transcribe.getTranscriptionJob({
                TranscriptionJobName: jobName
            }).promise();
            
            jobStatus = jobResult.TranscriptionJob.TranscriptionJobStatus;
        }
        
        if (jobStatus === 'COMPLETED') {
            // 결과 가져오기
            const jobResult = await transcribe.getTranscriptionJob({
                TranscriptionJobName: jobName
            }).promise();
            
            const transcriptUri = jobResult.TranscriptionJob.Transcript.TranscriptFileUri;
            
            // 결과 파일 다운로드 및 파싱
            const https = require('https');
            const transcriptText = await new Promise((resolve, reject) => {
                https.get(transcriptUri, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try {
                            const result = JSON.parse(data);
                            resolve(result.results.transcripts[0].transcript);
                        } catch (err) {
                            reject(err);
                        }
                    });
                }).on('error', reject);
            });
            
            // 임시 파일 정리
            await s3.deleteObject({
                Bucket: bucketName,
                Key: fileName
            }).promise();
            
            return transcriptText;
        } else {
            throw new Error('음성 변환 실패');
        }
        
    } catch (error) {
        console.error('음성 변환 에러:', error);
        throw new Error('음성을 텍스트로 변환하는데 실패했습니다.');
    }
}

// Bedrock으로 자연어 파싱
async function parseWithBedrock(textInput) {
    const prompt = `
사용자의 부동산 관심조건을 다음 JSON 스키마로 변환하세요.

스키마 설명:
- priceMin/Max: 만원 단위 (예: "3억" = 30000, "100만원" = 100)
- propertyType: "LEASE"(전세), "RENT"(월세), "SALE"(매매)
- direction: ["동","서","남","북"] 배열 형태
- local1: 시 (예: "서울시", "인천시")
- local2: 구 (예: "강남구", "마포구") 
- local3: 동 (예: "논현동", "홍대동")
- floorMin/Max: 층수 숫자

사용자 입력: "${textInput}"

다음 형태로만 응답하세요:
{
  "originalInput": "${textInput}",
  "filterName": "AI가 생성한 관심조건명",
  "conditions": {
    // 파싱된 조건들
  },
  "humanReadable": "사람이 읽기 쉬운 조건 설명"
}

JSON만 반환하고 다른 설명은 하지 마세요.`;

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
        
        const response = await bedrock.invokeModel(params).promise();
        const responseBody = JSON.parse(response.body.toString());
        
        // Claude 응답에서 JSON 추출
        const content = responseBody.content[0].text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const parsedResult = JSON.parse(jsonMatch[0]);
            
            // filterName이 없으면 자동 생성
            if (!parsedResult.filterName) {
                parsedResult.filterName = generateFilterName(parsedResult.conditions);
            }
            
            return parsedResult;
        } else {
            throw new Error('Bedrock 응답에서 JSON을 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('Bedrock 파싱 에러:', error);
        
        // Bedrock 실패 시 기본 응답
        return {
            originalInput: textInput,
            filterName: "관심조건",
            conditions: {},
            humanReadable: "조건을 정확히 파악하기 어려워요. 다시 입력해주세요.",
            error: "파싱 실패"
        };
    }
}

// 조건 기반 필터명 자동 생성
function generateFilterName(conditions) {
    let name = "";
    
    if (conditions.local2) {
        name += conditions.local2 + " ";
    } else if (conditions.local1) {
        name += conditions.local1 + " ";
    }
    
    if (conditions.propertyType) {
        const typeMap = {
            "LEASE": "전세",
            "RENT": "월세", 
            "SALE": "매매"
        };
        name += typeMap[conditions.propertyType] + " ";
    }
    
    name += "관심조건";
    
    return name.trim();
}