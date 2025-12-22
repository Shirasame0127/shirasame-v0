# 公開ページ用 API（Public API）実装計画書

## 基本方針

- 実装場所: `public-worker`（現在の実装もここ）
- 認証: **なし**（公開読み取り専用）
- `user_id` は常に環境変数 `PUBLIC_OWNER_USER_ID` を使用し、リクエストから受け取らない
- 管理ページ用 API との差分は「公開用パス」および公開向けのフィールド正規化のみ
- GET API はキャッシュが可能（`Cache-Control` を付与）

- 実装場所: `public-worker`
- 認証: **なし**
- user_id の扱い:
  - リクエストからは一切受け取らない
  - 内部で常に `env.PUBLIC_OWNER_USER_ID` を使用
- 管理ページ用 API との差分:
  - パスのみ変更（`/api/public/**`）
  - SQL / Supabase クエリは **管理画面と同一**
- キャッシュ:
  - GET API は原則 `Cache-Control: public, max-age=...` を付与可能

---

## 共通実装ルール

- 取得対象はすべて `published = true` のみ
- 並び順は管理画面で保存されている order を尊重
- 画像 URL は必ず以下を使用:
  - `getPublicImageUrl`
  - `buildResizedImageUrl`
  - `responsiveImageForUsage`
- 生の storage key を返さない

---

## API 構成一覧

---

## 商品（Products）

### 現在の実装（要点）

- 一覧: `GET /api/public/owner-products?limit=<n>&offset=<m>` （`public-worker` 側で owner フィルタ適用）
- 詳細: `GET /api/public/owner-products/:slug`（スラグで単一オブジェクトを返す。存在しない場合は `{ data: null }`）
- 画像形状（公開 API）:
  - `main_image`: `{ src, srcSet } | null`
  - `attachment_images`: `[{ src, srcSet }]`
  - 旧来の `*_image_key` やクライアントでの R2 ベース URL 組み立ては公開レスポンスで露出しない

### 方針

- レスポンスは Worker 側で `shared/lib/image-usecases.ts` の `responsiveImageForUsage` を使って生成される CDN 変換済み URL（images.shirasame.com + `/cdn-cgi/image/...`）を返す
- フロント側で key→URL を組み立てる処理は禁止（Worker が唯一の変換元）

---

### 単体取得

* **API**

  * `GET /api/public/products/:id`
* **条件**

  * `published = true`
  * `user_id = PUBLIC_OWNER_USER_ID`

---

## コレクション（Collections）

### 一覧取得

* **API**

  * `GET /api/public/collections`
* **内容**

  * 管理画面の `GET /api/admin/collections`
  * 並び順を保持
  * `published = true` のみ

---

### コレクション詳細（中身込み）

* **API**

  * `GET /api/public/collections/:id`
* **内容**

  * コレクション情報
  * 紐づく商品一覧（order 順）
  * 各商品は product API と同一構造

---


## レシピ（Recipes）

### 現在の実装（要点）

- API: `GET /api/public/recipes`（一覧）、`GET /api/public/recipes/:id_or_slug`（個別ワイルドカード経由の取得）
- 取得は常に `published = true` かつ `user_id = PUBLIC_OWNER_USER_ID`
- `recipe_images` テーブルを `recipe_id` で結合して取得し、各行を Worker 側で正規化して返す
- `recipe_pins` は `recipe_id` で結合し、そのまま `pins` 配列として返す

### 返却する画像の形

- `images: { src, srcSet, role, width, height, aspect, caption }[]` を返す
  - 画像 URL は Worker が `responsiveImageForUsage(...,'recipe')` を経由して生成した `src` / `srcSet`（images.shirasame.com + `/cdn-cgi/image/...`）
  - 公開レスポンスでは `recipe_image_keys` は参照しない（使用禁止）

### 動作ポイント

- クライアントは `images[].src` をそのまま `<img src={...} srcSet={...}>` に渡すのみで良い
- クライアント側で URL を組み立てる処理（`buildR2VariantFromBasePath` 等）は禁止

## Recipe に紐づく商品タグ情報

* pins / items は **加工せず構造そのまま返す**
* 表示側で座標・装飾を制御
* public API 側では **検証・正規化のみ**

---

## プロフィール情報

### 公開プロフィール取得

* **API**

  * `GET /api/public/profile`
* **内容**

  * 管理画面の user/profile 情報から

    * name
    * bio
    * SNS links
    * profile_image_key
* **画像**

  * `getPublicImageUrl(profile_image_key)`

---

## ヘッダー画像 / サイト設定

### 公開用サイト設定取得

* **API**

  * `GET /api/public/site-settings`
* **参照元**

  * `GET /api/site-settings`
* **含めるもの**

  * siteTitle
  * headerImageKey
  * theme / accent color
* **画像**

  * `buildResizedImageUrl(headerImageKey, usage='header')`

---

## 画像ユーティリティ（実運用）

- 使用ファイル: `shared/lib/image-usecases.ts`（現在の実装で使用）
- 必須使用関数:
  - `getPublicImageUrl`
  - `buildResizedImageUrl`（内部で使用）
  - `responsiveImageForUsage`（公開 API の canonical 変換）
- 禁止:
  - クライアント側での生キーからの URL 組み立て
  - 生の R2 / S3 URL をそのまま返すこと

---

## やらないこと（重要）

* POST / PUT / DELETE API は作らない
* 認証・Cookie・Bearer token は一切使わない
* user_id を query / param で受け取らない
* 管理画面専用フィールド（draft / internal flags）は返さない

---

## 実装場所 / 主要変更ファイル

- `public-worker/src/services/public/recipes.ts` — `recipe_images` / `recipe_pins` の結合、`responsiveImageForUsage` を通した `images[]` 生成（既に適用済み）
- `public-worker/src/services/public/products.ts` — `fetchPublicOwnerProducts` / `fetchPublicOwnerProductBySlug` を実装し、`main_image` / `attachment_images` を `responsiveImageForUsage` で生成
- `public-worker/src/routes/public/index.ts` — `/api/public/recipes`、`/api/public/owner-products`、`/api/public/owner-products/:slug` を登録
- `public-site/app/page.tsx` と `public-site/components/recipe-display.tsx` — フロントで API 提供の `images[].src` / `srcSet` を直接使用するように変更済み（クライアントでの URL 組み立てロジックを削除）

## 検証 / デプロイ手順（短め）

1. Worker をデプロイ（`wrangler publish` 等、環境に合わせる）
2. レシピ一覧を確認:
```powershell
Invoke-WebRequest -Uri "https://<public-worker-host>/api/public/recipes?limit=24&offset=0" -Headers @{ Origin = "http://localhost:3000" } | ConvertFrom-Json
```
3. レスポンスで `data[].images[].src` が `images.shirasame.com/.../cdn-cgi/image/...` 形式であることを確認

## 完了条件（改訂）

- 管理画面と公開ページの画像表示が一致する（images.shirasame.com + `cdn-cgi/image` を経由）
- 公開 API は生のストレージキーを返さず、すべて Worker 側で CDN 変換済み URL を返す
- フロントでは `images[].src` / `srcSet` をそのまま使い、URL を組み立てない

---

## 完了条件

* 管理画面のデータと公開ページの表示が **完全一致**
* 管理画面を一切触らずに公開ページが成立
* `PUBLIC_OWNER_USER_ID` を変えるだけで別オーナー公開が可能

```

