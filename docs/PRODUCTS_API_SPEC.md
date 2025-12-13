# 商品 API 仕様書＆実装チェックレポート

このドキュメントは「商品（products テーブル）」に関する API を整理したものです。
admin サイト（`admin-site`）から呼び出せるように、public-worker 側の実装状況とエンドポイント仕様、呼び出し方、返却 JSON、テーブル列定義、サンプルデータをまとめてあります。

---

**現状（実装場所）**
- admin サイト側エンドポイント（ブラウザ→同一オリジン）: `admin-site/app/api/products/route.ts` — こちらはサーバー側で `forwardToPublicWorker` を使い、すべて public-worker 経由に転送するプロキシです（つまりブラウザは `https://admin.shirasame.com/api/products` を叩き、サーバー経由で worker に中継されます）。
- public worker 実装: `public-worker/src/index.ts` にて、以下が実装済み／追加済み（このコミットで追加）:
  - GET `/api/products` (public-facing shallow/full list; 既存ミラー挙動あり)
  - GET `/api/admin/products` (管理者用 list; worker 内で Supabase 直接フェッチ fallback を実装)
  - GET `/api/admin/products/*` (管理者用詳細 proxy/mirror to canonical `/products/:id`)
  - POST `/api/admin/products` (作成) — 新規実装済み
  - PUT `/api/admin/products/*` (更新) — 新規実装済み
  - DELETE `/api/admin/products/*` (削除) — 新規実装済み

※ 補足: admin クライアント（`admin-site`）は `lib/db/storage.ts` と `lib/services/products.service.ts` の `apiFetch('/api/admin/products')` 等を通じて上記エンドポイントを利用します。フロントは `X-User-Id` ヘッダを付与する（ローカル mirror から）実装です。

---

**目的：管理画面で必要な API（5種）**
1. 商品一覧を取得する API（user_id ごと）
2. 1つの商品を取得する API（編集画面用）
3. 商品を更新する API（編集後の上書き）
4. 商品を削除する API
5. user_id に対応する商品の「件数」だけ取得する API(ダッシュボード用)

以下で各 API の実装有無、エンドポイント、呼び出し方法、パラメータ、返却 JSON をまとめます。

---

## 1) 商品一覧を取得する API（user_id ごと）
- 実装場所：`public-worker/src/index.ts` — `app.get('/api/admin/products', ...)`（admin 用）および `app.get('/api/products', ...)`（public-facing，mirror）
- 呼び出し例（admin クライアント）: `GET /api/admin/products`（ブラウザは `/api/products` を叩きサーバーが転送するパターンもある）
- 推奨呼び出し（一覧、管理画面用）:
  - URL: `GET https://admin.shirasame.com/api/admin/products` （admin-site の server-side proxy 経由でも可）
  - ヘッダ: HttpOnly セッションベースで auth（`sb-access-token` cookie）を使う。クライアント側 `X-User-Id` が付与される場合もあるが、worker は `resolveRequestUserContext` により cookie/bearer を優先して検証する。
  - クエリパラメータ（すべて任意）:
    - `limit` (number) — ページサイズ
    - `offset` (number) — オフセット
    - `count=true` — 総件数（exact count）を要求（遅延コストあり）
    - `shallow=true` または `list=true` — Shallow レスポンス（軽量）
    - `published=true` — 公開フラグで絞る（public / public-facing 呼び出しで有効）
  - 権限: 認証済みかつ worker での trust 判定済み（`resolveRequestUserContext` の `trusted` が true）で実行可能。admin が他ユーザーの一覧を見たい場合は body/query には `user_id` を付ける（権限判定あり）。

- 返却（成功）:
  - JSON: { data: [ ...products ], meta?: { total, limit, offset } }
  - Shallow レスポンス item 例:
    {
      "id": "...",
      "user_id": "...",
      "title": "...",
      "slug": "...",
      "short_description": "...",
      "tags": ["tag1"],
      "price": 1234,
      "published": true,
      "created_at": "...",
      "updated_at": "...",
      "images": [ { id,... } ]
    }

---

## 2) 1つの商品を取得する API（編集画面用）
- 実装場所：public-worker は `/api/admin/products/*` を `/products/:id` にリライトして上流（worker 自身か origin）へフェッチする仕組みを持っています。admin クライアントは `products.service.getById(id)` を通して `GET /api/products?id=...` などを利用します。
- 呼び出し例:
  - URL (query style): `GET /api/products?id=<id>`
  - URL (path style): `GET /api/admin/products/<id>`
  - 必要ヘッダ: セッション cookie（`sb-access-token`）または `Authorization: Bearer <token>`。admin 側では `X-User-Id` を同時送信することがある。
- 返却:
  - JSON: { data: <product> } または { data: [ <product> ] } （admin 側の実装は wrapper を返すため `data` を期待）
  - Full レスポンスには `short_description`, `body`, `show_price`, `notes`, `related_links`, `images[]`, `affiliateLinks[]` などが含まれます（`shallow` を指定しない場合）。

---

## 3) 商品を更新する API（編集後の上書き）
- 実装場所：`public-worker/src/index.ts` にて `app.put('/api/admin/products/*', ...)` を追加（このリポジトリ変更で実装済み）
- 呼び出し（admin クライアント経由）:
  - URL: `PUT https://admin.shirasame.com/api/admin/products/<id>`
  - ヘッダ: `Content-Type: application/json`。セッション cookie を利用（HttpOnly）。
  - ボディ（JSON）: 部分更新が可能。更新可能なフィールドの例:
    - `title`, `slug`, `short_description`, `body`, `tags` (配列), `price`, `published` (boolean), `related_links` (配列), `notes`, `show_price` (boolean)
- 権限:
  - 呼び出しユーザーが対象 `product.user_id` と同一であるか、`isAdmin(user)` で管理者判定が真であれば更新可。そうでなければ 403 を返却。
- 返却:
  - 成功: { ok: true, data: <updated_product> }
  - 失敗: エラー JSON（`makeErrorResponse` 形式）

---

## 2.1) 商品を作成する API（新規登録）
- 実装場所：`public-worker/src/index.ts` — `POST /api/admin/products`（管理者用）
- 目的：管理画面の「新規登録」画面から呼び出される API。管理者/所有者の認証が必要。
- 呼び出し（admin クライアント経由）:
  - URL: `POST https://admin.shirasame.com/api/admin/products`
  - ヘッダ: `Content-Type: application/json`。セッション cookie を利用（HttpOnly）。
  - ボディ（JSON）: 新規商品オブジェクト（例を下に示す）。

- 推奨フィールド（フロント側の `new` 画面が送る想定）:
  - `id` (optional): 任意。指定がない場合は worker 側で `prod-<timestamp>` を生成する。
  - `userId` (optional): 所有者ユーザー ID。指定がない場合はリクエスト発行者のユーザー ID が使われる。
  - `title` (required)
  - `slug` (optional)
  - `shortDescription` または `short_description` (optional)
  - `body` (optional)
  - `tags` (optional): 配列。未指定時は `[]` が設定される。
  - `price` (optional)
  - `published` (optional): boolean。未指定時は `false` が既定。
  - `relatedLinks` または `related_links` (optional): 配列。未指定時は `[]` が設定される。
  - `notes` (optional)
  - `showPrice` または `show_price` (optional): boolean
  - `images` (optional): 画像配列（管理画面では通常 ImageUpload により事前にアップロード済みのキー/URL を渡すことを想定）。
  - `affiliateLinks` (optional)
  - `createdAt` / `created_at`, `updatedAt` / `updated_at` (optional): ワーカーが未指定時に現在時刻で埋める。

- 注意点（画像・添付について）:
  - 管理画面の `ImageUpload` コンポーネントは選択時にワーカーの画像アップロード API を呼び出し、`mainImageUrl`（公開 URL またはキー）を返します。新規作成時は `images` 配列ではなく、アップロード時に `productId` を渡して `product_images` テーブルに紐付けるか、事前にアップロード済みの `mainImageUrl` を本 API に含めてください。
  - ワーカーは `POST /api/admin/products` で product レコードのみを作成し、画像の永続化は別エンドポイント（画像アップロード / assign=product）で行う設計です。フロントは画像を先にアップロードしてからこの作成 API を呼ぶことを推奨します。

- 返却:
  - 成功: `{ ok: true, data: <created_product> }`（作成された product オブジェクト）
  - 失敗: エラー JSON（`makeErrorResponse` 形式）


## 3.1) 公開ステータス切替 API（一覧でのトグル用）
- 実装場所：`public-worker/src/index.ts` — 新規追加 `PUT /api/admin/products/<id>/published`（管理者用）
- 目的：商品一覧のトグルスイッチから即時に `published` フラグを切り替える。管理画面で即時反映・監査が必要なため専用の軽量エンドポイントを用意。
- 呼び出し（admin クライアント経由）:
  - URL: `PUT https://admin.shirasame.com/api/admin/products/<id>/published`
  - ヘッダ: `Content-Type: application/json`。セッション cookie を利用（HttpOnly）。
  - ボディ（JSON）: `{ "published": true|false }` — 指定した値に更新する。ボディ必須。
- 権限: 呼び出しユーザーが対象 `product.user_id` と同一であるか、`isAdmin(user)` で管理者判定が真であれば実行可。そうでなければ 403 を返却。
- 実装ノート: 実行時に対象商品の存在確認を行い、`updated_at` を現在時刻に更新する。成功時は更新済みオブジェクトを返却。
- 返却:
  - 成功: `{ ok: true, data: <updated_product> }`
  - 失敗: エラー JSON（`makeErrorResponse` 形式）


## 4) 商品を削除する API
- 実装場所：`public-worker/src/index.ts` にて `app.delete('/api/admin/products/*', ...)` を追加（このリポジトリ変更で実装済み）
- 呼び出し:
  - URL: `DELETE https://admin.shirasame.com/api/admin/products/<id>`
  - ヘッダ: セッション cookie
- 権限:
  - 更新と同様、所有者または admin のみ実行可能。違う場合は 403 を返却。
- 返却:
  - 成功: { ok: true }
  - 失敗: エラー JSON

---

## 5) user_id に対応する商品の「件数」だけ取得する API (ダッシュボード用)
- 実装状況: `GET /api/admin/products?count=true&limit=<n>&offset=<o>` を利用すると、worker 側で Supabase の `select(..., { count: 'exact' })` を使用し `meta.total` を返却します。つまりダッシュボードは `limit=1&count=true` 等で総数取得が可能ですが、既存コードは admin-side でローカルキャッシュ長を参照するため、実際は `db.products.refresh(userId)` → `db.products.getAll(userId).length` を使うケースが多いです。
- 呼び出し例:
  - `GET /api/admin/products?count=true&limit=1` → レスポンス: `{ data: [ ... ], meta: { total: 123, limit: 1, offset: 0 } }`

注意: `count=true` は Supabase の exact count を要求するためコストが高く、必要箇所だけ使うようにしてください。

---

## products テーブル仕様（スキーマ抜粋）
以下は提供されたテーブル情報を整理したものです。

- カラム一覧

  - `id` : text (NOT NULL)
  - `user_id` : text (NULL可)
  - `title` : text
  - `slug` : text
  - `short_description` : text
  - `body` : text
  - `tags` : ARRAY (JSONB / text[] 形式で格納される想定)
  - `price` : numeric
  - `published` : boolean (default: false)
  - `created_at` : timestamp with time zone
  - `updated_at` : timestamp with time zone
  - `related_links` : ARRAY
  - `notes` : text
  - `show_price` : boolean

※ worker のクエリは上記のカラム名（snake_case）を期待しており、フロントは受け取り後に camelCase に正規化して使うことが多いです（`user_id` → `userId` 等）。

---

## データ例
提供されたサンプルをそのまま掲載します。

```json
[
  {
    "idx": 0,
    "id": "c9d7b363-0836-4486-98bc-95fb3d8de59b",
    "user_id": "7b9743e9-fb19-4fb7-9512-c6c24e1d5ef4",
    "title": "TOPPING Professional CL101",
    "slug": "topping-professional-cl101",
    "short_description": "",
    "body": "",
    "tags": ["Amazon"],
    "price": null,
    "published": true,
    "created_at": "2025-11-30 10:26:43.196+00",
    "updated_at": "2025-11-30 12:42:14.165+00",
    "related_links": [
      "https://vt.tiktok.com/ZSfVBPTxx/",
      "https://www.youtube.com/watch?v=F-iOF6BdCIY"
    ],
    "notes": null,
    "show_price": false
  }
]
```

---

## 実装チェックリスト（今回の変更により）
- [x] admin-site は `app/api/products/route.ts` で public-worker に転送している（proxy 実装あり）。
- [x] public-worker: admin 用 GET `/api/admin/products` は存在し、今回のパッチで `limit/offset/count/shallow` をサポートしました。
- [x] public-worker: admin 用詳細 GET `/api/admin/products/*` はリライト/プロキシ経路が存在します。
- [x] public-worker: admin 用 POST `/api/admin/products` を追加しました（作成）。
- [x] public-worker: admin 用 PUT `/api/admin/products/*` を追加しました（更新）。
- [x] public-worker: admin 用 DELETE `/api/admin/products/*` を追加しました（削除）。

注意: すべての書き込み操作は `getSupabase(env)` を通して Supabase にアクセスします。`getSupabase` は環境変数に `SUPABASE_SERVICE_ROLE_KEY` があればそれを優先する実装になっています（したがってワーカーはサーバー側の書き込みにサービスロールキーを使えます）。

---

## フロント側（admin-site）からの呼び出し方法まとめ
- 一覧取得: `ProductsService.getAll()` → 内部で `apiFetch('/api/products')` を呼ぶ。
- 単一取得（編集画面）: `ProductsService.getById(id)` → `GET /api/products?id=<id>`
- 作成: `ProductsService.create(productData)` → `POST /api/admin/products`（JSON ボディ）
- 更新: `ProductsService.update(id, productData)` → `PUT /api/admin/products/<id>`（JSON 部分更新）
- 削除: `ProductsService.delete(id)` → `DELETE /api/admin/products/<id>`

admin 側の `db.storage` もローカル mirror キャッシュ (`db.products`) を使っており、create/update/delete はまずローカルキャッシュを更新してから `/api/admin/products` 系に fire-and-forget で送信します。

---

## 推奨・注意点
- `count=true` は高コストなのでダッシュボードで頻繁に叩くのは避け、可能ならローカル mirror（`db.products.refresh(userId)` と `db.products.getAll(userId).length`）を使ってキャッシュ済み件数を表示する運用を推奨します。
- 画像や大きなフィールド (body, images) を含む full レスポンスは一覧には不要なため、`shallow=true` を活用してください。
- 監査: 書き込み系エンドポイントは `resolveRequestUserContext` を必ず通す実装になっているため、HttpOnly cookie ベースの認証（ブラウザ）を正しく設定してください。

---

次アクションの候補:
- 自動テスト（`public-worker/test_crud.ps1`）の再実行
- 詳細な API 呼び出しサンプル（curl / PowerShell）を追加
- `count` を返す軽量専用エンドポイントを追加（ダッシュボード最適化）
