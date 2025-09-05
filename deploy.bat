@echo off
echo "=== House Finder 배포 시작 ==="

echo "1. Lambda 함수 패키징..."
cd lambda\registerFilter
if exist registerFilter.zip del registerFilter.zip
powershell Compress-Archive -Path *.js,*.json -DestinationPath registerFilter.zip
move registerFilter.zip ..\..\terraform\
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
) else (
    echo "배포가 취소되었습니다."
)

cd ..
echo "=== 배포 완료 ==="
pause