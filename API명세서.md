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

### 2.1 매칭 히스토리
```
GET /v1/history/{filterId}
- 특정 필터의 매칭 히스토리 조회
- Headers: { "X-User-Id": "1" }
- 예시: GET /v1/history/2 (2번 필터 히스토리)
- Response: [
    {
      "propertyId": "zigbang_12345",
      "matchedAt": "2024-01-15T14:30:00Z",
      "propertyInfo": {
        "title": "강남구 논현동 신축 아파트",
        "price": 45000,
        "propertyType": "LEASE",
        "local2": "강남구",
        "floor": 5,
        "sourceUrl": "https://zigbang.com/rooms/12345"
      },
      "notificationSent": true,
      "clickedAt": "2024-01-15T15:45:00Z"
    }
  ]
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



## 4. 에러 응답

### 4.1 공통 에러 형식
```javascript
{
  error: {
    code: "ERROR_CODE",
    message: "에러 메시지",
    details: "상세 정보"
  }
}
```

### 4.2 에러 코드
- `INVALID_INPUT`: 입력값 오류
- `FILTER_NOT_FOUND`: 필터를 찾을 수 없음
- `USER_NOT_FOUND`: 사용자를 찾을 수 없음
- `INTERNAL_ERROR`: 서버 내부 오류