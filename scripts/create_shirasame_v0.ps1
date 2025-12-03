Param(
    [string]$Dest = "$(Join-Path (Split-Path -Parent $PWD.Path) 'shirasame-v0')",
    [switch]$InitGit
)

$Src = $PWD.Path
if (Test-Path $Dest) {
    Write-Host "Destination already exists: $Dest"
    exit 1
}

Write-Host "Creating destination: $Dest"
New-Item -ItemType Directory -Path $Dest -Force | Out-Null

# Exclude commonly large/generated or local files
$exclude = @('.git','node_modules','.next','dist','build','pnpm-lock.yaml','.venv','.env','.env.local')

Get-ChildItem -Path $Src -Force | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
    $target = Join-Path $Dest $_.Name
    if ($_.PSIsContainer) {
        Write-Host "Copying folder: $($_.FullName)"
        Copy-Item -Path $_.FullName -Destination $target -Recurse -Force -ErrorAction Stop
    } else {
        Write-Host "Copying file: $($_.FullName)"
        Copy-Item -Path $_.FullName -Destination $target -Force -ErrorAction Stop
    }
}

Write-Host "Files copied to $Dest"

if ($InitGit) {
    Push-Location $Dest
    if (-not (Test-Path ".git")) {
        if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
            Write-Host "Git not found in PATH. Skipping git init. Install Git and run the init commands manually."
        } else {
            git init
            git add .
            git commit -m "Initial import of shirasameProject"
            Write-Host "Git repo initialized and initial commit created."
        }
    } else {
        Write-Host ".git already exists, skipping git init."
    }
    Pop-Location
} else {
    Write-Host "To initialize git in the new repo, run the following commands (from PowerShell):"
    Write-Host "    Push-Location '$Dest'"
    Write-Host "    git init"
    Write-Host "    git branch -M main"
    Write-Host "    git remote add origin <YOUR_REMOTE_URL>"
    Write-Host "    git add ."
    Write-Host "    git commit -m 'Initial import of shirasameProject'"
    Write-Host "    git push -u origin main"
    Write-Host "    Pop-Location"
}

Write-Host "Done."
