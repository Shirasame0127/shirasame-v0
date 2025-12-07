# admin-api-proxy

This Cloudflare Worker proxies requests from `https://admin.shirasame.com/api/*` to the public worker origin (default `https://public-worker.shirasame-official.workers.dev`). Use this to keep the admin pages served from `admin-site` while forwarding all API calls to the public worker.

Deployment (quick):

1. Install Wrangler: `npm install -g wrangler` or use the Cloudflare UI.
2. Login: `wrangler login` and follow the prompts.
3. Set `API_BASE_ORIGIN` either in `wrangler.toml` under `vars` or in the Cloudflare dashboard (recommended for secrets).
4. Publish:

```powershell
cd cloudflare/admin-api-proxy
wrangler publish
```

 Routes:
 - Configure a route in Cloudflare dashboard or via `wrangler` routes: `admin.shirasame.com/api/*` so that this Worker runs for API paths on the admin domain.

 注意（超重要）:
 - 絶対に `admin.shirasame.com/*` や `*` のようなワイルドカードをルートに設定しないでください。ワイルドカードだと `/_next/static/*` 等の JS アセットも Worker に渡され、今回のように JS に対して HTML が返る問題を引き起こします。

 Dashboard 手順（簡単）:
 1. Cloudflare にログイン → 左メニュー「Workers」→ 対象 Worker を選択
 2. 『Triggers / Routes』 または 『Routes』 セクションを探す
 3. 既存のルート一覧を確認。もし `admin.shirasame.com/*` のようなワイルドカードがあれば削除する
 4. 新規にルートを追加: `admin.shirasame.com/api/*` を登録（保存）

 CLI の自動登録（wrangler）:
 wrangler による公開で route を自動登録したい場合、`wrangler.toml` に `route = "admin.shirasame.com/api/*"` を追加してから `wrangler publish` してください（先に Cloudflare アカウントにログインしておく必要があります）。

 検証コマンド（PowerShell）:
 - ネイティブ curl を明示して実行:
 ```powershell
 curl.exe -I https://admin.shirasame.com/_next/static/chunks/<CHUNK>.js
 curl.exe -i https://admin.shirasame.com/_next/static/chunks/<CHUNK>.js | Select-String -Pattern '<!DOCTYPE|<html|<body' -Context 0,2
 curl.exe -i https://admin.shirasame.com/api/auth/whoami
 curl.exe -i https://admin.shirasame.com/api/recipes
 ```

 結果の判定:
 - JS チャンクは `Content-Type: application/javascript` で返ること。HTML が返っている場合は Worker がワイルドカードで受けている可能性が高いです。
 - API (`/api/*`) は public-worker の JSON を返すこと（Login 状態により 200/401 など）。

 Cloudflare API でルートを確認/編集するテンプレ（必要なら実行してください）:
 ```bash
 # ルート一覧を取得
 curl -X GET "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/workers/services/admin-api-proxy/routes" \
	 -H "Authorization: Bearer <API_TOKEN>" \
	 -H "Content-Type: application/json"

 # ルートを追加（例）
 curl -X POST "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/workers/services/admin-api-proxy/routes" \
	 -H "Authorization: Bearer <API_TOKEN>" \
	 -H "Content-Type: application/json" \
	 --data '{"pattern":"admin.shirasame.com/api/*"}'
 ```

 （注）API トークンは作成時に必要な権限（Workers:Edit, Zone:Zone:Read, etc）を付与してください。API トークンはこのチャットに貼らないでください。
