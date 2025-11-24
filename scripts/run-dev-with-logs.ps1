param(
  [string]$LogFile = ".\\dev-server.log"
)

Write-Host "== v0-samehome: run-dev-with-logs.ps1 =="
Write-Host "Log file: $LogFile"

# Try install once, fallback to legacy peer deps if needed
Write-Host "[1/3] npm install (attempt)"
$installed = $false
try {
    npm install --no-audit --no-fund
    $installed = $true
} catch {
    Write-Host "npm install failed, retrying with --legacy-peer-deps..."
    try { npm install --legacy-peer-deps; $installed = $true } catch { }
}
if (-not $installed) {
    Write-Host "npm install failed. Inspect output above. You can try: npm install --legacy-peer-deps"
    exit 1
}

Write-Host "[2/3] Removing previous log if exists: $LogFile"
if (Test-Path $LogFile) { Remove-Item $LogFile -Force }

Write-Host "[3/3] Starting dev server and streaming logs to $LogFile"
Write-Host "Press Ctrl+C in this terminal to stop the dev server."

# Start the dev server and tee output to the log file
# Use PowerShell Start-Process to open a new window that will stay interactive.
$command = "npm run dev *>&1 | Tee-Object -FilePath '$LogFile'"
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", $command -WindowStyle Normal

Write-Host "Dev server started in a new terminal window. Wait for startup messages, then reproduce the login flow in the browser."
Write-Host "After reproducing, attach the log file '$LogFile' contents here. Also run scripts/check-cookies.ps1 to report cookies seen by the server."
