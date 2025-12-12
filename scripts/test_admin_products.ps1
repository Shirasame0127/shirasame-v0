Param(
  [string]$AccessToken = $env:ADMIN_TEST_TOKEN,
  [string]$RefreshToken = $env:ADMIN_REFRESH_TOKEN
)
if (-not $AccessToken) { Write-Error 'ADMIN_TEST_TOKEN not set. Set env var or pass -AccessToken'; exit 2 }

$headers = @{
  Origin = 'https://admin.shirasame.com'
  Cookie = "sb-access-token=$AccessToken; sb-refresh-token=$RefreshToken"
}

Write-Host 'Calling /api/auth/whoami'
curl.exe -i @headers "https://admin.shirasame.com/api/auth/whoami"

Write-Host "`nCalling /api/admin/products`
curl.exe -i @headers "https://admin.shirasame.com/api/admin/products"
