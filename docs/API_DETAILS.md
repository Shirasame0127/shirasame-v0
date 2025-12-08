# API 詳細仕様（エンドポイント別）

このファイルは各 API のリクエスト / レスポンス、認証、検証ルール、サンプルを網羅しています。API を追加・変更する場合はここを先に編集してください。

---

## 共通ルール
 ## 共通ルール
 クライアントは `camelCase` の JSON を送信する。サーバー実装では `mapClientToRow()` を使って `snake_case` に変換して DB に渡すこと。
 管理 API (`/api/admin/*`) の新しい認証ポリシー:
  - 管理ページ（admin-site）からの呼び出しでは `X-User-Id` ヘッダを唯一の認証情報として扱います。admin-site のプロキシがログイン中ユーザーの `user_id` を `X-User-Id` ヘッダに入れて送信することを前提とします。
  - サーバ側は `X-User-Id` が存在する場合、それを `userId` として信頼し `trusted: true` と扱います（例外: 認証フローを担う `/api/auth/*` は既存のトークンベース実装を継続します）。
  - したがって、管理 API 実装は `payload.userId` や `ctx.userId` を基準にオーナーチェックを行ってください。トークン検証を毎回行う必要はありません（運用上 admin-site のプロキシを信頼する設計）。
- 画像は `/api/images/upload` を経由して永続化する。DB に直接 data URL を保存しないこと。
 - ## Admin: POST /api/admin/recipes
 - 説明: レシピを作成する。要求：認証・owner 権限。

 実装注意:
 - 管理 API の認証は `X-User-Id` ベースです。`ctx = await resolveRequestUserContext(c)` を呼び、`ctx.userId` をオーナーチェックに利用してください。
 - `ctx.trusted` は `X-User-Id` が存在する場合に true になります。`/api/auth/*` のような認証エンドポイントは既存の処理のままです。
## POST /api/images/upload
説明: 画像アップロード。multipart/form-data または body に data URL を受け取る。

リクエスト (multipart):
- file: ファイル
- target: optional ("recipe" | "profile" | "header")
- ownerId: optional (サーバーでオーナーを解決する場合は不要)

リクエスト (json/data-url):
- dataUrl: string
- filename: optional

レスポンス (成功例):
```json
{
  "ok": true,
  "result": {
    "url": "https://images.shirasame.com/uploads/abc.jpg",
    "key": "uploads/abc.jpg",
    "bucket": "public"
  }
}
```

注意点:
- `target` が `profile` や `header` の場合、API は `users` テーブルの該当フィールドを更新することがある（owner check を行う）。
- Cloudflare Images の場合 `result.variants` が返る可能性がある。クライアントは `variants[0] || result.url` を使用する。

---

## GET /api/recipes
説明: 公開レシピ一覧。レスポンスは UI が既存で期待する形を保つ。

クエリパラメータ: optional (limit, offset, ownerId など)

レスポンス例:
```json
[
  {
    "id": "recipe-...",
    "userId": "...",
    "title": "...",
    "published": true,
    "images": [ { "id": "img-...", "url": "https://...", "width": 1200, "height": 800 } ],
    "imageDataUrl": "https://...", // 旧互換
    "pins": [ /* recipe pins */ ]
  }
]
```

注意点:
- `images` 配列は `recipes.images` (jsonb) をマッピングした配列として返す。
- `imageDataUrl` は旧 UI 互換のために `images[0].url` を fallback としてセットする。

---

## Admin: POST /api/admin/recipes
説明: レシピを作成する。要求：認証・owner 権限。

リクエスト例 (JSON):
```json
{
  "userId": "...",
  "title": "...",
  "body": "...",
  "images": [ { "url": "https://...", "width": 1200, "height": 800 } ],
  "pins": [ /* optional pins */ ],
  "published": false
}
```

レスポンス: 作成済みの `recipes` row を返す（snake_case 変換済みでもクライアントは camelCase を期待）。

実装注意:
- 画像は事前に `/api/images/upload` を通して永続化し、返却された URL を `images` に渡すこと。
- 受信 JSON は `mapClientToRow()` で snake_case に変換して DB に渡す。

---

## Admin: /api/admin/recipes/[id] (GET, PUT, DELETE)
- GET: レシピの詳細取得（owner check optional but recommended）
- PUT: レシピ更新。`mapClientToRow()` を使い、`images` と `pins` を適切に更新する。
- DELETE: owner チェックの上で削除。削除は慎重に（関連画像の扱いはポリシーに従う）

PUT リクエスト例:
```json
{ "title": "更新後のタイトル", "images": [...], "pins": [...], "published": true }
```

---

## POST /api/admin/recipe-images/upsert
説明: 既存 `recipe_images` テーブルがある場合に、それと互換のあるリクエストを受け、`recipes.images` JSONB を更新するユーティリティ的エンドポイント。

リクエスト例:
```json
{ "recipeId": "recipe-...", "images": [ { "url": "https://...", "width": 1200, "height": 800 } ] }
```

実装注意:
- 受け取った `images` を `recipes.images` として上書きまたはマージする。上書き/マージ動作は API の仕様で明確にする（ここではマージ推奨）。

---

## PUT /api/admin/settings
説明: ユーザーの設定（プロフィール、ヘッダー、SNS 等）を更新する API。認証必須。

リクエスト例:
```json
{ "id": "user-...", "displayName": "...", "bio": "...", "socialLinks": [ { "platform": "x", "url": "https://x.com/.." } ], "headerImageKeys": ["https://..." ] }
```

実装注意:
- `socialLinks` は空文字列の URL を保存しないこと（前処理でトリムし空は除外）。
- もし Amazon 認証情報等のシークレットを別 API に送る場合は、`PUT /api/admin/settings` から切り離して別エンドポイントで安全に保存する。

---

## エラーとレスポンスコードの基本ルール
- 200/201: 成功
- 400: クライアント側のリクエスト不正（バリデーションエラー）
- 401: 認証エラー
- 403: 権限エラー（オーナーチェック失敗）
- 404: リソースが存在しない
- 500: サーバー内部エラー（ログを残すこと）

---

このドキュメントは実装に合わせて更新してください。API を変更する際は、変更点をここに追記し、既存のエンドポイントを壊さない（または互換レイヤを提供する）ことを必須とします。