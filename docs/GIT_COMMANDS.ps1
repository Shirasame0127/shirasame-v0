# PowerShell: docs をコミットして PR を作るためのコマンド集
# 使い方:
# 1) このファイルを実行可能にするには PowerShell で `.





























}  Write-Host "gh CLI not found. To create a PR manually, visit your repo and open a PR from branch '$branchName' into 'main'."} else {  Write-Host "PR created. Open it in your browser or continue to edit as needed."  gh pr create --fill --base main --head $branchName  Write-Host "Creating PR using gh..."if (Get-Command gh -ErrorAction SilentlyContinue) {# If gh (GitHub CLI) is installed, create a PR automaticallygit push -u $remote $branchNameWrite-Host "Pushing to remote $remote"git commit -m "$commitMessage"Write-Host "Committing: $commitMessage"git add docs/Write-Host "Staging docs changes"git switch -c $branchNameWrite-Host "Creating branch: $branchName")  [string]$remote = "origin"  [string]$commitMessage = "docs: add architecture, api details, migration guide",  [string]$branchName = "docs/add-project-docs",param(# 2) gh (GitHub CLI) がインストールされていれば自動で PR を作成できます。無ければ Web に移動して手動で PR 作成します。epos_docs_commit.ps1` のように実行します