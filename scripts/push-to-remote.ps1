Param(
    [string]$RemoteUrl,
    [switch]$Force
)

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git not found in PATH. Install Git and run these commands manually."
    exit 1
}

Push-Location "$PSScriptRoot\.."

if (-not (Test-Path ".git")) {
    git init
}

# Set local repo user to avoid commit errors
git config user.name "shirasame-importer"
git config user.email "devnull@example.com"

git add .
if ($Force) {
    git commit -m "Initial import of shirasameProject" --allow-empty || Write-Host "Commit failed or no changes to commit."
} else {
    git commit -m "Initial import of shirasameProject" || Write-Host "Commit failed or no changes to commit."
}

if ($RemoteUrl) {
    git remote add origin $RemoteUrl -f 2>$null || Write-Host "Could not add remote."
    Write-Host "To push to remote, run: git push -u origin main"
} else {
    Write-Host "No remote specified. To add and push, run: git remote add origin <URL>; git push -u origin main"
}

Pop-Location
