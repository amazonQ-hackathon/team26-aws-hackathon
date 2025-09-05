# API 명세서

## 1. 필터 관리

### 1.1 필터 등록
```
POST /api/filters
- 필터 등록 (사용자1이 여러개 필터 생성 가능)
- Body: {
    filterName: "강남 전세",
    conditions: {
      priceMin: 10000,     // 1억원 (만원 단위)
      priceMax: 50000,     // 5억원 (선택)
      direction: "남",      // 선택
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

### 1.2 필터 목록 조회
```
GET /api/users/1/filters
- 사용자1의 모든 필터 목록 조회
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

### 1.3 필터 수정
```
PUT /api/filters/{filterId}
- 필터 수정
- Body: {
    filterName: "수정된 필터명",
    conditions: { ... }
  }
- Response: { success: true }
```

### 1.4 필터 삭제
```
DELETE /api/filters/{filterId}
- 필터 삭제
- Response: { success: true }
```

## 2. 필터 목록 조회

### 2.1 사용자별 필터 목록
```
GET /api/users/{userId}/filters
- 특정 사용자의 모든 필터 목록 조회
- Response: [{ filterId, filterName, conditions, isActive, createdAt }]
```

## 3. 히스토리 조회

### 3.1 매칭 히스토리
```
GET /api/history/1
- 매칭 히스토리 조회 (userId=1 고정)
- Response: [{ filterId, propertyId, matchedAt, propertyInfo }]
```

## 4. 데이터 타입 정의

### 4.1 필터 조건 (conditions)
```javascript
{
  priceMin: Number,           // 최소가격 (만원 단위, 선택)
  priceMax: Number,           // 최대가격 (만원 단위, 선택)
  direction: String,          // 방향 ("동/서/남/북", 선택)
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

### 4.2 매물타입 코드
```javascript
const PROPERTY_TYPE = {
  LEASE: "전세",
  RENT: "월세",
  SALE: "매매"
};
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