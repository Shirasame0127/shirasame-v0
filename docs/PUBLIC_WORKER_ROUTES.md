# public-worker: ルート一覧と説明

このドキュメントは `public-worker/src/index.ts` に実装されている HTTP エンドポイントの一覧です。
各エンドポイントについて、HTTP メソッド・パス・簡易説明・認証要件・備考（ヘッダやエイリアス等）を日本語でまとめています。

注意: 実装の詳細はソースを参照してください。ここはクイックリファレンスです。

---

共通ヘッダ／認証ルール（概略）
- 認証情報ソース（優先順）: `Authorization: Bearer <token>` ヘッダ、次に `sb-access-token` Cookie
- クライアントから送られた `X-User-Id` ヘッダは便宜的に付与されるが、サーバ側で必ずトークン検証（Supabase /auth/v1/user 等）と照合される。
- 内部系呼び出しは `X-Internal-Key`（`x-internal-key`）で信頼できる呼び出しとして扱える場合がある。
- 管理系エンドポイントは `resolveRequestUserContext` を通して `trusted: true` を得る必要がある。

---

エンドポイント一覧

- GET /_debug
  - 説明: 環境やバインディングの存在確認用デバッグエンドポイント（開発用）
  - 認証: 不要
  - 備考: 本番では無効化推奨

- GET /_test
  - 説明: シンプルな API テスター用 HTML UI（開発補助）
  - 認証: 不要

- GET /products
  - 説明: 商品一覧 / 詳細（クエリにより挙動変化）
  - 主なクエリ: `id`, `slug`, `tag`, `published`, `shallow`/`list`, `limit`, `offset`, `count`
  - 認証: 認証有無で返すデータが変わる（管理用途では `trusted` が必要な場合あり）
  - 備考: Shallow list のキャッシュ / ETag を利用

- GET /profile
  - 説明: 公開ページのプロフィール取得
  - 認証: 不要（`PUBLIC_PROFILE_EMAIL` による owner 解決オプションあり）

- GET /collections
  - 説明: コレクション一覧（owner で絞り込み）
  - 認証: 管理用途は `trusted` 必須

- GET /recipes
  - 説明: レシピ一覧（画像や pins を含む）
  - 認証: 管理用途は `trusted` 必須

- GET /tag-groups
  - 説明: タググループ一覧（管理 UI 用）
  - 認証: `trusted` 必須（管理用途）
  - 備考: 一時的にデバッグログを出力する箇所あり

- GET /tags
  - 説明: タグ一覧（管理用途は `trusted` 必須）

- GET /amazon-sale-schedules
  - 説明: セールスケジュール（スタブ実装）
  - 認証: 管理用途は `trusted` 必須

- GET /site-settings
  - 説明: サイト設定を返す（内部 API が設定されていれば upstream に proxy）
  - 認証: 公開読み取りが想定。内部 API 経由の場合は upstream の認証に従う

- GET /api/admin/settings
  - 説明: 管理画面の設定取得（内部 API 未設定時は public-worker が Supabase から読み取る）
  - 認証: `trusted` または `internal-key` 必須（`resolveRequestUserContext` による判定）
  - 備考: `/admin/settings`（プレフィックスなし）も同様に受け付ける

- PUT /api/admin/settings
  - 説明: 管理画面の設定更新（Upsert via Supabase REST）
  - 認証: `trusted` または `internal-key` 必須
  - 備考: `SUPABASE_SERVICE_ROLE_KEY` 未設定時は中立応答を返す（UI が壊れないように）

- PUT /api/admin/users/:id
  - 説明: ユーザー（profile）更新（内部 proxy があれば upstream を使う）
  - 認証: 自分のプロフィール更新は token-authenticated user のみ許可（`ctx.userId === :id`）、`internal-key` は代理可能

- POST /upload-image
- POST /images/upload
- POST /api/images/upload
  - 説明: 画像アップロード（multipart/form-data） → R2 に保存（Worker 内で処理）
  - 認証: `trusted`（token か `internal-key`）が必要
  - 備考: 複数のパスを同一ハンドラで保持（互換対応）

- POST /api/images/complete
  - 説明: アップロード後に画像メタデータを DB に永続化（key-only policy）
  - 認証: `trusted`（token か `internal-key`）が必要
  - 備考: `SUPABASE_SERVICE_ROLE_KEY` が未設定の場合は情報保存をスキップして成功応答する

- POST /api/images/direct-upload
- POST /images/direct-upload
  - 説明: Cloudflare Images の direct-upload 用プリサインを取得する（admin UI 用）
  - 認証: `trusted`（token か `internal-key`）必須

- GET /images/*
  - 説明: R2 に保存されたオブジェクトを直接返すフォールバック（Worker 経由で配信）
  - 認証: 基本的に不要（公開リソース用）
  - 備考: バケット名のプレフィックス有無に対応する候補を試行

- GET /api/auth/whoami
  - 説明: 管理 UI 用の whoami（トークンまたは Cookie ベースで Supabase /auth/v1/user を呼び出し user を返す）
  - 認証: 呼び出し元は token/cookie を送る必要がある（未認証なら 401）

- POST /api/auth/session
  - 説明: admin-site がサインイン後に呼ぶ。アクセス/リフレッシュトークンを HttpOnly Cookie (`sb-access-token`, `sb-refresh-token`) としてセットする
  - 認証: 不要（セット目的）
  - 備考: Cookie は `Domain=.shirasame.com; Path=/; HttpOnly; Secure; SameSite=None` でセットされる

- POST /api/auth/refresh
  - 説明: `sb-refresh-token` Cookie を使って Supabase から新しい access token を取得し Cookie を更新する
  - 認証: `sb-refresh-token` Cookie 必須（ない場合は 401）

- POST /api/auth/logout
  - 説明: セッション Cookie をクリアする
  - 認証: 不要（Cookie をクリアするため）

---

実装上の注記 / 運用メモ（日本語コメント）
- 管理系（/api/admin/*）は token ベースの検証を行い、フロントが `X-User-Id` を付与してもサーバ側で token の `sub` と突合する設計です。
- `X-Internal-Key` を用いると内部呼び出しと見なされ、`payload.userId` や `X-User-Id` を信頼して代理操作が可能になります（運用上の秘匿管理が必要）。
- Cookie の転送は `admin-site` 側の proxy（`admin-site/lib/api-proxy.ts`）で明示的に `Cookie` ヘッダを再設定する実装になっています。プロキシが正しくデプロイされていないと Cookie が欠落し 401 の原因になります。
- 画像アップロード周りは R2 と Cloudflare Images を併用する実装で、メタデータ永続化は `SUPABASE_SERVICE_ROLE_KEY` が必要です。
- 一部の開発用ログ（トークン長のマスクログ等）がソースに残っています。診断後は削除してください。

---

参照: 実装ソース `public-worker/src/index.ts` と詳細仕様 `docs/API_DETAILS.md`, `docs/API_CURRENT_ROUTES.md`, `public-worker/README.md` を合わせて確認してください。

このファイルをコミットしてほしい場合は指示ください（自動で追加してコミットします）。
