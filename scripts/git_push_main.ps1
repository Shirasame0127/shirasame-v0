Set-Location 'C:\Users\tensho\Documents\dev\shirasame-v0'
$s = git status --porcelain
if ($s -ne '') {
  git add -A
  git commit -m 'admin: handle worker {data} responses, cookie fallback for admin APIs, update product/collection/recipe/dashboard handlers, prepare build artifact'
} else {
  Write-Output 'No changes to commit'
}
# Attempt to push; may prompt for credentials if not configured
git push origin main
