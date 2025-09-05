@echo off
echo "=== API 테스트 스크립트 ==="

REM API URL을 환경변수로 설정 (배포 후 실제 URL로 변경)
set API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com

echo "1. 필터 등록 테스트"
curl -X POST %API_URL%/v1/filters ^
  -H "X-User-Id: 1" ^
  -H "Content-Type: application/json" ^
  -d "{\"filterName\":\"테스트 필터\",\"conditions\":{\"priceMin\":10000,\"priceMax\":50000,\"local1\":\"서울시\",\"local2\":\"강남구\"}}"

echo.
echo "2. 필터 목록 조회 테스트"
curl -X GET %API_URL%/v1/filters ^
  -H "X-User-Id: 1"

echo.
echo "3. 크롤링 Lambda 수동 실행 (EventBridge 대신)"
echo "AWS 콘솔에서 house-finder-crawl-zigbang 함수를 수동 실행하세요"

echo.
echo "4. 필터별 히스토리 조회 테스트 (filterId=1)"
curl -X GET %API_URL%/v1/filters/1/history ^
  -H "X-User-Id: 1"

pause