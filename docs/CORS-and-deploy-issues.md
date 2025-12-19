# 現在発生している問題と対処方針

## 概要
- ブラウザ上で public-site（https://www.shirasame.com）から public-worker（https://public-worker.shirasame-official.workers.dev）の `/api/public/*` を叩いた際に多数の CORS エラーが発生している。
  - エラー例: "has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource."
- 一部エンドポイントは 404（`tags`, `tag-groups`, `amazon-sale-schedules` 等）や 200 を返しているが、ブラウザでは `net::ERR_FAILED` としてブロックされる。

## これまでの対応（実施済み）
- クライアント側: `public-site` のソースで `fetch()` を共通の `apiFetch` に置換し、`/api/public/*` を使うよう変更（ただし旧 `.next` ビルド成果物が残っているため、古いバンドルが引き続き配信される懸念あり）。
- ワーカー側: `public-worker/src/middleware/public-cors.ts` を修正。
  - /api/public のレスポンスに CORS ヘッダを付与するミドルウェアを実装（preflight OPTIONS に 204 を返す処理含む）。
  - さらにグローバルラッパー化して `/api/public` にマッチするすべての経路で、下流レスポンスをラップして CORS ヘッダをマージするよう変更。
  - `Cache-Control: no-store` を追加して古いキャッシュの影響を軽減。
- ワーカーは複数回デプロイ済み（最新バージョン ID: b6952a99-c189-4e23-8c38-69570e433bfc）。

## 目に見える症状（ユーザ/ブラウザの観測ログ）
- Network タブに並ぶ多数のエントリで赤い `CORS error`・`Access to fetch at ... has been blocked by CORS policy`。
- 一部エンドポイントは `404 Not Found`（実装漏れやルーティングの違いの可能性）。
- curl で直接 `Origin: https://www.shirasame.com` を付けて叩くと、OPTIONS は CORS ヘッダを返すが GET のレスポンスでは `Access-Control-Allow-Origin` が見えないケースがある（環境による観測差あり）。

## 可能性の高い原因（仮説）
1. ミドルウェアがすべてのレスポンス経路をカバーしていない（早期 return、例外ハンドラ、別ルートなど）。
2. 一部のハンドラが `Response` を独自に返しており、ミドルウェアで正しくラップされていない。
3. Cloudflare/エッジや CDN によるキャッシュが古いレスポンス（CORS ヘッダなし）を返している。
4. public-site が古い `.next` バンドルを配信しており、ブラウザが古いクライアントコードで非公開 API を叩いている。
5. ワーカーのビルド/デプロイと実際に配信されているバージョンにズレがある（wrangler の環境設定や route 設定の差分警告あり）。

## 優先度付き対応案（推奨順）
1. ワーカー側の動作確認（即実行）
   - 目的: サーバが GET レスポンスに CORS ヘッダを付与しているかを確実に確認する。
   - 実行コマンド（端末で実行）:
     ```bash
     curl -i "https://public-worker.shirasame-official.workers.dev/api/public/products?published=true&limit=1" -H "Origin: https://www.shirasame.com"
     curl -i -X OPTIONS "https://public-worker.shirasame-official.workers.dev/api/public/products" -H "Origin: https://www.shirasame.com" -H "Access-Control-Request-Method: GET"
     ```
   - 期待値: GET と OPTIONS 両方に `Access-Control-Allow-Origin: https://www.shirasame.com`（または許可された origin）が含まれること。

2. ワーカーのログ／計測を追加してどの経路が CORS ヘッダを欠いているか特定（必要なら短期間でログ出力を増やして再デプロイ）
   - 追加案: テスト用のヘルスチェックルート（`/api/public/_cors-test`）を追加して、必ず CORS ヘッダを付与する単純レスポンスを返す。ブラウザと curl の両方でチェック。 
   - 例: レスポンスで現在のバージョンIDとヘッダを返す簡易エンドポイント。

3. ルートとミドルウェアの網羅確認
   - `registerPublicCors` が `/api/public` のすべてのサブパスを確実にラップしているか、また `app.use('*', ...)` の前に早期 return するコードがないかを確認。
   - `makeErrorResponse` 等のユーティリティが独自に `Response` を生成している場合、その中で `computePublicCorsHeaders` を使ってヘッダを付与する。

4. CDN/Cloudflare キャッシュの確認と無効化
   - Cloudflare のキャッシュや Worker の route でキャッシュ設定がないか確認。`Cache-Control: no-store` が有効になっているかを確認し、必要なら Cloudflare 側のキャッシュを purge。

5. `public-site` の再ビルド & デプロイ
   - ローカルで `public-site` をビルドして（`pnpm build` 等）、ホストに再デプロイして古い `.next` バンドルを置換。
   - ビルド後に `.next` を検索して `fetch(` やハードコードされた管理 API host が含まれていないか確認。

## 推奨する短期的操作フロー（私が実行可能）
- まず私がワーカーの GET/OPTIONS を `curl` で自動実行して結果をレポートします（今すぐ実行可能）。
- 必要ならワーカーに短期的な検証エンドポイントを追加してデプロイします。
- その後、`public-site` の再ビルドを行います（ユーザの許可があれば私が実行してデプロイ可能）。

## ログ例と観測（添付スクリーンショット要約）
- ブラウザの Network/Console では多数の `CORS error` と `net::ERR_FAILED 200 (OK)` が混在。多くは `Access-Control-Allow-Origin` ヘッダ欠落によるブロック。
- 一部リクエストは 404 を返すため、フロントの期待している API が存在しない可能性もある。

## 追加の修正案（必要な場合）
- 全ての `makeErrorResponse` / `new Response(...)` 呼び出しに `computePublicCorsHeaders` を適用するか、レスポンスを返す共通ヘルパを作る。
- `registerPublicCors` をさらに早い段階（アプリ初期化直後）に登録して、例外的な早期リターンも捕捉する。

## 検証コマンド（まとめ）
```bash
# OPTIONS preflight
curl -i -X OPTIONS "https://public-worker.shirasame-official.workers.dev/api/public/products" \
  -H "Origin: https://www.shirasame.com" \
  -H "Access-Control-Request-Method: GET"

# GET with Origin header
curl -i "https://public-worker.shirasame-official.workers.dev/api/public/products?published=true&limit=1" \
  -H "Origin: https://www.shirasame.com"
```

---

作業を続けてよければ、次に何を実行しますか？
- A: 今すぐ `curl` を実行してワーカーの GET/OPTIONS を確認（私が実行）
- B: ワーカーに `/api/public/_cors-test` を実装して再デプロイ（私が実行）
- C: `public-site` をビルド＆デプロイ（私が実行）
- D: 上記すべてを順に実行（私が実行）

作業希望を教えてください。
