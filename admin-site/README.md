# admin-site

管理用 Next.js サイト（Pages / App Router 構成、`public-site` と同等のビルド設定）。

起動:

```powershell
cd admin-site
pnpm install
pnpm dev
```

ポイント:
- `NEXT_PUBLIC_API_BASE_URL` を設定して Workers の公開 API を指す（例: `https://api.example.com`）
- 管理 API を直接叩く場合はヘッダ `X-INTERNAL-KEY` を `INTERNAL_API_KEY` と合わせて設定する必要があります（Workers のプロキシ利用時）。
# admin-site（Pages静的 + Workers API）

- 目的: 管理 UI を静的サイトとして Pages にデプロイし、Workers API 経由で DB/画像を操作（すべて無料枠）。
- 開発: `.env.local` に `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定。

## 開発コマンド
```powershell
pnpm install
pnpm dev
```

## デプロイ（Pages）
- Build: `pnpm install && pnpm build`
- Output: `out/`（`next.config.mjs` の `output: 'export'` により静的書き出し）
- 環境変数（Pages）:
  - `NEXT_PUBLIC_API_BASE_URL=https://<workers-domain>`
  - `NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>`

## 注意
- 管理用の権限操作は必ず Workers 側で実行し、Service Role は Workers Secrets のみ。
- 画像は管理 UI からトリミング後に原本を R2 へ direct 保存。表示は 200/400/800 の固定幅に統一。
