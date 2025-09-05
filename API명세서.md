# API 명세서

## 1. 필터 관리

### 1.1 필터 등록
```
POST /v1/filters
- 필터 등록 (사용자1이 여러개 필터 생성 가능)
- Headers: { "X-User-Id": "1" }
- Body: {
    filterName: "강남 전세",
    conditions: {
      priceMin: 10000,     // 1억원 (만원 단위)
      priceMax: 50000,     // 5억원 (선택)
      direction: ["남", "동"],  // 선택 (배열)
      approvalDateMin: "2010-01-01",  // 선택
      local1: "서울시",     // 선택
      local2: "강남구",     // 선택
      propertyType: "LEASE", // 선택 (LEASE:전세, RENT:월세, SALE:매매)
      floorMin: 3,         // 3층 이상 (선택)
      floorMax: 10         // 10층 이하 (선택)
    }
  }
- Response: { filterId: 1 }
```

### 1.2 필터 삭제
```
DELETE /v1/filters/{filterId}
- 필터 삭제
- Headers: { "X-User-Id": "1" }
- Response: { success: true }
```

### 1.3 필터 목록 조회
```
GET /v1/filters
- 사용자의 모든 필터 목록 조회
- Headers: { "X-User-Id": "1" }
- Response: [
    {
      filterId: 1,
      filterName: "강남 전세",
      conditions: { priceMin: 10000, local1: "서울시", local2: "강남구" },
      isActive: true,
      createdAt: "2024-01-01T10:00:00Z"
    },
    {
      filterId: 2,
      filterName: "홍대 월세",
      conditions: { priceMax: 5000, local2: "마포구" },
      isActive: true,
      createdAt: "2024-01-02T15:30:00Z"
    }
  ]
```

## 2. 히스토리 조회

### 2.1 필터 생성 이후 등록된 매물 조회
```
GET /v1/filters/{filterId}/matches
- 필터 생성 이후에 등록된 매물 중 조건에 맞는 매물 목록
- 알림을 받은 매물들 (DB에 저장된 매칭 히스토리)
- Headers: { "X-User-Id": "1" }
- Query Parameters:
  - page: 페이지 번호 (default: 1)
  - limit: 페이지당 개수 (default: 20, max: 50)
- 예시: GET /v1/filters/2/matches?page=1&limit=20
- Response: {
    totalCount: 12,
    currentPage: 1,
    totalPages: 1,
    matches: [
      {
        "propertyId": "zigbang_12345",
        "matchedAt": "2024-01-15T14:30:00Z",
        "propertyInfo": {
          "title": "강남구 논현동 신축 아파트",
          "price": 45000,
          "propertyType": "LEASE",
          "local1": "서울시",
          "local2": "강남구",
          "local3": "논현동",
          "floor": 5,
          "direction": "남",
          "sourceUrl": "https://zigbang.com/rooms/12345",
          "crawledAt": "2024-01-15T14:30:00Z"
        },
        "notificationSent": true,
        "clickedAt": "2024-01-15T15:45:00Z"
      }
      // ... 11개 더
    ]
  }
```

### 2.2 필터 생성 이전 등록된 매물 조회
```
GET /v1/filters/{filterId}/history
- 필터 생성 이전에 등록된 과거 일주일치 매물 중 조건에 맞는 매물
- 실시간 조회 (별도 DB 저장 안함)
- Headers: { "X-User-Id": "1" }
- Query Parameters:
  - page: 페이지 번호 (default: 1)
  - limit: 페이지당 개수 (default: 20, max: 50)
- 예시: GET /v1/filters/2/history?page=1&limit=20
- Response: {
    totalCount: 33,
    currentPage: 1,
    totalPages: 2,
    properties: [
      {
        "propertyId": "zigbang_67890",
        "title": "강남구 역삼동 오피스텔",
        "price": 35000,
        "propertyType": "LEASE",
        "local1": "서울시",
        "local2": "강남구",
        "local3": "역삼동",
        "floor": 8,
        "direction": "동",
        "sourceUrl": "https://zigbang.com/rooms/67890",
        "crawledAt": "2024-01-10T09:15:00Z"
      }
      // ... 19개 더
    ]
  }
```

## 3. 데이터 타입 정의

### 3.1 필터 조건 (conditions)
```javascript
{
  priceMin: Number,           // 최소가격 (만원 단위, 선택)
  priceMax: Number,           // 최대가격 (만원 단위, 선택)
  direction: Array,           // 방향 (["동", "서", "남", "북"], 선택)
  approvalDateMin: String,    // 최소 사용승인일 ("YYYY-MM-DD", 선택)
  approvalDateMax: String,    // 최대 사용승인일 ("YYYY-MM-DD", 선택)
  local1: String,             // 시 (예: "인천시", 선택)
  local2: String,             // 군/구 (예: "남동구", 선택)
  local3: String,             // 동 (예: "논현동", 선택)
  propertyType: String,       // 매물타입 ("LEASE/RENT/SALE", 선택)
  floorMin: Number,           // 최소 층수 (선택)
  floorMax: Number            // 최대 층수 (선택)
}
```

### 3.2 매물타입 코드
```javascript
const PROPERTY_TYPE = {
  LEASE: "전세",
  RENT: "월세",
  SALE: "매매"
};
```



## 4. Mock 데이터 예시

### 4.1 필터 등록 Mock 데이터
```json
{
  "filterName": "강남 전세 필터",
  "conditions": {
    "priceMin": 20000,
    "priceMax": 80000,
    "direction": ["남", "동"],
    "approvalDateMin": "2015-01-01",
    "local1": "서울시",
    "local2": "강남구",
    "propertyType": "LEASE",
    "floorMin": 3,
    "floorMax": 15
  }
}
```

### 4.2 필터 목록 조회 Mock 응답
```json
[
  {
    "filterId": 1,
    "filterName": "강남 전세 필터",
    "conditions": {
      "priceMin": 20000,
      "priceMax": 80000,
      "direction": ["남", "동"],
      "local1": "서울시",
      "local2": "강남구",
      "propertyType": "LEASE"
    },
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "filterId": 2,
    "filterName": "홍대 월세 필터",
    "conditions": {
      "priceMax": 5000,
      "local2": "마포구",
      "propertyType": "RENT"
    },
    "isActive": true,
    "createdAt": "2024-01-16T14:20:00Z"
  }
]
```

### 4.3 매칭 매물 조회 Mock 응답
```json
{
  "totalCount": 25,
  "currentPage": 1,
  "totalPages": 2,
  "matches": [
    {
      "propertyId": "zigbang_46139342",
      "matchedAt": "2024-01-17T09:15:00Z",
      "propertyInfo": {
        "title": "강남구 논현동 신축 아파트",
        "price": 45000,
        "propertyType": "LEASE",
        "local1": "서울시",
        "local2": "강남구",
        "local3": "논현동",
        "floor": 8,
        "direction": "남",
        "approvalDate": "2020-03-15",
        "sourceUrl": "https://zigbang.com/rooms/46139342",
        "crawledAt": "2024-01-17T09:10:00Z"
      },
      "notificationSent": true,
      "clickedAt": "2024-01-17T10:30:00Z"
    }
  ]
}
```

### 4.4 히스토리 조회 Mock 응답
```json
{
  "totalCount": 18,
  "currentPage": 1,
  "totalPages": 1,
  "properties": [
    {
      "propertyId": "zigbang_46139340",
      "title": "강남구 삼성동 아파트",
      "price": 55000,
      "propertyType": "LEASE",
      "local1": "서울시",
      "local2": "강남구",
      "local3": "삼성동",
      "floor": 6,
      "direction": "남",
      "approvalDate": "2019-11-10",
      "sourceUrl": "https://zigbang.com/rooms/46139340",
      "sourceSite": "직방",
      "crawledAt": "2024-01-14T16:45:00Z",
      "isActive": true
    }
  ]
}
```

### 4.5 테스트용 cURL 명령어
```bash
# 1. 필터 등록
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/v1/filters \
  -H "X-User-Id: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "filterName": "강남 전세 필터",
    "conditions": {
      "priceMin": 20000,
      "priceMax": 80000,
      "local1": "서울시",
      "local2": "강남구",
      "propertyType": "LEASE"
    }
  }'

# 2. 필터 목록 조회
curl -X GET https://your-api-id.execute-api.us-east-1.amazonaws.com/v1/filters \
  -H "X-User-Id: 1"

# 3. 필터별 매칭 매물 조회
curl -X GET https://your-api-id.execute-api.us-east-1.amazonaws.com/v1/filters/1/matches?page=1&limit=20 \
  -H "X-User-Id: 1"

# 4. 필터별 히스토리 조회
curl -X GET https://your-api-id.execute-api.us-east-1.amazonaws.com/v1/filters/1/history?page=1&limit=20 \
  -H "X-User-Id: 1"

# 5. 필터 삭제
curl -X DELETE https://your-api-id.execute-api.us-east-1.amazonaws.com/v1/filters/1 \
  -H "X-User-Id: 1"
```

## 5. 에러 응답

### 5.1 공통 에러 형식
```javascript
{
  error: {
    code: "ERROR_CODE",
    message: "에러 메시지",
    details: "상세 정보"
  }
}
```

### 5.2 에러 코드
- `INVALID_INPUT`: 입력값 오류
- `FILTER_NOT_FOUND`: 필터를 찾을 수 없음
- `USER_NOT_FOUND`: 사용자를 찾을 수 없음
- `INTERNAL_ERROR`: 서버 내부 오류