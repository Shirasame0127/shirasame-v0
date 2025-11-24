<#
Interactive helper to create .env.local and start the dev server for the v0-samehome app.
This script prompts for SUPABASE values, writes `v0-samehome/.env.local`, and runs the dev server.

Usage (PowerShell):
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  .\v0-samehome\start-dev.ps1
#>

function Prompt-Secret($prompt, $default = '') {
  $val = Read-Host -Prompt $prompt
  if ([string]::IsNullOrWhiteSpace($val)) { return $default }
  return $val
}

$root = Join-Path $PSScriptRoot ''
$appDir = Join-Path $PSScriptRoot '.'
$envPath = Join-Path $PSScriptRoot '.\.env.local'

Write-Host "This helper will create (or overwrite) `v0-samehome\.env.local` and start the dev server."
Write-Host "If you already have an .env.local, stop now (Ctrl+C) and edit it manually."

$supabaseUrl = Prompt-Secret 'SUPABASE_URL (ex: https://your-project.supabase.co)'
$supabaseKey = Prompt-Secret 'SUPABASE_SERVICE_ROLE_KEY (service role key)'

if ([string]::IsNullOrWhiteSpace($supabaseUrl) -or [string]::IsNullOrWhiteSpace($supabaseKey)) {
  Write-Host "Missing values. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Aborting." -ForegroundColor Red
  exit 1
}

$content = @"
SUPABASE_URL=$supabaseUrl
SUPABASE_SERVICE_ROLE_KEY=$supabaseKey
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
"@

Set-Content -Path $envPath -Value $content -Encoding UTF8
Write-Host ".env.local written to: $envPath"

Write-Host "Starting dev server (this will block the terminal). Press Ctrl+C to stop."
npm --prefix .\ run dev
