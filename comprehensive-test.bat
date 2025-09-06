@echo off
chcp 65001
echo "=== 텍스트 파싱 API 종합 테스트 ==="

set API_URL=https://8pm5j6aiuc.execute-api.us-east-1.amazonaws.com/prod

echo.
echo "1. 강남구 전세 3억 이하 남향"
curl -X POST %API_URL%/v1/filters/parse -H "Content-Type: application/json" -d "{\"type\":\"text\",\"content\":\"강남구 전세 3억 이하 남향\"}"

echo.
echo.
echo "2. 마포구 월세 100만원 이하 지하철역 근처"
curl -X POST %API_URL%/v1/filters/parse -H "Content-Type: application/json" -d "{\"type\":\"text\",\"content\":\"마포구 월세 100만원 이하 지하철역 근처\"}"

echo.
echo.
echo "3. 분당 신도시 아파트 매매 10억 이하"
curl -X POST %API_URL%/v1/filters/parse -H "Content-Type: application/json" -d "{\"type\":\"text\",\"content\":\"분당 신도시 아파트 매매 10억 이하\"}"

echo.
echo.
echo "4. 홍대 근처 월세 80만원 이하 원룸"
curl -X POST %API_URL%/v1/filters/parse -H "Content-Type: application/json" -d "{\"type\":\"text\",\"content\":\"홍대 근처 월세 80만원 이하 원룸\"}"

echo.
echo.
echo "5. 서초구 전세 5억 이상 동향"
curl -X POST %API_URL%/v1/filters/parse -H "Content-Type: application/json" -d "{\"type\":\"text\",\"content\":\"서초구 전세 5억 이상 동향\"}"

echo.
echo.
echo "6. 파싱 실패 케이스 - 그냥 좋은 집 찾아줘"
curl -X POST %API_URL%/v1/filters/parse -H "Content-Type: application/json" -d "{\"type\":\"text\",\"content\":\"그냥 좋은 집 찾아줘\"}"

echo.
echo.
echo "=== 테스트 완료 ==="
pause