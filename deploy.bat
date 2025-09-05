@echo off
echo "=== House Finder 배포 시작 ==="

echo "1. Lambda 함수 패키징..."

REM registerFilter 패키징
cd lambda\registerFilter
if exist registerFilter.zip del registerFilter.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath registerFilter.zip
move registerFilter.zip ..\..\terraform\
cd ..\..

REM getFilters 패키징
cd lambda\getFilters
if exist getFilters.zip del getFilters.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath getFilters.zip
move getFilters.zip ..\..\terraform\
cd ..\..

REM deleteFilter 패키징
cd lambda\deleteFilter
if exist deleteFilter.zip del deleteFilter.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath deleteFilter.zip
move deleteFilter.zip ..\..\terraform\
cd ..\..

REM getMatches 패키징
cd lambda\getMatches
if exist getMatches.zip del getMatches.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath getMatches.zip
move getMatches.zip ..\..\terraform\
cd ..\..

REM getHistory 패키징
cd lambda\getHistory
if exist getHistory.zip del getHistory.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath getHistory.zip
move getHistory.zip ..\..\terraform\
cd ..\..

REM crawlZigbang 패키징
cd lambda\crawlZigbang
if exist crawlZigbang.zip del crawlZigbang.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath crawlZigbang.zip
move crawlZigbang.zip ..\..\terraform\
cd ..\..

REM matchProperties 패키징
cd lambda\matchProperties
if exist matchProperties.zip del matchProperties.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath matchProperties.zip
move matchProperties.zip ..\..\terraform\
cd ..\..

echo "2. Terraform 초기화..."
cd terraform
terraform init

echo "3. Terraform 계획 확인..."
terraform plan

echo "4. 배포 진행하시겠습니까? (y/n)"
set /p answer=
if /i "%answer%"=="y" (
    echo "5. Terraform 배포 실행..."
    terraform apply -auto-approve
    
    echo "6. 배포 완료! API URL 확인:"
    terraform output api_gateway_invoke_url
    
    echo "7. 자동 시스템 시작:"
    echo "- EventBridge가 1분마다 크롤링 시작"
    echo "- 새 매물 발견 시 자동 매칭 및 알림 발송"
    echo "8. 테스트 명령어:"
    echo "curl -X POST [API_URL]/v1/filters -H 'X-User-Id: 1' -H 'Content-Type: application/json' -d '{\"filterName\":\"테스트 필터\"}'"
) else (
    echo "배포가 취소되었습니다."
)

cd ..
echo "=== 배포 완료 ==="
pause