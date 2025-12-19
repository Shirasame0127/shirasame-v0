# 公開ページ向け 参照API仕様

作成日: 2025-12-19

## 概要
- 目的: 認証不要で公開ページ（ストアフロントや埋め込みウィジェット）が利用するための軽量参照APIを `public-worker` 側に提供する。
- 特徴: 読み取り専用、低レイテンシ、CDNキャッシュに最適化、最小限のACL（公開/プレビュー切替）

## 対象リソース
- `products`（商品）: id, handle, title, description, price, currency, slug, published, images[], tags[]
- `collections`（コレクション）: id, handle, title, description, product_ids[], image
- `recipes`（レシピ等）: id, title, excerpt, content, images[], tags[]
- `tags`（タグ）: id, name, product_count

## エンドポイント設計（例）
- GET `/api/public/products` — 一覧（検索・フィルタ・ページング対応）
- GET `/api/public/products/:id` — 単一取得（id or handle）
- GET `/api/public/collections` — コレクション一覧
- GET `/api/public/collections/:id` — コレクション詳細（関連商品はページネーション対応）
- GET `/api/public/recipes` — レシピ一覧
- GET `/api/public/search` — 横断検索（q=、type=product|collection|recipe）

クエリパラメータ（共通）:
- `page` (int), `per_page` (int)
- `sort` (例: `created_at`, `price`), `order` (`asc`/`desc`)
- `q`（全文検索キーワード）
- `fields`（返却フィールドの最小化、例: `id,title,images`）
- `include`（関連リソースを埋め込む例: `include=products`）
- `preview`（任意、プレビュー用トークンを受け取る場合）

## レスポンス仕様（JSON）
- 成功: 200

例（一覧）:
```
{
  "data": [{ /* resource objects */ }],
  "meta": { "page":1, "per_page":20, "total":123 },
  "links": { "self":"...", "next":"..." }
}
```

例（単一）:
```
{
  "data": { /* resource */ }
}
```

エラー:
- 4xx/5xx を使用。共通エラーオブジェクト: `{ code, message, details? }`。

## キャッシュ戦略
- CDN（Cloudflare/Netlify/CloudFront など）での HTTP キャッシュを前提とする。
- 推奨ヘッダ: `Cache-Control: public, max-age=60, stale-while-revalidate=300`（短めのmax-ageで即時反映を許容）
- ETag/Last-Modified の利用で差分検出を行う。
- プレビュー（`preview` クエリ）や管理者操作直後はキャッシュをバイパスまたは短TTLにする。

## 認証・公開性
- デフォルトは認証不要（公開）。
- プレビュー機能が必要な場合は `?preview=TOKEN` を導入し、トークンを検証して未公開データを返すルートを用意する（トークンは短命・署名付き）。

## レート制限と保護
- 悪用対策としてIPベースのレート制限（例: 60 req/min）を推奨。
- レート超過時は `429 Too Many Requests` を返す。

## セキュリティ考慮
- CORS: 公開APIのため `Access-Control-Allow-Origin: *` を許可しても良いが、可能なら公開ドメインのホワイトリストを推奨。
- 入力は必ずサニタイズ（特に `q` 等の検索パラメータ）
- 大量アクセスやボット対策は別途WAF/edge rulesで対応。

## 運用ルール（必ず反映する項目）
- 公開性: 認証不要にすると誰でもGET可能になります（意図どおり）。公開APIであることを前提に設計・運用してください。
- 公開対象制限: レスポンスは必ず `published` フラグ等で公開済みデータのみ返すこと。未公開データは通常レスポンスに含めないでください。
- プレビュー: 管理者向けプレビューは `preview` トークンで分離します。トークンが無い通常リクエストでは未公開データを返さない実装にしてください。
- 機密データ除外: 価格の内訳、仕入れ先情報、内部メモ、内部ID 等の機密項目は公開レスポンスから除外してください。
- CORS: 必要なら公開ドメインのみをホワイトリストにするか、簡易に `Access-Control-Allow-Origin: *` を使うかを選定してください。ホワイトリスト推奨です。
- キャッシュ制御: CDN キャッシュ（短めの `max-age` と `stale-while-revalidate`）を利用します。プレビューはキャッシュをバイパスする設定にしてください。ETag/Last-Modified の併用を推奨します。
- レート制限: IPベース等でレート制限（例: 60 req/min）を導入し、超過時は `429 Too Many Requests` を返すようにしてください。
- 不正利用対策: WAF、ボット検知、リクエストログによる監視／遮断を行ってください。
- 画像アクセス: `images[]` は公開可能な URL のみ返却すること。署名付きURLが必要なら別途実装してください。
- 監査・監視: 異常アクセスのログ、メトリクス、アラートを設定し、運用で監視できる体制を整えてください。
- API仕様管理: OpenAPI 等で仕様を定義し、フィールド制限やレスポンス契約を明確に管理してください。

## 画像（media）関連
- 返却する `images[]` は公開アクセス可能な URL を返す。
- 必要に応じてサムネイルや変換用のクエリ（`?w=400&fit=cover`）をサポート。

### 完成版: 環境変数と公開運用について（必須）
- `IMAGES_DOMAIN`: https://images.shirasame.com
- `IMAGES_TRANSFORM_BASE`: https://shirasame-box.pages.dev/cdn-cgi/image
- `R2_PUBLIC_URL` / `NEXT_PUBLIC_R2_PUBLIC_URL`: https://images.shirasame.com
- `NEXT_PUBLIC_API_BASE_URL`: https://public-worker.shirasame-official.workers.dev
- `NEXT_PUBLIC_SITE_URL`: https://shirasame.com
- `PUBLIC_OWNER_EMAIL`: shirasame.official@gmail.com  ← **必須**（public-worker と public-site 両方で設定）

注意: `PUBLIC_OWNER_EMAIL` が未設定の場合、public-worker は起動・応答を失敗させる設計です（500 を返します）。指定されたメールに該当するユーザーが DB に無い場合は 404 を返します。メール値はレスポンスやログに平文で出力しません（必要時はマスクしてログ出力）。

## 画像配信（完成版の挙動）
- フロントは `shared/lib/image-usecases.ts` の `getPublicImageUrl` / `responsiveImageForUsage` を必ず使って `src`/`srcset` を生成します。
- public-worker の `/images/:key` は次のルールに従います:
  1. クライアントからのリクエストで `w,h,fit,format` 等の変換パラメータがあれば、`buildResizedImageUrl` を使って Cloudflare 形式の変換 URL（`/cdn-cgi/image/...`）を生成し、`302` リダイレクトで配信先へ誘導します。
  2. 変換パラメータが無ければ、`getPublicImageUrl` で生成した公開 URL へ `302` リダイレクトします。
  3. すべてのレスポンスに `Cache-Control` を付与し、Cloudflare 側でキャッシュさせる（例: `public, max-age=86400, immutable`）。

## サービス構成（推奨実装）
- public-site (Next): ブラウザで `responsiveImageForUsage` を使って `srcset` を生成し、画像 URL は `NEXT_PUBLIC_IMAGES_DOMAIN` / `NEXT_PUBLIC_R2_PUBLIC_URL` を利用する。
- public-worker: `getPublicImageUrl` と `buildResizedImageUrl` を参照して `images` エンドポイントを実装する。
- Cloudflare Images または Pages + `IMAGES_TRANSFORM_BASE` を使って変換された画像を配信する。

## 公開 API のオペレーションルール（完成版）
- 認証: 公開 API は「完全に認証不要」。Authorization/Cookieは一切利用しない。
- 公開対象制限: `PUBLIC_OWNER_EMAIL` に紐づくユーザーのデータのみ返す（owner_user_id によるフィルタ）。
- 失敗条件: `PUBLIC_OWNER_EMAIL` 未設定 → 500。該当ユーザーなし → 404。
- レスポンス: 機密情報（内部ID、仕入れ情報、内部メモ等）は除外する。

## テストとローカル実行
- `createApp(mockEnv)` パターンを使い、`PUBLIC_OWNER_EMAIL` を差し替えて owner 解決の動作をテストしてください。モックSupabaseクライアントで別ユーザーのデータが返らないことを確認するユニットテストを必須とします。

---
ファイル: `public-worker/公開参照API仕様.md` （完成版）


## 画像配信フローの統一（キー取得 → 変換 → エッジキャッシュ）
1. ストレージには画像の「キー」のみを保存（key-only）。DB は URL ではなくキーを保持する。
2. 表示側は `getPublicImageUrl(key)` で公開 URL を生成する。開発は相対 `/images/<key>`、本番は `IMAGES_DOMAIN` を使った絶対 URL を想定する。
3. ブラウザが公開 URL にアクセスすると public-worker が次を行う:
  - 既にエッジに変換済みのバージョンがあればそれを返す（Cache-Control/ETag付与）。
  - 変換済みが無ければストレージ（R2 等）から原データを取得し、リクエストされたサイズ・パラメータで変換して返す。その際に適切な `Cache-Control` と `ETag` を付与してエッジにキャッシュさせる。
4. `srcset` 用に複数サイズを生成する場合、`responsiveImageForUsage(key, options)` 等のユーティリティで `src`/`srcset` を統一的に生成する。
5. 署名付きURLを使う場合は別フローとし、公開APIの `images[]` には署名が不要な公開URLのみを含めるか、または明示的に `signed_image_url` フィールドを追加して用途を分離する。

運用上の注意:
- サムネイル等の事前変換（ウォームアップ）はコストと相談して導入。
- 画像の公開URLが漏れても情報漏洩にならないよう、返却するデータに機密情報を含めないこと。

## 実装メモ（public-worker）
- エッジ側でキャッシュ可能なレスポンスを作る（Cloudflare Worker / Vercel Edge Functions など）。
- DB は読み取り専用クエリ最適化を行う。必要ならキャッシュ層（Redis, edge KV）を使う。
- ページネーションは cursor-based も検討（大量データ時）。

## 必須テストケース
- 公開データの一覧取得（正常系）
- フィルタ／ソート／ページングの動作確認
- プレビュー（preview token）で未公開データが見えること
- キャッシュヘッダの検証（max-age / stale）
- 異常系（不正パラメータ、過負荷時の429）

## 追加提案
- OpenAPI（Swagger）で仕様を定義し、フロント側に自動生成クライアントを提供する。
- 監査ログ（公開APIへの異常なリクエストの記録）を残す。

---
ファイル: `public-worker/公開参照API仕様.md`
