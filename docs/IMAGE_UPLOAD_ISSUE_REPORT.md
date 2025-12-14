## 画像アップロード問題の診断と修正案

日付: 2025-12-14

概要
- 現象: 管理画面から画像をアップロードすると、アップロードは `/api/images/upload` まで成功するが、その後の `/api/images/complete`（管理クライアントが直接 public-worker の `/api/images/complete` に POST する、あるいは admin-proxy 経由で転送される部分）で失敗し、ブラウザには `404` または `{"error":"missing_user_id"}` が返されるケースが確認されています。
- 目的: 画像は R2（Supabase R2 想定）に「キーのみ」を保存し、公開時は `public-site/shared/lib/image-usecases.ts` の関数群（`getPublicImageUrl` / `buildResizedImageUrl` / `responsiveImageForUsage` 等）を使って Cloudflare Image Resizing（/cdn-cgi/image/...）で配信する。二回目以降はエッジのキャッシュで配信されることを期待する。

問い合せのための簡潔なプロンプト（運用担当者に送る用）

```
状況: 管理画面からの画像アップロードで `/api/images/complete` が 404 または public-worker から `{"error":"missing_user_id"}` を返します。

依頼:
1) `PUBLIC_WORKER_API_BASE` が本番で正しく `https://public-worker.shirasame-official.workers.dev`（または正式な public-worker ドメイン）を指しているか確認してください。
2) 管理サイトの最新デプロイ（`origin/main` のコミットが反映済み）を確認してください。
3) public-worker のログ/TRACE を確認し、admin 経由のリクエストがどのホスト・パスに到達しているか（`Host` とリクエスト先 URL）を教えてください。
4) 可能なら下記の curl を実行して結果（HTTP ステータス、ボディ、重要ヘッダ）を返してください。

```powershell
curl -v -X POST "https://admin.shirasame.com/api/images/complete" \
  -H "Content-Type: application/json" \
  --data '{"key":"images/abc.avif","user_id":"<テスト用のuser_id>"}'

# public-worker 直接テスト
curl -v -X POST "https://public-worker.shirasame-official.workers.dev/api/images/complete" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <テスト用のuser_id>" \
  --data '{"key":"images/abc.avif"}'
```

目的: 上記で admin→public-worker の経路と認証伝播（Cookie または X-User-Id）が正しく動いているかを切り分けたいです。
```

調査済み (リポジトリ側で確認したこと)
- `admin-site/app/api/images/save/route.ts`:
  - 受信ボディを JSON として解析し、`url` フィールドが含まれている場合は 400 を返す（key-only ポリシーの防衛）。
  - JSON から `key` / `cf_id` 等を抽出して sanitized なペイロードを public-worker の `/api/images/complete` に転送する実装がある。
  - Cookie（`sb-access-token`）の JWT ペイロードから `sub` を抽出して `X-User-Id` ヘッダを付与するベストエフォートの処理があるが、実稼働環境で cookie が転送されていない経路や proxy の振る舞いで userId が欠落するケースが観測された。

- `admin-site/lib/api-proxy.ts`:
  - proxy 実装で `Request.url` が相対パスのケースに失敗する可能性があったため、相対 URL を `PUBLIC_WORKER_API_BASE` に対して解決する修正を適用済み。

- `public-worker/src/index.ts`:
  - `resolveRequestUserContext` により、`X-User-Id` ヘッダ、クエリの `user_id`、Cookie/Authorization の順で userId を解決する設計。userId が無ければ `{"error":"missing_user_id"}` を返す。
  - すでに一部デバッグログ（ヘッダ出力）を出すコードが含まれているため実行ログで到達状況は確認できる。

- `admin-site/components/image-upload.tsx`:
  - 管理 UI はアップロード後に `/api/images/save` を呼ぶ。admin プロキシが 404 を返すと、クライアントはフォールバックで public-worker への直接 POST を試行する仕組みを持つよう修正済み（ただし `X-User-Id` をクライアントから入れるのはテスト用で、本番ではサーバー側でのトークン検証が必須）。

検証すべきポイント（チェックリスト）
1. admin が同一オリジン（https://admin.shirasame.com）で動いており、ブラウザが HttpOnly Cookie (`sb-access-token`) を送っているか。Network タブで `Request Headers` の `Cookie` を確認。
2. admin の `PUBLIC_WORKER_API_BASE` が正しいか（環境変数・デプロイ設定）。
3. public-worker の `/api/images/complete` が存在し、POST を受け付けているか（直接 curl テスト）。
4. admin が public-worker に `X-User-Id` をヘッダで渡しているか（proxy がヘッダを保持しているか）。
5. public-worker が受け取った画像情報で R2 にキーを保存しているか（レスポンスに `key` を返すこと）。
6. 表示側は常に `public-site/shared/lib/image-usecases.ts` の `responsiveImageForUsage` を通して URL を生成しているか。
7. 2回目以降の表示が edge キャッシュされるかを `cf-cache-status` ヘッダや `Cache-Control` で確認（`HIT` が期待される）。

コマンド例（現地での実行と確認）
- admin 経由（相互に確認）
```powershell
curl -v -X POST "https://admin.shirasame.com/api/images/save" \
  -H "Content-Type: application/json" \
  --data '{"key":"images/your-test-key.jpg"}'
```

- public-worker 直接（X-User-Id を付けて）
```powershell
curl -v -X POST "https://public-worker.shirasame-official.workers.dev/api/images/complete" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <user_id>" \
  --data '{"key":"images/your-test-key.jpg"}'
```

- 画像取得（リサイズ URL を叩いて確認）
```powershell
curl -v "https://your-images-domain/cdn-cgi/image/width=200,format=auto,quality=75/images/your-test-key.jpg" -I
```

成功の条件（期待値）
- `/api/images/save` 経由で呼ぶと public-worker により `{ "key": "images/...." }` が返ること。
- public-worker のレスポンスで `key` が返り、DB（Supabase）に key が登録されること（管理画面のレコードに key の参照が残る）。
- 表示側で `responsiveImageForUsage(key, usage)` を使って生成された `/cdn-cgi/image/.../<key>` に対して 1回目の GET は 200、2回目以降に `cf-cache-status: HIT` または CDN の `Cache-Control` ヘッダによりエッジキャッシュから配信されること。

暫定的にリポジトリへ適用済みの修正（要点）
- `admin-site/lib/api-proxy.ts`: 相対 URL を `PUBLIC_WORKER_API_BASE` に対して解決する修正を適用。
- `admin-site/app/api/images/save/route.ts`: テスト用に `user_id` を JSON で受け取った場合に `X-User-Id` ヘッダへ変換して direct POST するフォールバックを追加（暫定）。
- `admin-site/components/image-upload.tsx`: admin proxy が失敗した場合の direct-complete フォールバックを強化（runtime の `USER_ID` 注入をヘッダに含めるなど）。

推奨される本番対応（優先度順）
1. 安全化: `admin-site/app/api/images/save/route.ts` で `sb-access-token` を Supabase にサーバー側で検証し、検証成功時に `X-User-Id` を付与する実装に置き換える（クライアント送信 `user_id` を信頼する暫定処理は削除）。
2. 確実な proxy: `forwardToPublicWorker` が `Cookie` と `Authorization`、および `X-User-Id` を確実に転送することを保証する。必要なら一時的に転送先 URL をログ出力して問題特定。
3. public-worker のログ確認: `resolveRequestUserContext` のログ（既にデバッグ出力あり）で実際に受信しているヘッダと token の整合性を確認する。
4. 画像表示: フロントエンド側で必ず `public-site/shared/lib/image-usecases.ts` の `responsiveImageForUsage` を使って URL を生成することを確認。JSX 内で直接フル URL を埋め込む箇所があれば修正。
5. キャッシュ検証: 実際の画像 GET を curl で 2 回叩き、ヘッダ `cf-cache-status: HIT` などを確認する。もし HIT が出ない場合は public-worker の `Cache-Control` 設定を見直す。

必要であれば私が即座に行う作業
- admin サイドでの「Supabase を使ったトークン検証→X-User-Id 付与」実装を作成してコミットします（安全な本番対応）。
- public-worker 側のログ出力の追加（どこへ転送されているか可視化）を一時的に追加してデプロイします。
- 管理 UI の直接フォールバックを一時的に有効化したまま、本番では安全版へ移行するための PR を作成します。

----

画像 variants（要件）
- ヘッダー画像（大）: スマホ 800px / PC 800px（結果的に 800px のみ）
- 商品画像（一覧表示）: スマホ 200px / PC 400px
- 商品画像（詳細表示）: スマホ 400px / PC 400px（400px のみ）
- 添付画像（商品添付）: スマホ 200px / PC 400px
- ギャラリー表示（商品画像＋添付混合）: スマホ 200px / PC 400px
- レシピ画像: スマホ 400px / PC 800px
- プロフィールアイコン: スマホ 200px / PC 200px（200px のみ）
- ローディングアニメーション用 GIF: オリジナルのまま（変換しない）
- 他の公開ページに埋め込みの画像: オリジナルのまま

オリジナル平均サイズ: **600 KB**

`public-site/shared/lib/image-usecases.ts` の抜粋
```ts
export const ALLOWED_WIDTHS = [200, 400, 800] as const
export const DEFAULT_QUALITY = 75
... (省略)
export function responsiveImageForUsage(raw?: string | null, usage: ImageUsage = 'list', domainOverride?: string | null) {
  if (!raw) return { src: null, srcSet: null, sizes: undefined }
  const Q = DEFAULT_QUALITY
  const widths = usageToWidths(usage)
  if (usage === 'original' || widths.length === 0) return { src: getPublicImageUrl(raw, domainOverride), srcSet: null, sizes: undefined }
  return buildSrcSet(raw, widths, 'auto', Q, domainOverride)
}
```

このドキュメントは `docs/IMAGE_UPLOAD_ISSUE_REPORT.md` としてリポジトリに保存しました。
