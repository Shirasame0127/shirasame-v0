# Cloudflare DNS レコード（shirasame.com 用・コピペ用）

以下は Cloudflare の DNS 管理画面にそのままコピペ／入力できる形式の例です。ユーザーが送ってくれた行を忠実に反映しています。

| タイプ | 名前 | コンテンツ（ターゲット） | プロキシ ステータス | TTL | アクション |
|---|---:|---|---|---:|---|
| CNAME | `www` | `shirasame.com` | プロキシ済み | 自動 | 編集 |
| CNAME | `api` | `public-worker.shirasame-official.workers.dev` | プロキシ済み | 自動 | 編集 |
| CNAME | `images` | `（R2 の公開サブドメイン）` | プロキシ済み | 自動 | 編集 |
| R2 | `shirasame.com` | `images` | プロキシ済み | 自動 | 編集 |

---

補足と運用上の注意:

 - サブドメイン名について: 本ドキュメントでは `images`（複数形）に統一して記載しています。リポジトリ内の環境変数とドキュメントも `images` を前提に更新済みです。

- 画像配信用の CNAME は**必ず Cloudflare のプロキシ（オレンジ雲）を ON**にしてください。R2 の公開サブドメインは変換やキャッシュの動作に制限があるため、Cloudflare プロキシ経由にして `/cdn-cgi/image/...` を有効化する必要があります。

- `R2` 行は Cloudflare の R2 バケット設定とカスタムドメインの紐付け（Cloudflare ダッシュボード内の R2 設定）を示しています。R2 パネルでバケット `images` を作成／確認し、カスタムドメインの設定を行ってください。

- Worker（API）を `api.shirasame.com` に割り当てる場合は、Cloudflare の Workers ダッシュボードで `api.shirasame.com/*` を該当スクリプトにルート割り当てしてください。ドメインが同一の Cloudflare アカウントで管理されている必要があります。

---

設定後の簡単な検証コマンド（PowerShell）:

```powershell
nslookup -type=ns shirasame.com
nslookup images.shirasame.com
nslookup api.shirasame.com

# 画像変換テスト（実際の画像パスに置き換えてください）
curl -I "https://images.shirasame.com/cdn-cgi/image/width=400,format=auto,quality=75/uploads/your-image.jpg"

# Worker 健康チェック（エンドポイントは適宜）
curl -I https://api.shirasame.com/profile
```

問題が発生した場合（404 / 変換失敗など）は、まず Cloudflare DNS の CNAME が正しく R2 の公開サブドメインに向いていて、かつプロキシが ON になっていることを確認してください。プロキシが OFF のままだと `/cdn-cgi/image/` は動作しません。

もし追加で環境変数やドキュメントの修正を希望する場合は教えてください。Worker の `IMAGES_DOMAIN` 設定確認や公開サイトの再ビルド手順までサポートします。