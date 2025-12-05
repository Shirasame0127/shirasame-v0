**AI にコード生成を依頼する際の必読ガイド**

このファイルは、将来 AI（例: GitHub Copilot, ChatGPT, 他の自動生成エージェント）にコードを作らせる際に、必ず最初に読ませるべきルールと手順をまとめたものです。

目次
- 1) 事前に与えるべきコンテキスト
- 2) 命名規則とスネークケース変換
- 3) 画像アップロードのワークフロー
- 4) API 設計ルール
- 5) セキュリティ（環境変数・権限制御）
- 6) コード編集ルール（apply_patch を使う場合の注意）

---

**1) 与えるべきコンテキスト（必須）**
- 変更対象のファイルパスを明示する（例: `app/api/recipes/route.ts`）
- 関連する既存の関数・ユーティリティ（例: `lib/image-url.ts`, `lib/db/storage.ts`, `mapClientToRow()`）
- データベースの重要なテーブルとカラム（`recipes.images` は `jsonb`、`recipes.pins` は `jsonb` 等）
- 環境変数（`NEXT_PUBLIC_R2_PUBLIC_URL`、`SUPABASE_SERVICE_ROLE_KEY`）の存在

これらはAIに必ず渡す。AIが差分だけを出す場合、フルパス付きで変更箇所を指定し、不要なファイル編集はしないように指示する。

**2) 命名規則とスネークケース変換**
- クライアント（フロントエンド JS/TS）は `camelCase` を使う。
- DB（Postgres）は `snake_case` を使う。
- サーバー側の API は受け取った JSON を `mapClientToRow()` で変換してから Supabase に渡すこと。
- 例: クライアント `displayName` -> DB カラム `display_name`。

**3) 画像アップロードのワークフロー（必ず守る）**
1. クライアントは画像ファイルまたは data URL を `/api/images/upload` に POST する。
2. サーバーはまず Cloudflare R2 に保存を試み、成功したら公開 URL を返す（`result.url`）；Cloudflare Images の場合は `result.variants` を返す場合あり。
3. クライアントは返却された `url` / `variants[0]` を UI に適用し、その URL を DB の `recipes.images` などへ保存する（必要なら管理 API を通す）。
4. サーバー側は公開 URL を `getPublicImageUrl()` の規約に沿って正規化する。

**4) API 設計ルール**
- 管理 API とパブリック API を分離する（パスで明示）。
- 管理 API はオーナーチェックを行い、ユーザーID を直接上書きしない。
- レスポンスは後方互換を保つ（既存フィールドを削除しない）。

**5) セキュリティ**
- 秘密鍵やサービスロールキーは絶対にクライアントに露出しない。
- 直接 DB にアクセスするサーバー側コードは `supabaseAdmin`（サービスロール）を使い、API で適切な権限チェックを行う。

**6) コード編集ルール（apply_patch を使う開発フローを想定）**
- 小さな変更は 1 ファイルにつき 1 patch にまとめる。
- 既存のスタイルを崩さない。余計なフォーマット変更を行わない。
- テストがある場合は関連するテストを編集し、ローカルで `pnpm run build` + `pnpm test` を推奨する。

---

AI に渡すテンプレート（例）
- "このリポジトリの `app/admin/settings/page.tsx` を読み、SNS 保存ロジックで空 URL を保存しないように修正してほしい。既存の `socialLinks` 配列をトリムし、空要素を除外してください。変更は minimal で、UI や他の挙動を壊さないように。"

必ず AI に次を守らせる
- `mapClientToRow()` のような既存ユーティリティを無視しない
- DB 型の違い（uuid/text）に注意するよう警告する
- 重大な DB 構成変更は必ず人の承認を要求する（`I cannot run migrations without explicit approval` のような断り文）

以上を AI に渡すことで、無駄な修正や危険な破壊的変更を防げます。