# 管理ページ用 API 一覧（実運用の参照実装）

以下は管理画面（`admin-site`）がデータ取得／操作に使用している主要な API の一覧です。
`admin-site` の API ルートはリクエストを `public-worker` 側へ転送しています（実装参照: `public-worker/src/index.ts`）。
画像配信／サイズ変換の最終実装は `shared/lib/image-usecases.ts` を参照してください。

---

## 使い方フォーマット
- **用途**: 機能の説明
- **API 名**: `HTTP_METHOD /path`（管理画面で呼ばれるパス）
- **中身**: リクエストで渡す主なパラメータ、想定されるレスポンスの要点

---

- **用途**: 管理画面の全商品一覧取得
  - **API 名**: `GET /api/admin/products`
  - **中身**: 管理者用の商品配列を返す（配列そのもの、または `{ data: [...] }` / `{ products: [...] }` のいずれか）。商品オブジェクトは `id, title, price, tags, images, createdAt` 等を含む。

- **用途**: 単一商品取得 / 更新 / 削除 / 作成
  - **API 名**:
    - `GET /api/admin/products/:id` — 単一商品取得
    - `PUT /api/admin/products/:id` — 更新（JSON ボディ）
    - `DELETE /api/admin/products/:id` — 削除
    - `POST /api/admin/products` — 作成（JSON ボディ）
  - **中身**: 商品のフィールド（title, shortDescription, price, tags, images: ImageMeta[] など）。管理画面はこれらを用いて編集 UI を構築。

- **用途**: 商品の公開状態切替
  - **API 名**: `PUT /api/admin/products/:id/published`
  - **中身**: `{ published: boolean }` を PUT で送り、公開フラグを切替。

- **用途**: 商品順序の保存（並び替え）
  - **API 名**: `POST /api/admin/products/reorder`
  - **中身**: `{ order: [{ id, order }, ...] }` のような配列を受け取り順序を永続化。

- **用途**: タグ / タググループ取得・管理
  - **API 名**:
    - `GET /api/tags` — 全タグ一覧
    - `GET /api/tag-groups` — タググループ一覧
    - `POST /api/admin/tags` — 管理者によるタグ作成（使用箇所あり）
  - **中身**: タグ名やグループ名を含むオブジェクト配列。

- **用途**: コレクション管理（一覧・作成・更新・削除・並び替え）
  - **API 名**:
    - `GET /api/admin/collections` — コレクション一覧
    - `POST /api/admin/collections` — 作成
    - `PUT /api/admin/collections/:id` — 更新
    - `DELETE /api/admin/collections/:id` — 削除
    - `POST /api/admin/collections/reorder` — コレクション順序保存
    - `GET /api/admin/collections/:id/inspect` — コレクションの中身検査（管理 UI で使用）
    - `POST /api/admin/collections/:id/sync` — 外部同期（存在する箇所あり）
  - **中身**: 各コレクションの `id, title, items` 等。`/items` エンドポイントで個別アイテムを扱う。

- **用途**: コレクション内アイテム操作（追加・削除・並び替え）
  - **API 名**:
    - `GET /api/admin/collections/:id/items` — コレクション内アイテム一覧
    - `POST /api/admin/collection-items` — アイテム追加（JSON ボディ）
    - `DELETE /api/admin/collection-items` または `DELETE /api/admin/collections/:colId/items/:itemId` 相当（呼び出し箇所により）
    - `POST /api/admin/collection-items/reorder` — アイテム順序保存
  - **中身**: `collectionId`, `productId` や `order` 等。

- **用途**: レシピ（recipes）管理
  - **API 名**:
    - `GET /api/admin/recipes` — レシピ一覧
    - `POST /api/admin/recipes` — 作成
    - `GET/PUT/DELETE /api/admin/recipes/:id` — 個別取得・更新・削除
  - **中身**: レシピオブジェクト（title, body, images など）。

- **用途**: 画像アップロード / 直接アップロード署名 / 完了処理
  - **API 名**:
    - `POST /api/images/direct-upload` — 直接アップロード用の署名（S3/R2 等への事前署名を返す実装箇所あり）
    - `POST /api/images/upload` — 管理画面の multipart POST を受ける（worker 経由で一時保存キーを返す）
    - `POST /api/images/complete` — アップロード完了の通知／DB への格納（target 指定で profile 等へ割当て）
  - **中身**: multipart/form-data（`upload`）、`complete` は `{ key, target }` のような JSON。戻り値は `key`（ストレージ上のキー）や URL。

- **用途**: 認証 / 現在のユーザ情報取得
  - **API 名**: `GET /api/auth/whoami`
  - **中身**: ブラウザの HttpOnly Cookie（`sb-access-token`）で認証し、現在ユーザ情報を返す。テストでは Bearer トークンも使用可能。

- **用途**: 管理者用ユーザ情報取得
  - **API 名**: `GET /api/admin/users/:id` — 個別ユーザ情報取得（profile_image_key など含む）

 - **用途**: サイト設定取得 / 管理
  - **API 名**:
    - `GET /api/site-settings` — 公開側・クライアント向けのサイト設定取得（キャッシュ可能、読み取り専用）
    - `GET /api/admin/settings` — 管理画面用により詳細なサイト設定を取得（認証が必要）
    - `PUT /api/admin/settings` — 管理画面からサイト設定を更新（JSON ボディ）
  - **中身**: サイト名、ロゴ URL / key、メール送信設定、外部連携フラグ、公開用フラグ、その他運用に必要な設定項目。
    - `GET /api/site-settings` は軽量な公開設定を返し、管理画面の初期表示で参照されることがある。
    - `GET /api/admin/settings` は認証された管理者に対して編集可能な全設定を返す。
    - `PUT /api/admin/settings` は更新用の JSON（例: `{ siteTitle, logoKey, features: { enableX: true }, ... }`）を受け取り、保存して新しい設定を返す。

- **用途**: API ドキュメント / OpenAPI
  - **API 名**: `GET /api/openapi.json`, `GET /api/docs`
  - **中身**: Swagger UI 用の JSON と HTML（管理画面から参照可能）。

---

## 備考
- `admin-site` の API エンドポイントは多くの場合 `forwardToPublicWorker` 経由で `public-worker` の実装にプロキシされます（実装: `admin-site/app/api/**` 内の route ファイル）。実際の処理は `public-worker/src/index.ts` に集約されています。
- 画像配信（URL 正規化・サイズ変換・CDN 経路）は `shared/lib/image-usecases.ts` が最終の実装です（`getPublicImageUrl`, `buildResizedImageUrl`, `responsiveImageForUsage` を参照）。
- 詳細なリクエスト/レスポンスのスキーマは OpenAPI（`/api/openapi.json`）が最も正確な一次情報です。管理画面から `https://<your-admin-host>/api/docs` を開くと Swagger UI が表示されます。

---

ファイルを保存しました。必要なら各 API のレスポンス例（JSON スニペット）や OpenAPI からの自動抽出も作成しますか？
