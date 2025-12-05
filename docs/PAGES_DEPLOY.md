# Cloudflare Pages 推奨ビルド設定（pnpm / Next.js）

このプロジェクトは `pnpm` ワークスペースと Next.js（App Router）を使っています。Cloudflare Pages にデプロイする際は Pages のビルド設定を明示的に pnpm に合わせてください。

- Root directory: `public-site`
- Framework preset: `Next.js`（可能なら選択）
- Build command (推奨):

```powershell
pnpm install
pnpm run build
pnpm dlx @cloudflare/next-on-pages@1
```

または OpenNext を使う場合:

```powershell
pnpm install
pnpm run build
pnpm dlx @cloudflare/open-next@latest build
```

- Output directory: 空欄（Next.js integration を使う場合）。
- 環境変数（例）:
  - `NEXT_PUBLIC_API_BASE_URL` = https://public-worker.shirasame-official.workers.dev
  - `NEXT_PUBLIC_R2_PUBLIC_URL` = https://pub-...r2.dev
  - `NEXT_PUBLIC_SITE_URL` = https://<your-pages-domain>
  - `IMAGES_TRANSFORM_BASE` = /cdn-cgi/image

---

Note: このファイルを更新すると Cloudflare Pages の再デプロイがトリガーされます。こちらの変更はデプロイ確認用の小さなコミットです（自動生成日時を追記）。

Commit-Time: 2025-12-05T00:00:00Z

ヒント:
- Pages の CI が `npm` を使って `npm list` を実行して失敗する場合、ビルドコマンドの先頭で `pnpm install` を実行しておくことで依存ツリーを正しく解決できます。
- Output directory が見つからないエラーが出る場合は、`pnpm dlx @cloudflare/next-on-pages@1`（または OpenNext）をビルドコマンドに追加することを確認してください。
