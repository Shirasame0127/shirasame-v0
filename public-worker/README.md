# public-worker — 開発・デプロイ手順 (初心者向け)

このドキュメントは今回の public Worker（Hono + Supabase anon を使った公開 API ゲートウェイ）を初めて扱う方向けの簡潔な手順書です。

目的
- 公開ページ用の軽量 API を Cloudflare Workers (Hono) で提供する
- 入力検証（zod）、短期キャッシュ + ETag、CORS を行い、Supabase の公開読み取り（anon）を使う

前提
- Node.js と npm / pnpm がローカルに入っている
- Wrangler（Cloudflare Workers CLI）を使う予定で、`wrangler` がインストール済みであると便利
  - インストール: `npm install -g wrangler` など
- Supabase にプロジェクトがあり、読み取り用の `SUPABASE_URL` と `SUPABASE_ANON_KEY` がある
- リポジトリ内に `public-worker/` が存在する（今回のコードはそこにあります）

環境変数（Worker の実行に必要）
- `SUPABASE_URL` — Supabase プロジェクトの URL
- `SUPABASE_ANON_KEY` — Supabase の anon キー（読み取り専用を想定）
- `PUBLIC_OWNER_USER_ID` — （任意）表示対象のオーナー id を固定している場合に利用
- `PUBLIC_PROFILE_EMAIL` — （任意）プロフィール取得用のメールアドレス
- `PUBLIC_ALLOWED_ORIGINS` — カンマ区切りで許可するオリジン（例: `https://example.com,https://www.example.com`）
- `R2_PUBLIC_URL` / `NEXT_PUBLIC_R2_PUBLIC_URL` — 画像公開ルート（R2 の公開 URL）
- `R2_BUCKET` — R2 バケット名（パス変換に使う）
- `INTERNAL_API_BASE` — （オプション）まだ Next API をプロキシするための内部 API ベース URL

ローカル起動（開発）
1. ルートを `public-worker` に移動し、依存をインストール:

```powershell
Push-Location "c:\Users\celes\Documents\shirasameProject\public-worker"
pnpm install
Pop-Location
```

2. 環境変数を一時的にセットして `wrangler dev` を実行（PowerShell の例）:

```powershell
$env:SUPABASE_URL = "https://your-project.supabase.co"
$env:SUPABASE_ANON_KEY = "your-anon-key"
$env:PUBLIC_ALLOWED_ORIGINS = "http://localhost:3000"
# 任意
$env:PUBLIC_OWNER_USER_ID = "your-owner-id"
$env:R2_PUBLIC_URL = "https://r2.example.com"

# 開発起動
wrangler dev src/index.ts --local
```

Wrangler は `wrangler.toml` を参照します。環境変数は `wrangler secret`/`wrangler kv:key` を用いてプロダクションへ登録するか、Cloudflare ダッシュボードの環境変数として登録します。

テストと確認
- 起動後、ローカルの Workers URL（`http://127.0.0.1:8787` など）に対して curl で確認します。

例: `/products` の簡単な GET

```powershell
curl "http://127.0.0.1:8787/products?shallow=true&limit=24"
```

- レスポンスに `ETag` や `Cache-Control` ヘッダが含まれているか確認してください。
- ブラウザから呼び出す場合、`PUBLIC_ALLOWED_ORIGINS` にフロントの origin を追加してください。

働作原理（短い説明）
- Worker は zod でクエリのバリデーションを行い、Supabase anon クライアントで DB から公開用データを取得します。
- 取得結果は `cacheJson` ヘルパーを通し、Cache API を使って短期キャッシュと ETag 生成を行います。
- 画像は R2 上に事前生成された `thumb-400.jpg/webp` / `detail-800.jpg/webp` を `basePath` で参照します。

デバッグのヒント
- 404/500 が出る時: Supabase の URL / anon key が正しいか、SQL のエラー有無を確認する。
- CORS エラー: `PUBLIC_ALLOWED_ORIGINS` を見直す。
- ETag が 304 を返すが内容が古い: Worker のキャッシュキー（クエリ含めた key）が整合しているか確認。

デプロイ（簡易）
1. Wrangler にログイン: `wrangler login`
2. 環境変数を `wrangler secret put SUPABASE_ANON_KEY` などで登録
3. `wrangler publish` を実行

補足
- 本 Worker は公開読み取り専用を前提としています。書き込み系の操作（管理）は admin サイト側で service role を使って行ってください。
- セキュリティ上、`SUPABASE_SERVICE_ROLE` のようなキーは Worker に置かないでください（公開される恐れがあるため）。

---

必要なら、あなたの環境（Supabase URL、試したいクエリ、R2 の公開 URL）を教えてください。私の方で curl コマンドや wrangler の起動スニペットをあなたの値に合わせて用意します。