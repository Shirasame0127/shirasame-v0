**API ドキュメント（重要なエンドポイント）**

注意: Next.js App Router の `app/api/*/route.ts` が実際のエンドポイント定義です。ここに書かれた形はこのリポジトリの設計で期待するリクエスト／レスポンスの型・挙動を簡潔にまとめたものです。

**共通事項**
- 管理 API (`/api/admin/...`) は認証済みかつオーナーチェックを行うこと。可能なら `getOwnerUserId()` のようなユーティリティを呼んで更新／削除を制限する。
- クライアント→サーバーの JSON は `camelCase` で送るが、DB 更新時は `snake_case` に変換する関数（例: `mapClientToRow()`）を使用すること。これにより Supabase の列名キャッシュ問題を回避できる。

---

**/api/images/upload (POST)**
- 説明: 画像アップロード受け口。フォームデータ（`file`）または data URL を受け取る。
- 成功レスポンス例:
  - Cloudflare R2/S3 風の結果:
    ```json
    { "ok": true, "result": { "url": "https://images.shirasame.com/uploads/abc.jpg", "key": "uploads/abc.jpg", "bucket": "public" } }
    ```
  - Cloudflare Images の場合は `result.variants` を返すことがある。
- 注意: `target` クエリや body フィールドを使い、`profile` / `header` / `recipe` など用途に応じた副作用（例: `users` テーブルの更新）を行う。

**/api/recipes (GET)**
- 説明: 公開レシピの取得。`recipes.images`（jsonb）を `images` 配列として返し、`imageDataUrl` は旧 UI 互換用に `images[0].url` を fallback として返す。
- レスポンス概形:
  ```json
  [{ "id": "recipe-...", "userId": "...", "title": "...", "published": true, "images": [{"url":"...","width":100,"height":100}], "imageDataUrl": "...", "pins": [...] }]
  ```

**/api/admin/recipes (POST/PUT/PATCH/DELETE)**
- 説明: 管理者（オーナー）用の CRUD。PUT/DELETE は `/api/admin/recipes/[id]` の動的ルートでも受ける。
- 実装上の注意:
  - クライアントから受け取る `userId` などは DB に直接入れず、`mapClientToRow()` を使いスネークケース化してから Supabase に渡す。
  - 更新時に `recipes.images` を更新する場合、画像は先に `/api/images/upload` 経由で永続化してから DB に登録すること。

**/api/admin/recipe-images/upsert (POST)**
- 説明: 旧 `recipe_images` テーブルの upsert ロジックを使っていた場合は、現在 `recipes.images` の JSONB に統合するパターンがある。API は `recipeId` と `images` 配列を受け取り、`recipes` テーブルを更新する。

---

**ベストプラクティス**
- API のレスポンスは可能な限り後方互換を保持する。例: 新しく `images` を返す場合でも `imageDataUrl` を残す。
- ファイルアップロードは 1) クライアントで DataURL を生成 → 2) `/api/images/upload` に送信 → 3) 返却 URL を DB に保存、の手順を守る。
- 管理 API は ID の一致・オーナーチェックを必ず行うこと。

---

詳細なエンドポイントごとの仕様（リクエスト/レスポンス例、許容パラメータ、認証要件、バリデーションルール）は `docs/API_DETAILS.md` にまとめています。API を追加または変更する場合は、必ず `docs/API_DETAILS.md` を先に更新し、実装とドキュメントの整合性を保ってください。