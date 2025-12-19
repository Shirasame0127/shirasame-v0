# 公開ページ用 API（Public API）実装計画書

## 目的

- 公開ページ（閲覧者向け）専用の **読み取り専用 API** を用意する
- 認証は一切不要
- 管理画面で使用している取得系クエリを **完コピ**
- ただし `user_id` は常に  
  `public-worker` の環境変数 `PUBLIC_OWNER_USER_ID` を使用する
- 書き込み系・管理系 API は **一切含めない**

---

## 基本方針

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

### 一覧取得

- **API**
  - `GET /api/public/products`
- **取得内容**
  - 管理画面の `GET /api/admin/products` と同じ取得ロジック
  - ただし:
    - `published = true`
    - `user_id = PUBLIC_OWNER_USER_ID`
- **レスポンス例**
```json
{
  "products": [
    {
      "id": "...",
      "title": "...",
      "price": 1000,
      "tags": [],
      "images": [
        {
          "key": "...",
          "url": "...",
          "responsive": { ... }
        }
      ]
    }
  ]
}
````

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

### 一覧取得

* **API**

  * `GET /api/public/recipes`
* **内容**

  * 管理画面の `GET /api/admin/recipes`
  * `published = true`
  * `user_id = PUBLIC_OWNER_USER_ID`

---

### レシピ詳細

* **API**

  * `GET /api/public/recipes/:id`
* **内容**

  * title / body
  * images
  * pins（商品タグ情報）
* **画像処理**

  * `responsiveImageForUsage('recipe')` を必ず通す

---

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

* 使用ファイル:

  * `shared/lib/image-usecases.ts`
* 必須使用関数:

  * `getPublicImageUrl`
  * `buildResizedImageUrl`
  * `responsiveImageForUsage`
* **禁止**

  * 直接 R2 / S3 URL を返すこと
  * サイズ指定なしの生 URL

---

## やらないこと（重要）

* POST / PUT / DELETE API は作らない
* 認証・Cookie・Bearer token は一切使わない
* user_id を query / param で受け取らない
* 管理画面専用フィールド（draft / internal flags）は返さない

---

## 実装順（推奨）

1. `/api/public/site-settings`
2. `/api/public/profile`
3. `/api/public/products`
4. `/api/public/collections`
5. `/api/public/recipes`
6. recipes 詳細（pins 含む）
7. キャッシュ最適化

---

## 完了条件

* 管理画面のデータと公開ページの表示が **完全一致**
* 管理画面を一切触らずに公開ページが成立
* `PUBLIC_OWNER_USER_ID` を変えるだけで別オーナー公開が可能

```

