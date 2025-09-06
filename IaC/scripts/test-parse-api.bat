@echo off
chcp 65001
echo "=== 텍스트 파싱 API 테스트 ==="

REM API URL 설정
set API_URL=https://8pm5j6aiuc.execute-api.us-east-1.amazonaws.com/prod

echo.
echo "1. 텍스트 파싱 테스트 - 강남구 전세 3억 이하 남향"
curl -X POST %API_URL%/v1/filters/parse ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"text\",\"content\":\"강남구 전세 3억 이하 남향\"}"

echo.
echo.
echo "2. 텍스트 파싱 테스트 - 마포구 월세 100만원 이하 지하철역 근처"
curl -X POST %API_URL%/v1/filters/parse ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"text\",\"content\":\"마포구 월세 100만원 이하 지하철역 근처\"}"

echo.
echo.
echo "3. 텍스트 파싱 테스트 - 분당 신도시 아파트 매매 10억 이하"
curl -X POST %API_URL%/v1/filters/parse ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"text\",\"content\":\"분당 신도시 아파트 매매 10억 이하\"}"

echo.
echo.
echo "4. 텍스트 파싱 테스트 - 2호선 역세권 전세 5억 이하 남향"
curl -X POST %API_URL%/v1/filters/parse ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"text\",\"content\":\"2호선 역세권 전세 5억 이하 남향\"}"

echo.
echo.
echo "5. 파싱 실패 케이스 테스트 - 그냥 좋은 집 찾아줘"
curl -X POST %API_URL%/v1/filters/parse ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"text\",\"content\":\"그냥 좋은 집 찾아줘\"}"

echo.
echo.
echo "=== 테스트 완료 ==="
pause