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
cd sosimBack
deploy.bat
```

## 📁 디렉토리 구조
```
sosimBack/
├── lambda/          # Lambda 함수 소스코드
├── terraform/       # 인프라 코드 (IaC)
├── build/          # 빌드 아티팩트 (자동생성)
├── deploy.bat      # 배포 스크립트
└── test-api.bat    # API 테스트 스크립트
```

## 🔧 주요 기능
- **자동 크롤링**: 1분마다 직방 API에서 새 매물 수집
- **실시간 매칭**: 필터 조건에 맞는 매물 자동 매칭
- **푸시 알림**: SNS를 통한 실시간 알림 발송
- **RESTful API**: 5개 엔드포인트 제공

## 📊 AWS 서비스
- Lambda (6개 함수)
- API Gateway
- DynamoDB (4개 테이블)
- EventBridge
- SNS