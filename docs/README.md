# ドキュメント一覧

この `docs/` フォルダには、このアプリの設計・運用・API・移行、そして将来AI（例: GitHub Copilot など）にコード生成を依頼する際に必ず参照して欲しいルールをまとめています。

ファイル一覧

- `ARCHITECTURE.md`  — アプリケーション構成、主要な技術スタック、データモデル概観
- `API.md`          — 公開 API / 管理 API の一覧とリクエスト/レスポンスの形
- `AI_GUIDELINES.md` — AI にコード生成をさせるときの必須チェックリスト、命名規則、実行手順
- `MIGRATION_GUIDE.md` — DB マイグレーションやデータ移行の安全手順

- `API_DETAILS.md`  — 各エンドポイントの詳細なリクエスト/レスポンス定義（必ず更新）
- `GIT_COMMANDS.ps1` — PowerShell 用: docs をコミットして PR を作成するスクリプト

使い方

1. まず `ARCHITECTURE.md` を読み、全体像を把握してください。
2. API を拡張するときは `API.md` を更新し、AI に生成させる場合は `AI_GUIDELINES.md` を必ず渡してください。
3. スキーマ変更は `MIGRATION_GUIDE.md` に従ってバックアップ → 検証 → 実行の順に行ってください。

ドキュメントの更新は Pull Request で行い、少なくとも 1 人のレビュアーを要求してください。

PowerShell で PR を作る簡単コマンドの例を実行するには:

```powershell
./docs/GIT_COMMANDS.ps1 -branchName "docs/add-project-docs" -commitMessage "docs: add API and migration docs"
```

`gh` CLI がインストールされていると自動で PR が作成されます。インストールされていない場合は手動で PR を作成してください。