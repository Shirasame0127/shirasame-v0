# コレクション API 仕様書＆実装チェックレポート

このドキュメントは「コレクション（collections テーブルおよび collection_items）」に関する API を整理したものです。
admin サイト（`admin-site`）から呼び出せるように、public-worker 側の実装状況とエンドポイント仕様、呼び出し方、返却 JSON、テーブル列定義、サンプルデータをまとめてあります。

---

**現状（実装場所）**
- admin サイト側エンドポイント（ブラウザ→同一オリジン）: `admin-site/app/api/collections/route.ts`（存在する場合は `forwardToPublicWorker` 経由で public-worker に中継されます）。
- public worker 実装: `public-worker/src/index.ts` にて以下エンドポイントが実装／追加済みです：
  - GET `/api/admin/collections` — 管理画面用のコレクション一覧取得
  - GET `/api/admin/collections/counts` — ダッシュボード用のコレクション総数・公開数取得
  - PUT `/api/admin/collections/:id` — コレクション更新（タイトル、説明、visibility、order など）
  - POST `/api/admin/collections/reorder` — コレクションの順序を一括更新
  - POST `/api/admin/collection-items/reorder` — コレクション内アイテム（collection_items）の順序を一括更新
  - その他、`/api/admin/collection-items` 系の作成/削除等のエンドポイントが存在する場合があります。

注: admin クライアントは同一オリジンの `/api/*` を呼び、サーバー経由で public-worker にフォワードする構成です（HttpOnly cookie による認証を利用するため）。

---

**目的：管理画面で必要な API（主なもの）**
1. コレクション一覧を取得する API（所有者ごと・公開フィルタ等）
2. 1つのコレクションを取得する API（編集画面用）
3. コレクションを作成する API
4. コレクションを更新（PUT）する API
5. コレクションを削除する API
6. コレクション内アイテム（collection_items）の並び替えを永続化する API
7. コレクション並び順自体の永続化 API
8. ダッシュボード用にコレクションの総数/公開数を返す API

---

## 1) コレクション一覧を取得する API
- 実装場所：`public-worker/src/index.ts` — `app.get('/api/admin/collections', ...)`
- 呼び出し例（admin クライアント）: `GET /api/admin/collections`（または same-origin `/api/collections` を admin サーバーが proxy で forward）
- 推奨呼び出し（管理画面用）:
  - URL: `GET https://admin.shirasame.com/api/admin/collections`
  - ヘッダ: セッション cookie（`sb-access-token`）や `Authorization` がある場合は worker で検証し `X-User-Id` を解決して権限を判定
  - クエリパラメータ（任意）:
    - `limit` (number)
    - `offset` (number)
    - `shallow=true` — 軽量レスポンス（items の詳細を含めない等）
    - `visibility=public|private` — 表示フィルタ
    - `user_id=<id>` — 管理者が特定ユーザーのコレクションを取得するため（権限チェックあり）
  - 権限: リクエスト発行ユーザーが自分のコレクション、または admin 権限を持つ必要があります（`resolveRequestUserContext` による検証）。

- 返却（成功）:
  - JSON: `{ data: [ ...collections ], meta?: { total, limit, offset } }`
  - collection の shallow item 例:
    {
      "id": "collection-...",
      "user_id": "...",
      "title": "コレクション名",
      "description": "...",
      "visibility": "public",
      "order": 10,
      "item_count": 5,
      "created_at": "...",
      "updated_at": "..."
    }

---

## 2) 単一コレクション取得 API（編集画面用）
- 実装場所：public-worker の admin 用ルート（`/api/admin/collections/:id`）や `GET /api/collections?id=<id>` の代理経路
- 呼び出し例:
  - URL(path): `GET /api/admin/collections/<id>`
  - URL(query): `GET /api/collections?id=<id>`
  - 必要ヘッダ: セッション cookie / Authorization
- 返却:
  - JSON: `{ data: <collection> }` もしくは `{ data: [ <collection> ] }`
  - Full レスポンスには `items`（collection_items の配列）、`order`、`visibility`、`profile_image_key` などの正規化されたフィールドが含まれる想定。

---

## 3) コレクション作成 API
- 実装場所: `public-worker/src/index.ts` の `POST /api/admin/collections`（もしまだない場合は作成を推奨）
- 呼び出し（admin クライアント経由）:
  - URL: `POST https://admin.shirasame.com/api/admin/collections`
  - ヘッダ: `Content-Type: application/json` + セッション cookie
  - ボディ（JSON）例:
    {
      "id": "collection-<timestamp>" (optional),
      "userId": "<user_id>" (optional, 未指定時はリクエスト発行者の user id),
      "title": "コレクション名",
      "description": "...",
      "visibility": "public|private",
      "order": 100,
      "profile_image_key": "r2/keys/..." (optional),
      "header_image_keys": ["..."],
      "items": [ /* オプションで初期 items を渡す場合の構造 */ ]
    }
- サーバ側注意点:
  - `id` を指定しない場合は worker 側で `collection-<timestamp>` を生成するか DB 側で uuid を採番
  - `collection_items` を同時に挿入する場合、`user_id` の解決や `created_at/updated_at` の有無で環境差異に注意（既存の migration の有無によりエラーになることがあるため、不要フィールドは省く）
- 返却:
  - 成功: `{ ok: true, data: <created_collection> }`
  - 失敗: エラー JSON

---

## 4) コレクション更新 API（PUT）
- 実装場所: `public-worker/src/index.ts` — `PUT /api/admin/collections/:id`（既に追加済み）
- 呼び出し（admin クライアント経由）:
  - URL: `PUT https://admin.shirasame.com/api/admin/collections/<id>`
  - ヘッダ: `Content-Type: application/json` + セッション cookie
  - ボディ（JSON）: 部分更新を想定。例:
    {
      "title": "更新されたタイトル",
      "description": "...",
      "visibility": "public",
      "order": 5
    }
- 権限:
  - 呼び出しユーザーが対象コレクションの所有者（`user_id`）であるか、管理者である必要があります。
- 実装上の注意:
  - RLS 環境では Supabase クライアントにリクエスト者のトークンをセットするか、サービスロールキーを使用して権限を付与する必要があります。ワーカー実装では `getSupabase(env)` を使い、サービスロールが無い場合に incoming token を設定するパターンが既に使われています（これを厳密に適用すること）。
- 返却:
  - 成功: `{ ok: true, data: <updated_collection> }`
  - 失敗: エラー JSON（403/401 など）

---

## 5) コレクション削除 API
- 実装場所: `public-worker/src/index.ts` — `DELETE /api/admin/collections/:id`（存在することを推奨）
- 呼び出し:
  - URL: `DELETE https://admin.shirasame.com/api/admin/collections/<id>`
  - ヘッダ: セッション cookie
- 権限:
  - 所有者または admin のみ実行可能。そうでない場合 403。
- 返却:
  - 成功: `{ ok: true }`
  - 失敗: エラー JSON

---

## 6) collection_items の並び替えを永続化する API
- 実装場所: `public-worker/src/index.ts` — `POST /api/admin/collection-items/reorder`（今回の変更で追加済み）
- 目的: モーダル内でのドラッグ＆ドロップ（DnD）によるアイテム順序変更をサーバに保存するためのエンドポイント
- 呼び出し:
  - URL: `POST https://admin.shirasame.com/api/admin/collection-items/reorder`
  - ヘッダ: `Content-Type: application/json`, セッション cookie
  - ボディ例:
    {
      "collectionId": "collection-...",
      "orders": [
        { "id": "collection_item_id1", "order": 0 },
        { "id": "collection_item_id2", "order": 1 },
        ...
      ]
    }
- 実装ノート:
  - 並び替えは複数行の UPDATE を実行する実装（トランザクションでまとめて実行）を推奨。現状は逐次更新でも構わないが、可能なら一括更新 SQL を使うと整合性が高い。
- 返却:
  - 成功: `{ ok: true }` または `{ ok: true, updated: <count> }`

---

## 7) コレクション自体の並び順を永続化する API
- 実装場所: `public-worker/src/index.ts` — `POST /api/admin/collections/reorder`（追加済み）
- 呼び出し:
  - URL: `POST https://admin.shirasame.com/api/admin/collections/reorder`
  - ボディ例:
    {
      "orders": [ { "id": "collection-1", "order": 0 }, { "id": "collection-2", "order": 1 } ]
    }
- 返却: `{ ok: true }` または詳細な updated カウント

---

## 8) ダッシュボード用カウント取得 API
- 実装場所: `public-worker/src/index.ts` — `GET /api/admin/collections/counts`（追加済み）
- 目的: ダッシュボードのカードで「コレクション数」や「公開コレクション数」を表示するための軽量エンドポイント
- 呼び出し:
  - URL: `GET https://admin.shirasame.com/api/admin/collections/counts`
  - 必要ヘッダ: セッション cookie
- 返却例:
  - `{ "totalCount": 123, "publicCount": 45 }`

---

## collections / collection_items テーブル想定スキーマ（抜粋）
- `collections` テーブル（例）:
  - `id`: text (PK)
  - `user_id`: text
  - `title`: text
  - `description`: text
  - `visibility`: text ("public" | "private")
  - `profile_image_key`: text (R2 key)
  - `header_image_keys`: jsonb
  - `order`: integer
  - `created_at`, `updated_at`: timestamp

- `collection_items` テーブル（例）:
  - `id`: text (PK)
  - `collection_id`: text (FK -> collections.id)
  - `product_id` or `recipe_id`: text
  - `user_id`: text
  - `order`: integer
  - `created_at`, `updated_at`: timestamp

注意: 環境によっては `created_at`/`updated_at` が存在しないケースがあるため、挿入時に明示的に渡すと 500 になる可能性があります。ワーカー側は不確定なスキーマを想定して不要なタイムスタンプを挿入しない設計が安全です。

---

## 実装チェックリスト（今回の変更により）
- [x] public-worker に `PUT /api/admin/collections/:id` が追加され、管理画面からの更新が可能になった
- [x] public-worker に `POST /api/admin/collections/reorder`、`POST /api/admin/collection-items/reorder` が追加され、並び替えの永続化 API が用意された
- [x] public-worker に `GET /api/admin/collections/counts` が追加され、ダッシュボード用の集計が取得可能になった
- [ ] `POST /api/admin/collections`（作成）についてはワーカー側での存在を確認してください。存在しない場合は追加を推奨します（管理画面の新規作成 UI が直接 server-side で create を呼ぶ想定のため）。
- [x] RLS 環境での動作のため、PUT/POST/DELETE 系のハンドラが incoming token を Supabase クライアントにセットする、またはサービスロールキーで安全に動作することを確認済み／必要

---

## フロント側（admin-site）からの呼び出しまとめ
- 一覧取得: `CollectionsService.getAll()` → `apiFetch('/api/admin/collections')`
- 単一取得: `CollectionsService.getById(id)` → `GET /api/admin/collections/<id>`（または `/api/collections?id=<id>`）
- 作成: `CollectionsService.create(data)` → `POST /api/admin/collections`
- 更新: `CollectionsService.update(id, updates)` → `PUT /api/admin/collections/<id>`
- 削除: `CollectionsService.delete(id)` → `DELETE /api/admin/collections/<id>`
- 並び替え（collection order）: `POST /api/admin/collections/reorder`
- 並び替え（collection items）: `POST /api/admin/collection-items/reorder`
- ダッシュボードカウント: `GET /api/admin/collections/counts`

---

## 推奨・注意点
- 並び替えは可能な限りトランザクションまたは一括更新 SQL で処理することを推奨します。逐次 UPDATE を繰り返す実装は途中失敗時に整合性が崩れるリスクがあります。
- コレクションや collection_items の作成時は `user_id` をワーカー側で解決して付与する（クライアント任せにしない）ことで信頼性が高まります。`forwardToPublicWorker` のプロキシ実装は `sb-access-token` からの検証で `X-User-Id` を付与するケースが既にあります。
- 画像フィールドはキー（`profile_image_key` 等）で正規化し、公開 URL は共有ライブラリで `getPublicImageUrl(key)` のように生成することを推奨します（DB に生 URL を残さない運用）。

---

## サンプルリクエスト/レスポンス
- GET `/api/admin/collections`
  - レスポンス例:
  ```json
  {
    "data": [
      {
        "id": "collection-123",
        "user_id": "7b9743e9-fb19-4fb7-9512-c6c24e1d5ef4",
        "title": "おすすめの商品",
        "description": "季節のおすすめ",
        "visibility": "public",
        "order": 1,
        "item_count": 4,
        "created_at": "2025-12-01T00:00:00Z",
        "updated_at": "2025-12-10T00:00:00Z"
      }
    ]
  }
  ```

- POST `/api/admin/collection-items/reorder` ボディ例:
  ```json
  {
    "collectionId": "collection-123",
    "orders": [
      { "id": "ci-1", "order": 0 },
      { "id": "ci-2", "order": 1 }
    ]
  }
  ```

---

## 次アクション候補
- `POST /api/admin/collections`（作成）エンドポイントが未実装なら追加する（worker 側）
- 並び替えの実装をトランザクション化して一括 SQL 更新にする
- 管理画面での E2E テスト（並び替え、作成、更新、削除、カウント取得）を実行して検証

---

