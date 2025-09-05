# sosimBack - 소심하지만 집은 구하고 싶어

AWS 서버리스 백엔드 시스템

## 🚀 배포 방법

### 1. AWS CLI 설정
```bash
aws configure
# Access Key ID, Secret Key, Region 입력
```

### 2. 배포 실행
```bash
cd ../IaC
./deploy.bat
```

**참고**: 배포 스크립트가 `../IaC/` 디렉토리로 이동되었습니다.

## 📁 디렉토리 구조
```
sosimBack/
├── lambda/          # Lambda 함수 소스코드
├── build/          # 빌드 아티팩트 (로컬 빌드용)
└── test-api.bat    # API 테스트 스크립트
```

**IaC 구조** (별도 디렉토리):
```
../IaC/
├── *.tf            # Terraform 인프라 코드
├── build/          # Lambda 패키지 저장소
└── deploy.bat      # 배포 스크립트
```

## 🔧 주요 기능
- **자동 크롤링**: 1분마다 직방 API에서 새 매물 수집
- **실시간 매칭**: 필터 조건에 맞는 매물 자동 매칭
- **푸시 알림**: SNS를 통한 실시간 알림 발송
- **RESTful API**: 5개 엔드포인트 제공

## 📊 AWS 서비스
- Lambda (7개 함수, Node.js 16.x)
- API Gateway
- DynamoDB (4개 테이블)
- EventBridge (1분 주기)
- SNS

## 🧪 API 테스트
```bash
./test-api.bat
```

## 🌐 API 도메인
```
https://8pm5j6aiuc.execute-api.us-east-1.amazonaws.com/prod
```

## 📋 Lambda 함수 목록

### API 함수
- `registerFilter`: 필터 등록 ✅ (실제 DB 연결)
- `getFilters`: 필터 목록 조회 ✅ (실제 DB 연결)
- `deleteFilter`: 필터 삭제 ✅
- `getMatches`: 매칭 매물 조회 ✅
- `getHistory`: 히스토리 조회 ✅

### 백그라운드 함수
- `crawlZigbang`: 직방 크롤링 🔄 (1분 주기)
- `matchProperties`: 매물 매칭 🔄 (1분 주기)

## 🔄 현재 상태
- ✅ **API Gateway**: 정상 작동
- ✅ **DynamoDB**: 실제 연결 완료
- ✅ **Lambda Runtime**: Node.js 16.x
- ✅ **AWS SDK**: v2 사용
- 🔄 **자동 크롤링**: 1분 주기 실행 중