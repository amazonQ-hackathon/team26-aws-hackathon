# Q-riosity:소심하지만 집은 구하고 싶어

소심집은 바쁜 현대인들이 원하는 부동산 매물을 빠르게 접하고 원하는 조건이 현실적인지를 검토할 수 있는 어플리케이션입니다.
부동산 계의 다나와, 네이버쇼핑 사이트라고 보시면 됩니다.
다만, 부동산은 공산품과 달리 매물이 나가면 끝이기 때문에 누구보다 시간이 중요합니다. 따라서 앱푸시를 활용해 원하는 집이 나오자마자 바로 매물을 확인하고 연락 가능하도록 했습니다.

## 어플리케이션 개요

제가 부동산을 구하기 위해 주변에서 추천받은 방법은 주변 부동산 10군데에 전화해서 원하는 매물을 말하고 연락 달라고 해라, 직접 발로 뛰어라 등등이었습니다.
그런데 모르는 사람에게 전화하는게 너무 힘들어서 어떻게든 최소한의 연락으로 괜찮은 집을 보기 위해 개발하게 되었습니다.

**기존에 집을 구한다면:**
- 부동산에 직접 전화해서 원하는 매물 말하기
- 부동산 어플이 시간순으로 정렬되어있지 않아서 봤던 매물을 또 보게됨 (역삼동 매물 1건 → '새걸까? 봤던걸까?')
- 여러 부동산 어플에 들어가서 원하는 조건의 집을 찾기

**소심집을 사용해 집을 구한다면:**
원하는 집의 조건을 정리하고 그 조건에 맞는 집을 나에게 직접 가져다주는(내가 찾아가는게 아니라) 서비스입니다.

## 주요 기능

<p align="center">
  <img src="https://github.com/user-attachments/assets/30fae5aa-a635-4348-b43b-a3f47fbc246c" width="19%" height="auto" alt="01_main">
  <img src="https://github.com/user-attachments/assets/8dc1651e-5f04-4ba7-b8da-5af758569c4a" width="19%" height="auto" alt="02">
  <img src="https://github.com/user-attachments/assets/df267a2b-c08b-4e34-aa8b-a4e58e24c362" width="19%" height="auto" alt="03">
  <img src="https://github.com/user-attachments/assets/4a439c36-8280-4ca2-8bb7-aaadf2759a23" width="19%" height="auto" alt="04">
  <img src="https://github.com/user-attachments/assets/c42af1af-ccea-48aa-bb29-959653779418" width="19%" height="auto" alt="05">
</p>

1. **관심조건 등록**: 원하는 부동산 조건을 자연어로 입력하거나 상세 조건으로 등록합니다.
2. **매물 매칭**: 등록된 관심 조건에 맞는 매물을 자동으로 확인하고 알려줍니다.
3. **실시간 알림**: 관심조건에 맞는 매물이 등록되면 앱푸시를 즉시 발송합니다.
4. **히스토리 조회**: 필터 생성 전후의 매물 히스토리를 확인할 수 있습니다.

## 동영상 데모
![live demo](https://github.com/user-attachments/assets/71459b76-ffba-4f7f-9e2f-a4c3cc5e2aa7)


## 리소스 배포하기

### 1. 사전 요구 사항
- AWS CLI 설치 및 구성
- Terraform 설치 (>= 1.0)
- 적절한 AWS 권한 (Lambda, API Gateway, DynamoDB, SNS, CloudWatch 관리 권한)

### 2. 람다 함수 빌드

```bash
# IaC 디렉토리로 이동
cd IaC

# 람다 함수 빌드
build-lambda.bat
```

### 3. Terraform 실행

```bash
# Terraform 초기화
terraform init

# 실행 계획 확인
terraform plan

# 인프라 생성 및 람다 함수 배포
terraform apply
```

### 4. 자동 처리 과정

`terraform apply` 실행 시 다음이 자동으로 처리됩니다:
1. DynamoDB 테이블 생성 (users, user_filters, properties, user_filter_matches)
2. Lambda 함수 배포 (필터 관리, 텍스트 파싱, 크롤링, 매칭, 알림)
3. API Gateway 설정 및 엔드포인트 생성
4. SNS 토픽 및 CloudWatch 모니터링 설정
5. EventBridge 스케줄러 설정 (크롤링 및 매칭 자동화)

### 5. 출력 값 및 AWS 아키텍처

Terraform 실행 후 다음 정보들이 출력됩니다:

- `api_gateway_invoke_url`: API 엔드포인트 URL
- `dynamodb_tables`: 생성된 DynamoDB 테이블 목록
- `sns_topic_arn`: 알림용 SNS 토픽 ARN

배포되는 AWS 아키텍처:
- **API Gateway**: REST API 엔드포인트 제공
- **Lambda Functions**: 비즈니스 로직 처리 (필터 관리, 텍스트 파싱, 크롤링, 매칭)
- **DynamoDB**: 사용자, 필터, 매물 데이터 저장
- **SNS**: 푸시 알림 발송
- **EventBridge**: 정기적 크롤링 및 매칭 스케줄링
- **CloudWatch**: 로그 및 모니터링

### 6. API 테스트

배포 완료 후 API 테스트:

```bash
# 텍스트 파싱 테스트
curl -X POST https://{api-id}.execute-api.us-east-1.amazonaws.com/prod/v1/filters/parse \
  -H "Content-Type: application/json" \
  -d '{"type":"text","content":"강남구 전세 3억 이하 남향"}'

# 필터 등록 테스트
curl -X POST https://{api-id}.execute-api.us-east-1.amazonaws.com/prod/v1/filters \
  -H "X-User-Id: 1" \
  -H "Content-Type: application/json" \
  -d '{"filterName":"테스트 필터","conditions":{"local1":"서울시","local2":"강남구","propertyType":"LEASE"}}'
```

### 7. 리소스 정리

인프라를 삭제하려면:

```bash
# Terraform으로 리소스 삭제
terraform destroy
```

**주의**: DynamoDB 테이블에 데이터가 있는 경우 삭제 보호가 활성화되어 있을 수 있습니다.

## 프로젝트 기대 효과 및 예상 사용 사례

### 1. 기대 효과
- **부동산 검색 효율성 향상**: 여러 부동산 앱을 돌아다니며 매물을 찾는 시간을 대폭 단축
- **놓치는 매물 최소화**: 실시간 알림으로 원하는 조건의 매물이 나오자마자 즉시 확인 가능
- **소심한 성격 극복**: 부동산에 직접 전화하지 않고도 원하는 매물 정보를 받을 수 있음
- **조건 명확화**: 자연어 파싱을 통해 막연한 조건을 구체적인 검색 조건으로 변환
- **시간 절약**: 이미 본 매물과 새로운 매물을 구분하여 중복 확인 시간 제거

### 2. 예상 사용 사례
- **실사용자**: 바쁜 일상 중에도 원하는 조건의 매물이 나오면 즉시 알림을 받아 시간을 절약하며 효율적으로 집 구하기
- **투자자**: 투자 목적의 부동산 매물을 지속적으로 모니터링하여 좋은 기회 포착
