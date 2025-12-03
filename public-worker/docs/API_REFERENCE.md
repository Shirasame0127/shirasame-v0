# Public Worker API リファレンス（現在稼働中）

このドキュメントは、Cloudflare Workers 上で稼働中の公開 API 一覧と用途、クエリ、レスポンス形、キャッシュ/ETag、CORS の要点をまとめたものです。

## 共通仕様
- ベース URL: `<your-worker-domain>`（例: `https://public-worker.shirasame-official.workers.dev`）
- メソッド: すべて `GET`（読み取り専用）
- キャッシュ: `Cache-Control: public, max-age=60, stale-while-revalidate=300`
- ETag: Weak ETag 付与。`If-None-Match` により 304 応答あり
- CORS: `PUBLIC_ALLOWED_ORIGINS` で許可オリジンを制御（`,` 区切り）
- レスポンス形: 原則 `{ data: ..., meta?: ... }`

環境変数（Bindings の例）
- `PUBLIC_ALLOWED_ORIGINS`: 許可オリジン（例: `https://example.com,https://localhost:3000`）
- `INTERNAL_API_BASE`: 管理 API の内部向けベース URL（`/site-settings` で利用）
- `PUBLIC_OWNER_USER_ID`: 単一オーナーサイト向けの追加絞り込み用 User ID
- `PUBLIC_PROFILE_EMAIL`: `/profile` 取得対象のメールアドレス
- `R2_PUBLIC_URL`, `R2_BUCKET`: 画像 URL 正規化・`basePath` 抽出で参照

---

## エンドポイント一覧

### 1) `GET /products`
- 用途: 商品一覧/詳細の取得。`shallow=true` で軽量メタに（画像は先頭1枚のメタ）。
- クエリ（任意）:
  - `shallow=true|false`（既定: false）
  - `published=true|false`（一覧フィルタ）
  - `limit`, `offset`, `count=true`（ページネーションと総件数）
  - `id` | `slug` | `tag`（単一取得/タグ絞り）
- 備考:
  - `PUBLIC_OWNER_USER_ID` が設定されている場合、`id/slug` 指定なしのときに owner で絞り込み
  - 画像配列要素には `basePath` を付与（R2 の事前生成 `thumb-400/detail-800` 組立てに利用）

### 2) `GET /collections`
- 用途: 公開コレクション一覧の取得（各コレクション内に商品を含む）。
- クエリ: `limit`, `offset`, `count=true`（ページネーション）
- 備考: `collections` → `collection_items` → `products` の順で合成し、商品は shallow メタを返却

### 3) `GET /recipes`
- 用途: レシピ一覧の取得。画像とピン情報（タグ表示・座標等）を含む。
- 備考: `PUBLIC_OWNER_USER_ID` がある場合は owner で絞り込み、無い場合は `published=true` のみ返却

### 4) `GET /profile`
- 用途: プロフィール情報の取得。
- 備考: `PUBLIC_PROFILE_EMAIL` で対象ユーザを決定。ヘッダー画像/アイコン/自己紹介/ソーシャルリンク等を返却

### 5) `GET /tag-groups`
- 用途: タググループの取得（名称・順序）。
- 備考: owner 指定があれば owner 優先、エラー時はグローバルをフォールバック

### 6) `GET /tags`
- 用途: タグ一覧の取得（名称・グループ・ソート順・リンク情報）。

### 7) `GET /amazon-sale-schedules`
- 用途: Amazon のセール期間スケジュール（セール名・期間・対象コレクション）を取得。

### 8) `GET /site-settings`
- 用途: サイト設定の取得（キー/値の辞書）。
- 備考: `INTERNAL_API_BASE` が設定されていれば管理 API をプロキシ、無い場合は Supabase から `site_settings` を直接取得して辞書に整形

---

## 実装上の注意
- すべて読み取り API（GET のみ）として公開済みです。書き込みは管理アプリ/管理 API 経由で実行してください。
- `ETag` による 304 応答と Edge Cache により、フロントからの反復取得で帯域を抑制します。
- 画像 URL は R2 の公開 URL に正規化されることを前提としており、クライアント側では `basePath` があれば事前生成 variant を、無い/未生成時は公開 URL をフォールバックで使用してください。

---

## まだ未提供のもの（メモ）
- 画像サムネイルプロキシ `GET /images/thumbnail?url=...&w=...` は現時点では実装なし（フロントのフォールバック候補として記載されていたもの）。必要になれば別 Worker か既存 Worker に追加実装します。
