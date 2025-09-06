@echo off
echo "=== 배포 완료 확인 및 텍스트 파싱 테스트 ==="

set API_URL=https://8pm5j6aiuc.execute-api.us-east-1.amazonaws.com

echo "1. 필터 등록 테스트 (텍스트 파싱 포함)"
curl -X POST %API_URL%/v1/filters ^
  -H "X-User-Id: 1" ^
  -H "Content-Type: application/json" ^
  -d "{\"filterName\":\"강남 전세 테스트\",\"conditions\":{\"priceMin\":20000,\"priceMax\":80000,\"local1\":\"서울시\",\"local2\":\"강남구\",\"propertyType\":\"LEASE\"}}"

echo.
echo "2. 필터 목록 조회"
curl -X GET %API_URL%/v1/filters ^
  -H "X-User-Id: 1"

echo.
echo "3. 크롤링 데이터 확인 (히스토리 조회)"
curl -X GET %API_URL%/v1/filters/1/history ^
  -H "X-User-Id: 1"

pause