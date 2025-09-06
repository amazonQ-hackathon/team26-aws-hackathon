@echo off
chcp 65001 >nul
echo === House Finder Deploy Start ===

echo 1. Lambda Function Packaging...

REM registerFilter 패키징
cd ..\sosimBack\lambda\registerFilter
if exist registerFilter.zip del registerFilter.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath registerFilter.zip
move registerFilter.zip ..\..\..\IaC\build\
cd ..\..\..\IaC

REM getFilters 패키징
cd ..\sosimBack\lambda\getFilters
if exist getFilters.zip del getFilters.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath getFilters.zip
move getFilters.zip ..\..\..\IaC\build\
cd ..\..\..\IaC

REM deleteFilter 패키징
cd ..\sosimBack\lambda\deleteFilter
if exist deleteFilter.zip del deleteFilter.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath deleteFilter.zip
move deleteFilter.zip ..\..\..\IaC\build\
cd ..\..\..\IaC

REM getMatches 패키징
cd ..\sosimBack\lambda\getMatches
if exist getMatches.zip del getMatches.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath getMatches.zip
move getMatches.zip ..\..\..\IaC\build\
cd ..\..\..\IaC

REM getHistory 패키징
cd ..\sosimBack\lambda\getHistory
if exist getHistory.zip del getHistory.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath getHistory.zip
move getHistory.zip ..\..\..\IaC\build\
cd ..\..\..\IaC

REM crawlZigbang 패키징
cd ..\sosimBack\lambda\crawlZigbang
if exist crawlZigbang.zip del crawlZigbang.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath crawlZigbang.zip
move crawlZigbang.zip ..\..\..\IaC\build\
cd ..\..\..\IaC

REM matchProperties 패키징
cd ..\sosimBack\lambda\matchProperties
if exist matchProperties.zip del matchProperties.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath matchProperties.zip
move matchProperties.zip ..\..\..\IaC\build\
cd ..\..\..\IaC

REM sendNotifications 패키징
cd ..\sosimBack\lambda\sendNotifications
if exist sendNotifications.zip del sendNotifications.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath sendNotifications.zip
move sendNotifications.zip ..\..\..\IaC\build\
cd ..\..\..\IaC

REM parseNaturalFilter 패키징
cd ..\sosimBack\lambda\parseNaturalFilter
if exist parseNaturalFilter.zip del parseNaturalFilter.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath parseNaturalFilter.zip
move parseNaturalFilter.zip ..\..\..\IaC\build\
cd ..\..\..\IaC

echo 2. Terraform Initialize...
terraform init

echo 3. Terraform Deploy Running...
terraform apply -auto-approve

echo 4. Deploy Complete! API URL:
terraform output api_gateway_invoke_url

echo 5. Auto System Started:
echo - EventBridge starts crawling every 1 minute
echo - Auto matching and notification when new properties found
echo 6. Test Command:
echo curl -X POST [API_URL]/v1/filters -H "X-User-Id: 1" -H "Content-Type: application/json" -d "{\"filterName\":\"Test Filter\"}"

cd ..
echo === Deploy Complete ===
pause