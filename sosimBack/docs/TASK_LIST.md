# 소심하지만 집은 구하고 싶어 - Task List

## Phase 1: 기본 인프라 구축 ✅ COMPLETED

### 1.1 AWS 인프라 설정
- [x] DynamoDB 테이블 생성 (4개)
  - [x] users (회원기본)
  - [x] user_filters (회원필터기본) 
  - [x] properties (매물기본)
  - [x] user_filter_matches (회원필터매칭매물)
- [x] Lambda IAM 역할 및 정책 설정
- [x] API Gateway REST API 생성
- [x] EventBridge 스케줄 설정 (1분 주기)
- [x] SNS 토픽 생성

### 1.2 프로젝트 구조 정리
- [x] IaC 디렉토리 분리
- [x] .gitignore 설정 (대용량 파일 제외)
- [x] 배포 스크립트 정리
- [x] README 문서 현행화

## Phase 2: 핵심 API 구현 ✅ COMPLETED

### 2.1 필터 관리 API
- [x] POST /v1/filters - 필터 등록
  - [x] 입력 검증 로직
  - [x] filterId 자동 증가 로직
  - [x] DynamoDB 저장 (실제 DB 연결)
- [x] GET /v1/filters - 필터 목록 조회
  - [x] userId별 필터 조회
  - [x] DynamoDB 쿼리 (실제 DB 연결)
- [x] DELETE /v1/filters/{filterId} - 필터 삭제
  - [x] 필터 존재 여부 확인
  - [x] 소프트 삭제 (isActive = false)

### 2.2 매칭 및 히스토리 API
- [x] GET /v1/filters/{filterId}/matches - 매칭 매물 조회
  - [x] 필터 조건 기반 매물 검색
  - [x] 필터 생성 이후 매물만 조회
- [x] GET /v1/filters/{filterId}/history - 히스토리 조회
  - [x] 필터 생성 이전 매물 조회
  - [x] 매물 정보 조인

### 2.3 Lambda 런타임 최적화
- [x] Node.js 18.x → 16.x 변경 (AWS SDK v2 호환)
- [x] 모든 Lambda 함수 런타임 통일
- [x] API 테스트 및 검증

## Phase 3: 크롤링 시스템 구현 ✅ COMPLETED

### 3.1 직방 크롤링 Lambda
- [x] crawlZigbang 함수 구현
  - [x] 직방 API 연동
  - [x] 매물 데이터 파싱 및 변환
  - [x] DynamoDB 저장 로직
  - [x] 중복 방지 로직
- [x] search.js 모듈 구현
  - [x] 다중 지역 검색 로직
  - [x] API 호출 최적화

### 3.2 매물 매칭 Lambda
- [x] matchProperties 함수 구현
  - [x] 필터 조건 매칭 로직
  - [x] 가격, 지역, 매물타입 등 조건 처리
  - [x] 매칭 결과 저장

## Phase 4: 알림 시스템 구현 ✅ COMPLETED

### 4.1 SNS 푸시 알림
- [x] sendNotifications 함수 구현
  - [x] 매칭된 매물에 대한 알림 생성
  - [x] SNS 푸시 메시지 발송
  - [x] 알림 발송 이력 관리
- [x] 푸시 메시지 템플릿 설계
  - [x] "[필터명]에 어울리는 집 n건 발견" 형식
  - [x] 매물 요약 정보 포함

### 4.2 EventBridge 통합
- [x] 1분 주기 스케줄링 설정
- [x] crawlZigbang → matchProperties 연동
- [x] matchProperties → sendNotifications 연동

## Phase 5: 테스트 및 모니터링 🧪 PENDING

### 5.1 통합 테스트
- [x] API 엔드포인트 테스트
- [x] sendNotifications Lambda 단위 테스트
- [x] 전체 크롤링 → 매칭 → 알림 플로우 테스트
- [x] 에러 처리 개선 및 로깅 강화
- [ ] 부하 테스트

### 5.2 모니터링 설정
- [x] CloudWatch 대시보드 구성
- [x] 사용자 정의 메트릭 설정
- [ ] 알람 설정 (에러율, 응답시간)
- [ ] 로그 분석 설정

## 현재 상태 Summary

### ✅ 완료된 작업
- AWS 인프라 구축 (DynamoDB, Lambda, API Gateway, EventBridge, SNS)
- 5개 API 엔드포인트 구현 및 테스트 완료
- 직방 크롤링 시스템 구현
- 매물 매칭 로직 구현
- SNS 푸시 알림 시스템 구현
- 전체 크롤링 → 매칭 → 알림 플로우 완성
- 프로젝트 구조 정리 및 문서화

### 🔄 진행 중인 작업
- 없음 (모든 핵심 기능 완성)

### 📱 대기 중인 작업
- 통합 테스트
- 모니터링 설정

### 🌐 배포된 API
- **도메인**: https://8pm5j6aiuc.execute-api.us-east-1.amazonaws.com/prod
- **상태**: 정상 작동 중
- **크롤링**: 1분 주기 자동 실행 중

## 다음 우선순위 작업
1. **sendNotifications Lambda 함수 완성**
2. **크롤링 → 매칭 → 알림 플로우 테스트**
3. **CloudWatch 모니터링 설정**
4. **에러 처리 및 로깅 개선**