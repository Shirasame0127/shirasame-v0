#!/usr/bin/env pwsh
# Script: remove_admin_next.ps1
# Usage: run from repository root (PowerShell)
try {
  Write-Host "Removing admin-site/.next from git tracking and filesystem..."
  git rm -r --cached admin-site/.next -f
} catch {
  Write-Host "git rm may have failed or .next not tracked: $_"
}
try {
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "admin-site\.next"
  Write-Host "Removed admin-site/.next from filesystem (if present)."
} catch {
  Write-Host "Failed to remove admin-site/.next from filesystem: $_"
}
Write-Host "Next steps: git add admin-site/.gitignore; git commit -m 'chore: ignore admin-site/.next' && git push"