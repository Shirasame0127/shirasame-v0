# レシピ API 仕様書＆実装チェックレポート

このドキュメントは `public-worker` 側に実装されている「レシピ（recipes / recipe_pins 等）」関連の API を整理したものです。管理画面（`admin-site`）からの呼び出しを想定し、現在の実装状況、エンドポイント仕様、呼び出し方、返却 JSON、テーブル列定義、実装上の注意点、および今後の推奨対応をまとめます。

---

**現状（実装場所）**
- 管理 UI は same-origin の `/api/*` を叩き、管理サーバが `public-worker` にプロキシ（forward）します。
- `public-worker` の実装ファイル: `public-worker/src/index.ts`（このファイルに以下のエンドポイントが実装されています）

---

**対象機能（今回カバーする主要 API）**
1. ログインユーザーのレシピ件数と公開数取得
2. レシピ一覧表示用 API（公開用・管理用）
3. 下書き作成（新規作成・まずは画像キーとタイトルを保存するフロー）
4. 編集画面用のレシピ詳細取得 API
5. 編集画面からの全体保存（ピン情報を含むフルセーブ）
6. レシピ削除 API
7. レシピ名編集 API（PUT により対応）
8. レシピ公開状態切替 API（PUT により対応）
9. レシピの並び替え API（現状スキーマが無いため未実装）
10. recipe_pins の一覧取得（管理用）

---

**実装済エンドポイント（public-worker）**

- GET `/api/recipes`
  - 目的: レシピ一覧取得（公開・管理用にパラメータで切替可能）。
  - 認証: オプション。`user_id` クエリやリクエストトークンでスコープを決定。
  - 主なクエリパラメータ:
    - `limit`, `offset` — ページング
    - `count=true` — 総数を取得（内部で range/count を使用）
    - `shallow=true` / `list=true` — 軽量レスポンス
    - `user_id=<id>` — 明示的にユーザーを指定
  - 返却例（成功）: `{ data: [ ...recipes ], total: N }`
  - 備考: RLS 環境では incoming token を Supabase クライアントにセットしてユーザー権限で取得する実装が含まれます。DB クエリエラー時は現在は空配列を返す処理が一時的に存在する可能性があります（運用方針に要注意）。

- POST `/api/admin/recipes`
  - 目的: 管理者（またはログインユーザー）による新規レシピ作成（下書き作成に利用）。
  - 認証: 必須（`resolveRequestUserContext` による検証）。
  - ボディ例: `{ "title": "...", "recipe_image_keys": ["r2-key-..."], "tags": [...], "draft": true }`
  - 動作:
    - `recipes` テーブルに行を挿入（画像は URL ではなくキーで統一して管理します）
    - リクエストに `recipe_image_keys` が含まれる場合は、そのキー配列が `recipes.recipe_image_keys`（jsonb）として保存されます。必要に応じてワーカー側で `recipe_images` テーブルへ key-only のメタデータを upsert する実装がありますが、公開 URL はクライアント側で `getPublicImageUrl(key)` を用いて生成してください。
  - 返却: `{ ok: true, data: <created_recipe> }`

-- GET `/api/admin/recipes/:id`
  - 目的: 編集画面用のレシピ詳細取得（`recipe_image_keys` と `recipe_pins` の内容を併せて返す）
  - 認証: 必須（管理者または所有者）
  - 返却例: `{ data: { id, userId, title, slug, body, pins, pinsNormalized, recipe_image_keys, createdAt, updatedAt, published, items } }`
  - 備考: `recipe_image_keys` は R2 や Cloudflare Images のキーを格納する配列です。クライアントは `getPublicImageUrl(key)` を利用して公開 URL を生成し、プレビュー表示やレスポンスの表示を行ってください。
  - 備考: `pinsNormalized` は `recipe_pins` テーブルから取得した正規化された配列。

- PUT `/api/admin/recipes/:id`
  - 目的: 編集画面でのフル保存。タイトル、本文、公開フラグ、tags、items、`recipe_image_keys`（画像キー配列）などを更新。
  - 認証: 必須（所有者または管理者）。所有者チェックを行う。
  - ボディ（任意フィールドで部分更新）例:
    - `{ "title":"...", "published":true, "tags":[...], "recipe_image_keys":["r2-key-..."], "items": [...], "pins": [...] }`
  - 動作:
    - `recipes` テーブルを `update` で更新
    - `pins` が配列で渡された場合、当該ユーザー分の `recipe_pins` を一旦削除し（`recipe_id` + `user_id`）、挿入で置換する（注意: 複数ユーザーの pins 共有を考慮するなら設計見直しを推奨）
  - 返却: `{ ok: true, data: <updated_recipe> }`

- DELETE `/api/admin/recipes/*`
  - 目的: レシピ削除（`recipe_pins` も削除を試みる）
  - 認証: 必須（所有者または管理者）。
  - 動作: `recipe_pins` の削除 → `recipes` の削除
  - 返却: `{ ok: true }`

- GET `/api/recipes/counts`
  - 目的: ダッシュボード用にログインユーザーの総件数と公開件数を返す
  - 認証: 必須（トークンで userId を resolve）
  - 返却: `{ data: { total: <number>, published: <number> } }`

- GET `/api/recipe-pins`
  - 目的: 当該ユーザーの `recipe_pins` 一覧取得（管理用）
  - 返却: `{ data: [ ...pins ] }`

-- POST `/api/admin/recipe-images/upsert`
  - 目的: 画像メタデータの upsert（key-only を想定）
  - 要求: `{ key, width?, height?, aspect?, role?, caption?, cf_id? }`
  - 動作: `recipe_images` に key-only のメタデータを upsert します。注: アプリケーション上の正規化された画像一覧は `recipes.recipe_image_keys` が canonical であり、各レシピの画像配列はそちらを参照してください。公開 URL はクライアント側で `getPublicImageUrl(key)` を利用して生成します。

- POST `/api/admin/recipes/reorder`
  - 目的: レシピ並び替え
  - 実装状況: 未実装（現状は 501 を返す）。スキーマに `sort_index` 等のカラムが必要。

---

**テーブルスキーマ（参照）**

- `recipes`（想定カラム）
  - id: text, NOT NULL
  - user_id: text, NULL
  - title: text, NULL
  - base_image_id: text, NULL
  - image_width: integer, NULL
  - image_height: integer, NULL
  - aspect_ratio: text, NULL
  - pins: jsonb, NULL
  - published: boolean, NULL, default false
  - created_at: timestamp with time zone, NULL
  - updated_at: timestamp with time zone, NULL
  - body: text, NULL
  - slug: text, NULL
  - images: jsonb, NULL, default []
  - items: jsonb, NULL, default []
  - recipe_image_keys: jsonb, NOT NULL, default []


- `recipe_pins`（想定カラム）
  - id: text, NOT NULL
  - recipe_id: text, NULL
  - product_id: text, NULL
  - user_id: text, NULL
  - tag_display_text: text, NULL
  - dot_x_percent: numeric, NULL, default 0
  - dot_y_percent: numeric, NULL, default 0
  - tag_x_percent: numeric, NULL, default 0
  - tag_y_percent: numeric, NULL, default 0
  - dot_size_percent: numeric, NULL, default 0
  - tag_font_size_percent: numeric, NULL, default 0
  - line_width_percent: numeric, NULL, default 0
  - tag_padding_x_percent: numeric, NULL, default 0
  - tag_padding_y_percent: numeric, NULL, default 0
  - tag_border_radius_percent: numeric, NULL, default 0
  - tag_border_width_percent: numeric, NULL, default 0
  - dot_color: text, NULL
  - dot_shape: text, NULL
  - tag_text: text, NULL
  - tag_font_family: text, NULL
  - tag_font_weight: text, NULL
  - tag_text_color: text, NULL
  - tag_text_shadow: text, NULL
  - tag_background_color: text, NULL
  - tag_background_opacity: numeric, NULL, default 1
  - tag_border_color: text, NULL
  - tag_shadow: text, NULL
  - line_type: text, NULL

---

**認証／RLS 注意事項**
- Supabase の RLS を利用する場合、ワーカーはリクエスト由来のトークンを Supabase クライアントへセットしてクエリを行う（`supabase.auth.setAuth(token)` またはクライアント生成時に token を与える）必要があります。
- `getSupabase(env)` の実装がリクエストごとに新しいクライアントを返すなら `setAuth` は比較的安全ですが、共有クライアントに `setAuth` を使うとグローバル状態が変わり競合する可能性があるため注意が必要です。

---

**エラーハンドリング方針（運用推奨）**
- 本番運用では致命的なサーバーエラーは HTTP 5xx（例: 500）で返し、ボディは必ず JSON（例: `{ ok:false, message: '...', detail: '...' }`）とすることを推奨します。これは監視・アラートや API クライアント側での分岐に重要です。
- UI の可用性を優先する短期対応としては、空配列を返して UI を崩さない方法もありますが、必ず structured log や監視にエラーを送るようにしてください（現在は console.warn/console.error が使われています）。

---

**並び替え（reorder）実装案**
1. DB マイグレーション: `ALTER TABLE recipes ADD COLUMN sort_index integer DEFAULT 0;`（ユーザー単位で必要なら `user_id` と組み合わせる）
2. UI から新しい `sort_index` を受け取り、一括更新を行う API（`POST /api/admin/recipes/reorder`）を追加。可能ならトランザクションまたは一括更新 SQL を用いる。

---

**テスト・デプロイ手順（簡易）**
1. 変更をローカルでコミット
2. `public-worker` をビルド・デプロイ

```powershell
cd C:\Users\tensho\Documents\dev\shirasame-v0\public-worker
npx -y wrangler publish
npx -y wrangler tail --cwd public-worker
```

3. 管理画面で E2E を実行: ログイン → 新規レシピ作成（画像アップロード）→ 下書きを確認 → 編集画面で編集 → 保存 → 一覧取得
4. ログに 5xx や DB エラーが無いかを確認

---

**今後の推奨作業（優先順）**
- `getSupabase` の実装を確認し、リクエストごとにクライアントを作る/トークン注入の安全性を担保する
- 並び替え用カラムのマイグレーションと `POST /api/admin/recipes/reorder` の実装
- 500 エラー時にも JSON を返す統一的エラーハンドリングの徹底（`makeErrorResponse` の利用は既にありますが、領域毎に正しい status を返すこと）
- Sentry 等へのエラー送信（structured logging）を導入
- E2E テストの追加（管理 UI 連携）

---

このドキュメントを基に、さらに詳細な API 仕様（リクエスト/レスポンスのスキーマや OpenAPI 化）を行うことができます。必要であれば OpenAPI 仕様ファイルを作成します。