# Workers /products 実装メモ (2025-12-02)

本書は Hono + Cloudflare Workers で実装した `/products` の仕様です。公開ページは SSG のまま、商品等は CSR Fetch の構成を前提にしています。画像変換は「方式 A: Cloudflare Images（リモート画像の変換のみ）」を採用します。

## エンドポイント
- `GET /products`
- `GET /profile`
- `GET /collections`
- `GET /recipes`
- `GET /tag-groups`
- `GET /tags`

### クエリパラメータ（Zod validation）
- `id` | `slug` | `tag`
- `published=true|false`
- `shallow=true|false`（または `list=true|false`）
- `limit`（数値）| `offset`（数値）| `count=true`（正確な総数要求）

### 動作
- Public 判定: `sb-access-token` Cookie 無 or Host が `PUBLIC_HOST`/`NEXT_PUBLIC_PUBLIC_HOST` → Public
- Public かつ `id/slug` 未指定（一覧）の場合のみ、`PUBLIC_PROFILE_EMAIL` で解決した `ownerUserId` で `user_id` を絞り込み
- `shallow`（もしくは `list`）時は軽量 shape を返す
- ページネーション: `limit`+`offset`（shallow 未指定でも可）。`count=true` で exact count
- キャッシュ: Public + shallow + `count` 未指定のレスポンスを Cache API に 10s 保存（`Cache-Control: public, max-age=10`）

### レスポンス
- 成功: `{ data: [...], meta?: { total, limit, offset } }`
- 失敗: `{ error: { code, message } }` + 適切なステータス

### 画像URLの方針（方式 A）
- 一覧（shallow）: Cloudflare Images Transform の URL を返す
  - `IMAGES_TRANSFORM_BASE` に `https://<public-domain>/cdn-cgi/image/` を設定
  - Worker 側で `width={LIST_IMAGE_WIDTH:400},quality=85,format=auto/<absolute-source-url>` を組み立て
- 詳細（full）: 原本の公開 URL を返す（`R2_PUBLIC_URL` でキー→絶対URL）。必要に応じてクライアントで Transform を適用可能

## 環境変数
- 必須（Secret）
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- 任意（Vars）
  - `PUBLIC_PROFILE_EMAIL`（オーナー解決に使用）
  - `PUBLIC_HOST` or `NEXT_PUBLIC_PUBLIC_HOST`
  - `R2_PUBLIC_URL`（例: `https://images.shirasame.com/<bucket>` または R2 の公開サブドメイン）
  - `IMAGES_TRANSFORM_BASE`（例: `https://public.example.com/cdn-cgi/image/`）
  - `LIST_IMAGE_WIDTH`（デフォルト 400）

## デプロイ（概要）
- プロジェクト: `v0-samehome/workers/public-api`
- `wrangler secret put SUPABASE_URL` / `wrangler secret put SUPABASE_SERVICE_ROLE_KEY`
- 適宜 `wrangler.toml` の `routes` を設定して `wrangler deploy`

## 公開サイトの API ベースURL切替
- 公開ページ（CSR Fetch）のベースURLを、この Workers の公開エンドポイントに変更します。
- 例: `PUBLIC_API_BASE=https://public-api.example.com`
- クライアント側では `fetch(`${PUBLIC_API_BASE}/products?published=true&shallow=true&limit=24`)` のように参照。

## 追加: /products のキャッシュ効率
- Cache API: Public shallow を 10s キャッシュ。
- ETag/If-None-Match: レスポンスボディの SHA-256 を Weak ETag として返し、同一内容なら 304 を返すことで帯域削減。

## 実装メモ
- Supabase は `@supabase/supabase-js` の fetch ベースクライアントを使用
- オーナーIDは Cache API に 300s キャッシュ
- CORS: 応答に `Access-Control-Allow-Origin: *` を付与（Pages 同一オリジンに統一できる場合は適宜制限）
- ログ/メトリクス: 必要に応じて Workers Logs/Logpush を有効化

## 将来拡張
- `/collections`, `/recipes`, `/profile`, `/tag-groups`, `/tags` 移植時は本構成（Zod, Cache API, owner 絞り込み）を踏襲
- 画像変換はユニーク変換数が 5,000/月を超える場合に Images Paid へ切替（$0.50/1,000）