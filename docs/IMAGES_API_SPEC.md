# 画像関連 API 仕様書＆実装チェックレポート

このドキュメントは、リポジトリ内に存在する「画像アップロード／保存／削除／差し替え」に関する API を整理したものです。
管理画面（`admin-site`）とパブリック向け Worker（`public-worker`）の双方にまたがる実装と、運用上の注意点、呼び出しサンプル、レビューコメントを含みます。

---

## 目的
- 管理画面から画像を安全にアップロード・保存し、DB には「キーのみ」を保存する（URL は保存しない）運用を明確化する。
- Cloudflare Images / R2 を利用したアップロード・配信フローを整理する。
- 現在のエンドポイント一覧と使用法、環境変数、セキュリティ上の注意点をまとめ、改善提案を提示する。

---

## 目次
- 概要（実装場所）
- 管理サイト（`admin-site`）側 API
- public-worker 側 API
- フロー（アップロード → 完了 → 表示）
- 環境変数チェックリスト
- セキュリティ／運用レビュー（所見と推奨）
- 付録：curl / PowerShell 呼び出し例

---

## 概要（実装場所）
- 管理側の App Routes（Next.js App Router）： `admin-site/app/api/images/*` — ブラウザは同一オリジンの `/api/...` を叩き、サーバーで必要に応じて `public-worker` へプロキシします。
- 公開 API / 永続化ロジック： `public-worker/src/index.ts` — 画像メタデータの永続化（key-only）、R2 からの配信、署名付き URL 発行の中核を担います。

---

## 管理サイト（`admin-site`）側 API（概要）

以下は `admin-site/app/api/images` 配下の App Routes です（実装ファイル参照）。

- `POST /api/images/upload` (file multipart proxy)
  - ファイルを受け取り、サーバー側で Cloudflare Images の upload API (`accounts/{id}/images/v1`) に proxy します。
  - 実装: `admin-site/app/api/images/upload/route.ts`
  - 認可: サーバー側環境変数で Cloudflare トークンが必須。
  - 用途: ブラウザが直接 Cloudflare Images へではなく、サーバー経由でアップロードしたい場合のフォールバック。

- `POST /api/images/direct-upload`
  - Cloudflare Images の `direct_upload` 用署名を作成して返します（`images/v2/direct_upload` を呼ぶ）。
  - 実装: `admin-site/app/api/images/direct-upload/route.ts`
  - 認可: サーバー側で Cloudflare API トークンが必要。

- `POST /api/images/complete` (推奨)
  - クライアントが upload 後に呼び出す public-worker 側の永続化エンドポイント（key-only を DB に upsert）。管理クライアントが同一オリジンで呼ぶ場合は admin 側プロキシを経由することもあるが、public-worker への直接 POST を推奨します。
  - 実装: `public-worker/src/index.ts` の `/api/images/complete`
  - 認可: リクエストはトークン／Cookie で検証され、`resolveRequestUserContext` により `effectiveUserId` を決定する。管理プロキシ経由では HttpOnly cookie により admin 側で検証した `X-User-Id` を付与して転送する設計。

- `*/api/admin/recipe-images/upsert`（管理用途の proxy）
  - 全て `forwardToPublicWorker` 経由で public-worker に転送するシンプルな proxy。
  - 実装: `admin-site/app/api/admin/recipe-images/upsert/route.ts`

注意: 管理側は原則ブラウザから同一オリジンの `/api/*` を呼ぶことで HttpOnly cookie が送信され、サーバー側プロキシ経由で public-worker に転送される設計です。

---

## public-worker 側 API（画像関連）

主要なエンドポイント（実装：`public-worker/src/index.ts`）:

- `POST /api/images/upload` — canonical upload handler
  - 役割: 管理 UI/クライアントからのアップロードを受け付ける（内部で Cloudflare Images や R2 への保存ロジックへ接続する）。

- `POST /api/images/direct-upload` — Cloudflare Images の presigner
  - 役割: 認証済みユーザーに direct_upload 情報を返す。
  - 認可: `resolveRequestUserContext` による token/cookie 検証が必要。

- `POST /api/images/complete` — persisted key-only 永続化ハンドラ
  - 役割: クライアントがアップロードを完了した後に呼ぶ。受け取る JSON は少なくとも `key` を含む必要がある。Supabase REST（サービスロールキー）を使って `images` テーブルに upsert を試みる。
  - 実装の要点:
    - `key` 必須。`filename`, `metadata`（`target`, `aspect`, `extra` 等）を許容。
    - `resolveRequestUserContext` により token を検証して `effectiveUserId` を算出（`X-User-Id` ヘッダが付与されているとそれを優先して使うフローもある）。
    - `SUPABASE_SERVICE_ROLE_KEY` が存在しない場合は DB 永続化をスキップして成功を返す（ログ出力あり）。
    - upsert はまず `POST /rest/v1/images?on_conflict=key` を試み、失敗時は RPC や GET/POST リトライループにフォールバックする。
  - 成功レスポンス: `{ "key": "..." }`（200）

- `DELETE /api/images/:key` — 画像削除
  - 役割: R2 バケットから key を削除（best-effort）し、可能なら DB の行も削除する。
  - 認可: `resolveRequestUserContext` により認証済み（trusted + userId）であることを要求。

- `GET /images/*` and `GET /:YYYY/:MM/:DD/*` — R2 配信フォールバック
  - 役割: R2 バケットからオブジェクトを直接返す。複数の候補 key を試す（バケット接頭辞や `images/` など）。

その他:
- Worker は `/api/auth/whoami`, `/api/auth/session`, `/api/auth/refresh` 等を実装し、admin 用の cookie セットや token refresh を提供します。これらは画像フロー（cookie が送られること）と密接に関連します。

---

## 画像差し替えフロー（エンドツーエンド）

1. クライアントで画像を選択 → 軽いバリデーション（サイズ・型）
2. 署名付きアップロードを利用する場合:
   - 管理 UI が `POST /api/images/direct-upload` を呼び、Cloudflare direct_upload 情報を受け取る。
   - ブラウザは Cloudflare の direct_upload URL にファイルを PUT する（或いは `/api/images/upload` に multipart を POST してサーバー経由で Cloudflare に転送）。
3. アップロード成功後、クライアントは `POST /api/images/complete`（public-worker へ直接、または admin-proxy 経由）を呼ぶ:
  - Body には少なくとも `{ "key": "r2/or/cf/key", "filename": "...", "target": "profile" }` を送る。
  - ブラウザは HttpOnly の `sb-access-token` cookie を保持しているため、同一オリジンの admin-proxy 経由で呼ぶ場合は cookie が送信され、proxy が `X-User-Id` を付与して public-worker に転送する。
4. `admin-site` の互換 App Route (`/api/images/save`) は互換で残るが非推奨（推奨: `/api/images/complete`）:
  - 注: クライアントは可能な限り直接 `POST /api/images/complete`（public-worker）を呼び出すことを推奨します。互換の `/api/images/save` は admin 側の proxy として一時的に残されていますが、将来的に削除予定です。
  - リクエスト body をサニタイズ（`url` フィールドを拒否）し、`sb-access-token` を REST 経由で検証して userId を解決（`getUserIdFromCookieHeader` で `/auth/v1/user` を呼ぶ）。
  - 有効ユーザーが得られれば `X-User-Id` を付与して `public-worker` の `/api/images/complete` に proxy する。
5. `public-worker` の `/api/images/complete` は:
   - `key` を検査し、`resolveRequestUserContext` でトークンを検証した上で DB に upsert（service role key 必須）。
   - プロファイル割当 (`assign=users.profile` や `target=profile`) の場合は owner チェックを行い、必要なら `users` テーブルに `profile_image_key` を PATCH する。
6. 成功したら `{ "key": "..." }` を返す。クライアントは UI を更新し、画像表示は Cloudflare Image Resizing の URL を生成して配信する。

---

## 環境変数チェックリスト（本番必須）
- `SUPABASE_URL` — Supabase プロジェクト URL
- `SUPABASE_ANON_KEY` — Supabase anon key（`/auth/v1/user` の REST 呼び出しで使用）
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase サービスロールキー（public-worker 側で DB 書き込みをする場合に必須。Admin サイトには与えない）
- `PUBLIC_WORKER_API_BASE` または `API_BASE_ORIGIN` — admin-site の proxy が public-worker に転送する先
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare Images 用
- `CLOUDFLARE_IMAGES_API_TOKEN` — Cloudflare Images API トークン（admin-site または public-worker が direct_upload を発行するために必要）
- `R2_BUCKET`, `IMAGES` binding など — public-worker 側でオブジェクト操作を行うために必要
- `PUBLIC_ALLOWED_ORIGINS` — public-worker の CORS 設定に admin ドメインを含める

---

## セキュリティ／運用レビュー（所見と推奨）

- 所見 1: **キーのみ保存（URLを保存しない）** は良い方針。将来 CDN 変更があっても DB に URL が残らず安全。

- 所見 2: **`SUPABASE_SERVICE_ROLE_KEY` の取り扱い**
  - 現状: `public-worker` が永続化を担当し、`SUPABASE_SERVICE_ROLE_KEY` を使って REST で書き込みを行う実装。`admin-site` は匿名キーで `/auth/v1/user` を実行するだけ。
  - 推奨: サービスロールキーは厳格に Worker の環境に限定し、admin-side (Next.js) に露出しないでください。Edge 環境でキーを使う際は key がバンドルされないことを確認すること。

- 所見 3: **App Route runtime の互換性**
  - 以前 Node.js 実行を期待する App Route がデプロイ環境で 404 を返していた事象がありました。`runtime = 'edge'` に切り替え、`/auth/v1/user` による REST 検証を導入したため Cloudflare Pages などでも動作する可能性が高まったが、デプロイ先の Next.js/Edge サポート設定を確認してください。

- 所見 4: **Cookie / SameSite / Domain**
  - `public-worker` が `Set-Cookie` を `Domain=.shirasame.com` で設定する設計になっている点は良い。ブラウザが admin ドメインからの API 呼び出しで HttpOnly cookie を送るため `SameSite=None; Secure` が正しく付与されていることを確認してください。

- 所見 5: **ログ出力**
  - public-worker は `console.warn` 等で一部エラーをログしている。デバッグ時は `X-User-Id` と persisted `key` の出力を制御して追加すると調査が容易になります（ただしログにトークンや個人情報を出力しないこと）。

- 所見 6: **AVIF / Cloudflare Image Resizing の 415 問題**
  - 既知の問題として、Cloudflare Image Resizing が AVIF 元画像を拒否するケースがあった（raw R2 GET は 200）。これは Cloudflare の Resizing の設定や Accept ヘッダ/Content-Type の扱いに依存するため、別途再現ログを収集し調査が必要です。

- 推奨アクション
  1. 本番デプロイ前に環境変数チェックリストを確認・適用する。
  2. `public-worker` に安全なデバッグログ（`X-User-Id` と `key`）を追加するオプションパッチを作る（フィルタリング付き）。
  3. `images` テーブルに unique 制約（`key`）を確実に作成し、atomic upsert パスを活用する。ドキュメントにマイグレーション SQL を明記する。
  4. Cloudflare で AVIF を扱う際の Content-Type / Accept ヘッダを確認し、問題再現時に public-worker の raw GET と Resizing のリクエストヘッダを比較して差分を特定する。

---

## 付録：呼び出し例（PowerShell / curl）

- Admin-side: direct-upload presign を取得（PowerShell/curl）

```powershell
curl -v -X POST "https://admin.shirasame.com/api/images/direct-upload" -H "Content-Type: application/json" -H "Cookie: sb-access-token=<your_token>" -d '{}'
```

- Admin-side: upload 完了を通知（save -> proxy -> public-worker /images/complete）

```powershell
curl -v -X POST "https://public-worker.example.com/api/images/complete" -H "Content-Type: application/json" -H "Cookie: sb-access-token=<your_token>" -d '{"key":"images/2025/12/14/abc.jpg","filename":"abc.jpg","target":"profile"}'
```

- Public-worker の直接テスト UI（Worker が公開されている場合）で `/api/images/complete` を呼ぶときは、認証トークンを付与して実行してください。

---

## 変更履歴
- 2025-12-14: ドキュメント作成。`admin-site` と `public-worker` の現行実装を走査してまとめました。
- 2025-12-14: 商品・レシピの下書き（draft）保存を管理 UI に追加。下書き保存は画像必須ではなく、公開時に画像を必須とするバリデーションを行います。

---

## レビュー（短評）

- 状態: 実装は概ね一貫しており、管理サイトは同一オリジンで cookie を送る設計、永続化は public-worker に一本化されている点は好ましい。
- リスク: `SUPABASE_SERVICE_ROLE_KEY` の露出、Edge/Node ランタイム互換、Cloudflare Resizing の一部メディアタイプによるエラーが主な懸念点。
- 推奨: 本番デプロイ直前に環境変数の一覧を検証し、`public-worker` に最小限の追加ログを入れてデプロイ後の検証を行ってください。AVIF 415 問題は優先度中〜高で再現ログを集めるべきです。

---

必要なら、このドキュメントに含める具体的な cURL レシピ（署名付きアップロード、レスポンス例など）を追加で展開します。また public-worker に安全なデバッグログを追加するパッチも作成できます。どちらを優先しますか？
