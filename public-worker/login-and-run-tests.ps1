# login-and-run-tests.ps1
$ErrorActionPreference = 'Stop'

$supabaseBase = 'https://zikwelnhcpnnpurlomrf.supabase.co'
$anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inppa3dlbG5oY3BubnB1cmxvbXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjU3MjksImV4cCI6MjA3OTMwMTcyOX0.jpXt88FpfYpfni8eHAh2zAXl22biBruWHA-MPnu4F1A'

$email = 'shirasame.official@gmail.com'
$password = 'Iloilo2525'

$tokenPath = Join-Path $PSScriptRoot 'test_results\supabase_token.json'

# Request token (grant_type=password) — send JSON body
$tokenUrl = "${supabaseBase}/auth/v1/token"
$bodyObj = @{ grant_type = 'password'; email = $email; password = $password }
$body = $bodyObj | ConvertTo-Json

$headers = @{
    'apikey' = $anonKey
    'Content-Type' = 'application/json'
}

Write-Output "Requesting Supabase token (JSON)..."
$curlArgs = @('-s','-S','-o',$tokenPath,'-w','%{http_code}','-X','POST',$tokenUrl)
foreach ($k in $headers.GetEnumerator()) { $curlArgs = $curlArgs + ('-H',"$($k.Key): $($k.Value)") }
$curlArgs = $curlArgs + ('--data', $body)
$code = & curl.exe @curlArgs
if ($LASTEXITCODE -ne 0) { Write-Error "curl failed with exit $LASTEXITCODE"; exit 1 }
if ($code -ne '200') { Write-Error "Token request failed HTTP $code (see $tokenPath)"; exit 1 }

# Parse token JSON
$tokenJson = Get-Content -Raw $tokenPath | ConvertFrom-Json
$access = $tokenJson.access_token
$refresh = $tokenJson.refresh_token
$userId = $tokenJson.user.id
if (-not $access) { Write-Error 'No access token returned'; exit 1 }

# Build cookie string
$cookie = "sb-access-token=$access; sb-refresh-token=$refresh"

# Prepare tests (same as run_admin_tests.ps1)
$tests = @(
    @{ name = 'GET_site-settings'; method='GET'; url='https://admin.shirasame.com/api/site-settings'; body=$null },
    @{ name = 'GET_admin_tag-groups'; method='GET'; url='https://admin.shirasame.com/api/admin/tag-groups'; body=$null },
    @{ name = 'POST_admin_tag-groups'; method='POST'; url='https://admin.shirasame.com/api/admin/tag-groups'; body='{"name":"test-group-xyz","label":"テストグループ"}' },
    @{ name = 'POST_admin_tags'; method='POST'; url='https://admin.shirasame.com/api/admin/tags'; body='{"name":"test-tag-xyz","label":"テストタグ"}' },
    @{ name = 'GET_admin_collections'; method='GET'; url='https://admin.shirasame.com/api/admin/collections'; body=$null },
    @{ name = 'POST_admin_collections'; method='POST'; url='https://admin.shirasame.com/api/admin/collections'; body='{"name":"test-collection-xyz"}' },
    @{ name = 'GET_admin_products'; method='GET'; url='https://admin.shirasame.com/api/admin/products'; body=$null },
    @{ name = 'POST_admin_products'; method='POST'; url='https://admin.shirasame.com/api/admin/products'; body='{"title":"テスト商品","status":"draft"}' },
    @{ name = 'GET_recipes'; method='GET'; url='https://admin.shirasame.com/api/recipes'; body=$null },
    @{ name = 'GET_admin_recipe-pins'; method='GET'; url='https://admin.shirasame.com/api/recipe-pins'; body=$null },
    @{ name = 'GET_auth_whoami'; method='GET'; url='https://admin.shirasame.com/api/auth/whoami'; body=$null },
    @{ name = 'POST_auth_refresh'; method='POST'; url='https://admin.shirasame.com/api/auth/refresh'; body=$null },
    @{ name = 'POST_images_direct-upload'; method='POST'; url='https://admin.shirasame.com/api/images/direct-upload'; body=$null },
    @{ name = 'GET_api_products_public'; method='GET'; url='https://admin.shirasame.com/api/products'; body=$null }
)

$resultsDir = Join-Path -Path $PSScriptRoot -ChildPath 'test_results'
if (-Not (Test-Path $resultsDir)) { New-Item -ItemType Directory -Path $resultsDir | Out-Null }

foreach ($t in $tests) {
    $outFile = Join-Path $resultsDir ($t.name + '.txt')
    Write-Output "Running $($t.name) -> $($t.method) $($t.url)"

    $cookiePairs = [regex]::Matches($cookie, '([A-Za-z0-9_\\-]+)=[^;]+') | ForEach-Object { $_.Value }
    $cookieClean = ($cookiePairs -join '; ')

    $curl = 'curl.exe'
    $args = @('-i','-m','15','-H', 'Origin: https://admin.shirasame.com', '--cookie', $cookieClean, '-H', "x-user-id: $userId")
    if ($t.body -ne $null) { $args += ('-H','Content-Type: application/json') }
    $args += ('-X', $t.method, $t.url)
    if ($t.body -ne $null) { $args += ('-d', $t.body) }

    try {
        Write-Output "Invoking curl with args: $($args -join ' ')"
        & $curl @args | Tee-Object -FilePath $outFile
    }
    catch {
        "ERROR: $_" | Out-File -FilePath $outFile -Encoding utf8
    }

    Start-Sleep -Seconds 1
}

Write-Output "All tests finished. Results are in $resultsDir"
