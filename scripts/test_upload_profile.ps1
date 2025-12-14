<#
PowerShell test script: upload local file to public-worker and complete profile image assignment

Usage:
  Open PowerShell and run:
    $env:SB_TOKEN = '<your sb-access-token here>'
    pwsh ./scripts/test_upload_profile.ps1

This script performs:
 1. POST multipart file to public-worker /api/images/upload
 2. POST /api/images/complete with target=profile to trigger profile_image_key assignment
 3. GET /api/auth/whoami to obtain user id
 4. GET /api/admin/users/<id> to verify profile_image_key was set
 5. GET /images/<key> to verify object is retrievable from the worker (R2 fallback)

Notes:
- Requires `curl.exe` available on PATH (Windows ships curl.exe).
- You must run this from the repo root so the relative path to test-upload.png resolves.
- This script does network calls to your public-worker and Supabase via the worker. The assistant cannot run these calls for you.
#>

Set-StrictMode -Version Latest

# Read token
$token = $env:SB_TOKEN
if (-not $token -or $token.Trim().Length -eq 0) {
    Write-Error 'Please set environment variable SB_TOKEN with your sb-access-token. Example:`n$env:SB_TOKEN="<token>"'
    exit 1
}

# Determine repository root relative to this script so user can run from any cwd
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
$filePath = Join-Path -Path $repoRoot -ChildPath 'public-worker/test-upload.png'
if (-not (Test-Path $filePath)) {
    Write-Error "Test file not found: $filePath"
    exit 1
}

$workerBase = 'https://public-worker.shirasame-official.workers.dev'

Write-Host '1) Uploading file to public-worker /api/images/upload...'

# Build simple curl command with explicit string args to avoid PowerShell parsing issues
$uploadArgs = @(
    '-sS',
    '-X', 'POST',
    "$workerBase/api/images/upload",
    '-H', "Cookie: sb-access-token=$token",
    '-F', "file=@$filePath"
)

$uploadOut = & 'curl.exe' @uploadArgs
if (-not $uploadOut) {
    Write-Error 'Upload returned empty response'
    exit 1
}
Write-Host "Upload response:`n$uploadOut`n"

try { $uploadJson = $uploadOut | ConvertFrom-Json } catch { $uploadJson = $null }

# Try to extract key from common locations
$key = $null
if ($uploadJson -ne $null) {
    if ($uploadJson.key) { $key = $uploadJson.key }
    elseif ($uploadJson.result -and $uploadJson.result.id) { $key = $uploadJson.result.id }
    elseif ($uploadJson.data -and $uploadJson.data.key) { $key = $uploadJson.data.key }
}

if (-not $key) {
    Write-Host 'Could not extract key from upload response. You may need to call direct-upload flow instead. Full response above.'
} else { Write-Host "Extracted key: $key" }

Write-Host '2) Resolving user id via /api/auth/whoami'
$whoamiOut = & 'curl.exe' '-sS' '-X' 'GET' "$workerBase/api/auth/whoami" '-H' "Cookie: sb-access-token=$token"
try { $whoamiJson = $whoamiOut | ConvertFrom-Json } catch { $whoamiJson = $null }
if ($whoamiJson -and $whoamiJson.user -and $whoamiJson.user.id) {
    $userId = $whoamiJson.user.id
    Write-Host "whoami user id: $userId"
} else {
    Write-Host "whoami did not return user info. Response:`n$whoamiOut`n"
    $userId = $null
}

Write-Host '3) Calling /api/images/complete to persist key and assign to profile (target=profile)'
if (-not $key) { Write-Host 'No key available; you can still try to POST multipart directly to /api/images/complete with a chosen key.' }

$completeBody = @{ key = $key; filename = [System.IO.Path]::GetFileName($filePath); target = 'profile' } | ConvertTo-Json -Depth 5
$completeOut = & 'curl.exe' '-sS' '-X' 'POST' "$workerBase/api/images/complete" '-H' 'Content-Type: application/json' '-H' "Cookie: sb-access-token=$token" '-d' $completeBody
Write-Host "complete response:`n$completeOut`n"
try { $completeJson = $completeOut | ConvertFrom-Json } catch { $completeJson = $null }

if ($completeJson -and $completeJson.key) { $finalKey = $completeJson.key } elseif ($key) { $finalKey = $key } else { $finalKey = $null }

if (-not $finalKey) { Write-Error 'No final key available after complete step'; exit 1 }
Write-Host "Final key to verify: $finalKey"

Write-Host '4) Verify user record via /api/admin/users/<id> (requires admin permissions or owner)'
if ($userId) {
    $userOut = & 'curl.exe' '-sS' '-X' 'GET' "$workerBase/api/admin/users/$userId" '-H' "Cookie: sb-access-token=$token"
    Write-Host "user record response:`n$userOut`n"
    try { $userJson = $userOut | ConvertFrom-Json } catch { $userJson = $null }
    if ($userJson -and $userJson.data) {
        $profileKey = $userJson.data.profile_image_key
        Write-Host "user.profile_image_key => $profileKey"
        if ($profileKey -and $profileKey -eq $finalKey) { Write-Host 'OK: profile_image_key matches uploaded key.' } else { Write-Warning 'profile_image_key does not match final key.' }
    }
} else { Write-Warning 'No user id resolved; cannot GET user record.' }

Write-Host '5) Verify object retrievable from worker R2 fallback: GET /images/<key>'
$status = & 'curl.exe' '-sS' '-o' 'NUL' '-w' '%{http_code}' "$workerBase/images/$finalKey"
Write-Host "GET /images/$finalKey returned HTTP status: $status"
if ($status -eq '200') { Write-Host 'OK: image is retrievable from worker (R2).' } else { Write-Warning "Image not retrievable (status $status)." }

Write-Host 'Test script finished. Inspect above responses for debugging details.'
