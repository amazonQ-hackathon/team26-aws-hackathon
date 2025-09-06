@echo off
echo "Lambda 함수 빌드 시작..."

REM build 디렉토리 생성
if not exist "build" mkdir build

REM parseNaturalFilter 빌드
echo "parseNaturalFilter 빌드 중..."
cd ..\sosimBack\lambda\parseNaturalFilter
tar -a -c -f ..\..\..\IaC\build\parseNaturalFilter.zip *
cd ..\..\..\IaC

REM registerFilter 빌드
echo "registerFilter 빌드 중..."
cd ..\sosimBack\lambda\registerFilter
tar -a -c -f ..\..\..\IaC\build\registerFilter.zip *
cd ..\..\..\IaC

REM getFilters 빌드
echo "getFilters 빌드 중..."
cd ..\sosimBack\lambda\getFilters
tar -a -c -f ..\..\..\IaC\build\getFilters.zip *
cd ..\..\..\IaC

REM deleteFilter 빌드
echo "deleteFilter 빌드 중..."
cd ..\sosimBack\lambda\deleteFilter
tar -a -c -f ..\..\..\IaC\build\deleteFilter.zip *
cd ..\..\..\IaC

REM getMatches 빌드
echo "getMatches 빌드 중..."
cd ..\sosimBack\lambda\getMatches
tar -a -c -f ..\..\..\IaC\build\getMatches.zip *
cd ..\..\..\IaC

REM getHistory 빌드
echo "getHistory 빌드 중..."
cd ..\sosimBack\lambda\getHistory
tar -a -c -f ..\..\..\IaC\build\getHistory.zip *
cd ..\..\..\IaC

REM crawlZigbang 빌드
echo "crawlZigbang 빌드 중..."
cd ..\sosimBack\lambda\crawlZigbang
tar -a -c -f ..\..\..\IaC\build\crawlZigbang.zip *
cd ..\..\..\IaC

REM matchProperties 빌드
echo "matchProperties 빌드 중..."
cd ..\sosimBack\lambda\matchProperties
tar -a -c -f ..\..\..\IaC\build\matchProperties.zip *
cd ..\..\..\IaC

REM sendNotifications 빌드
echo "sendNotifications 빌드 중..."
cd ..\sosimBack\lambda\sendNotifications
tar -a -c -f ..\..\..\IaC\build\sendNotifications.zip *
cd ..\..\..\IaC

echo "Lambda 함수 빌드 완료!"
dir build