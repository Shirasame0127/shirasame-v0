# SUPABASE_SERVICE_ROLE_KEY を Cloudflare Worker (または Pages Functions) に移行する手順

このファイルは短期運用（middleware で /api を public-worker にプロキシ）のために、Pages に置かれている `SUPABASE_SERVICE_ROLE_KEY` を Cloudflare 側の安全なシークレットに移し、Pages の環境変数から削除する手順をまとめたものです。

重要: 実作業は Cloudflare ダッシュボードか `wrangler` CLI を使って行ってください。ここで示すコマンドは PowerShell 向けサンプルです。

---

## 概要
- 目的: `SUPABASE_SERVICE_ROLE_KEY` を Pages の環境（Production 環境変数）に残さない。代わりに Worker（public-worker）側でシークレットとして管理する。
- 効果: サービスロールキーが Pages の公開ビルド環境に残らず、API（Worker）が安全に Supabase 管理操作を行える。

## 手順（CLI: wrangler を使う）

1) wrangler を用意する（未インストールの場合）

```powershell
npm install -g wrangler
wrangler login
```

2) Worker（public-worker）にシークレットを登録する

- **Classic Workers（wrangler.toml を使う Worker）**

```powershell
# コマンドを実行すると標準入力で値を貼り付けられます。
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

- **Pages Functions（Pages プロジェクトに紐づく Functions）を使っている場合**

```powershell
# --project-name と --branch はあなたの Pages プロジェクト名/ブランチに置き換えてください。
wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name "<PROJECT_NAME>" --branch "production"
```

注: `wrangler pages secret put` が利用できない環境では、Cloudflare Dashboard → Pages → Project → Settings → Environment variables & secrets から追加できます。

3) (任意) Worker に他の必要な env も登録（SUPABASE_URL など）

```powershell
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
```

## 手順（GUI）

1. Cloudflare Dashboard にログイン
2. Workers / Pages の対象プロジェクトを選択
3. Worker: 「Settings」→「Variables」または「Secrets」から `SUPABASE_SERVICE_ROLE_KEY` を登録
4. Pages（もし Pages 側に同キーがある場合）: Pages → Project → Settings → Environment variables & secrets で該当キーを削除する

## Pages 側の環境変数から削除（必須）
- Cloudflare Pages のプロジェクト設定で `SUPABASE_SERVICE_ROLE_KEY` を削除してください。削除しないと Pages のビルド環境にキーが残ります。

## DISABLE_AUTH の確認
- Pages の環境変数に以下が存在し、`false` に設定されていることを確認してください。
  - `DISABLE_AUTH=false`
  - `NEXT_PUBLIC_DISABLE_AUTH=false`

GUI での確認:
 - Pages → Project → Settings → Environment variables & secrets

CLI（参考）: Cloudflare API を使った確認や削除は可能ですが、間違えると運用に影響が出るため GUI を推奨します。

## デプロイと検証
1. Worker のシークレットを登録したら Worker をデプロイ（`wrangler deploy` など）。
2. Pages のプロジェクトから `SUPABASE_SERVICE_ROLE_KEY` を削除して、`DISABLE_AUTH=false` を保証。
3. 管理ページ（Pages）のビルド／デプロイを実行。
4. 動作確認:
  - ブラウザで管理ページにログインできること。
  - Network タブで `/api/...` の呼び出し先が `https://public-worker...` に到達していること（middleware/proxy を使っている場合は最終的に Worker が Supabase を呼ぶ）。
  - Worker 側にエラーが出ていないか `wrangler tail` や Cloudflare Dashboard のログで確認。

## ローテーション（推奨）
- 移行が完了したら、既存のキーをローテーション（新しい Service Role キーを Supabase で発行）し、古いキーを無効化してください。

## トラブルシュート
- Worker から Supabase に接続できない場合は、まず Worker のログ（`wrangler tail`）を確認し、環境変数が正しく設定されているか確認してください。
- Pages にキーが残っているとビルドに埋め込まれる可能性があるため、必ず Pages 側からキーを削除してから再ビルドしてください。

---

このドキュメントを使ってあなたか運用者が Cloudflare 側でシークレット登録と Pages 環境変数削除を行ってください。私の側で Cloudflare に直接操作はできないため、実行後に「完了した」と伝えていただければ、残りの確認（ビルド、デプロイ検証、ログ確認）をリモートで支援します。
