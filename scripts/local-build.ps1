# Load .env.local into process environment and run Pages build script (PowerShell)
$envFile = Join-Path $PSScriptRoot '..\.env.local'
if (Test-Path $envFile) {
  Write-Host "Loading env from: $envFile"
  Get-Content $envFile | ForEach-Object {
    if ($_ -and -not ($_ -match '^\s*#')) {
      $parts = $_ -split('=',2)
      if ($parts.Length -eq 2) {
        $k = $parts[0].Trim()
        $v = $parts[1].Trim()
        Write-Host "Setting env: $k"
        [System.Environment]::SetEnvironmentVariable($k, $v, 'Process')
      }
    }
  }
} else {
  Write-Host ".env.local not found at $envFile"
}

Write-Host "Node version:"; node -v
Write-Host "pnpm version:"; pnpm -v

Write-Host "Running verify/generate/build steps in PowerShell sequence..."

# Ensure NEXT flags are set in this process (local build uses static data flag only)
[System.Environment]::SetEnvironmentVariable('NEXT_PUBLIC_USE_STATIC_DATA','1','Process')

node scripts/verify-pages-env.mjs
node scripts/generate-thumbnails.mjs
node scripts/build-public-json.mjs

Write-Host "Starting Next build"
npx next build
