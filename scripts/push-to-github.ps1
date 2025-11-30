param(
  [string]$CommitMessage = "Deploy: update from local",
  [string]$RemoteName = "github",
  [string]$RemoteBranch = "main",
  [string]$LocalBranch = "detabase"
)

# 安全チェック
Write-Host "Working dir:`t" (Get-Location).Path
Write-Host "確認: 未コミットの変更をチェックします..."
$porcelain = git status --porcelain
if ($porcelain) {
  Write-Host "未コミットの変更があります。まず変更を確認してください:"
  git status
  exit 1
}

# remote が存在するか
$remotes = git remote
if (-not ($remotes -contains $RemoteName)) {
  Write-Host "リモート '$RemoteName' が見つかりません。追加します。"
  $url = Read-Host "追加するリモート URL を入力してください (例: https://github.com/あなた/リポ.git)"
  git remote add $RemoteName $url
}

# ブランチ確認
$cur = git branch --show-current
if ($cur -ne $LocalBranch) {
  Write-Host "現在のブランチは '$cur' です。続けるには Enter を、切り替える場合は 'y' を入力してください。"
  $ans = Read-Host "'$LocalBranch' に切り替えますか? (y/N)"
  if ($ans -eq 'y') { git checkout $LocalBranch } else { Write-Host '続行します（現在のブランチのまま）' }
}

# commit & push
Write-Host "ステージングしてコミットします..."
git add -A
# 空コミットは作らない
$hasChanges = git status --porcelain
if (-not $hasChanges) {
  Write-Host "コミットする変更がありません。処理を終了します。"
  exit 0
}

git commit -m "$CommitMessage"
if ($LASTEXITCODE -ne 0) { Write-Host "commit に失敗しました"; exit 1 }

Write-Host "push を実行します -> $RemoteName $LocalBranch:$RemoteBranch"
git push $RemoteName $LocalBranch:$RemoteBranch
if ($LASTEXITCODE -ne 0) { Write-Host "push に失敗しました。認証情報を確認してください。"; exit 1 }

Write-Host "push 成功しました。"
Write-Host "Vercel が自動デプロイを開始します（GitHub→Vercel の連携が有効な場合）。"