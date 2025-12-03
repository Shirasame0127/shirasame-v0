# Deploy checklist — 公開ページ / API / 管理画面

目的: 公開ページ（SSG）・Public API（Cloudflare Workers）・管理画面（Next.js）の本番デプロイを安全に行い、ローカルと本番のドメイン両方で画像変換（unique transforms）をテストできる手順。

**前提**
- 画像オリジナルは Cloudflare R2 に保存。公開ページでは固定バリアント（200/400/800 等）の unique transform を使って配信する方針。
- Public API は Cloudflare Workers（wrangler）で提供、Supabase Service Role Key は Workers secret として保管。

---

## 1. 準備（必須）
- 各サービスのアカウント情報を準備: Cloudflare (Pages, Workers, R2), Supabase, Vercel（管理画面用を使う場合）
- ローカルに必要な env を `.env.local` に設定（開発用）
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_R2_PUBLIC_URL`（開発時は公開URLがなくても動作チェック用にモック可能）
- CLI: `pnpm`（Node）, `wrangler`（Workers）, `git` を準備

## 2. Cloudflare R2 の確認／設定
- R2 バケット作成、パブリック配信が必要ならバケットポリシーを確認
- `R2_PUBLIC_URL`（例: `https://<account>.r2.cloudflarestorage.com/<bucket>`）を控える
- サンプル画像をアップロードして `cf-cache-status` を確認する（下の検証コマンド参照）

## 3. Workers (Public API) の準備とデプロイ
- `wrangler.toml` を用意（プロジェクトの `workers/` 配下）
- Secrets 設定（ローカルでは `.dev.vars`、本番は `wrangler secret put`）:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_URL`
  - `R2_PUBLIC_URL`（必要時）
- API が `shallow` レスポンスで `basePath` を返すことを確認
- デプロイ: `wrangler publish`（CI で行うのが推奨）

## 4. 公開サイト（Pages / Vercel）のデプロイ（先に公開ドメインを割当てる）
- 選択肢:
  - Cloudflare Pages: SSG 出力をビルドして Pages にデプロイ（推奨、R2 と組み合わせ容易）
  - Vercel: Next.js App Router のフル機能を使う場合はこちら
- 必須 env（本番）:
  - `NEXT_PUBLIC_SITE_URL` (例: `https://shirasame.example.com`)
  - `NEXT_PUBLIC_R2_PUBLIC_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ドメイン追加: Pages/Vercel に `shirasame.<your-domain>` を追加し、DNS の CNAME/A を設定

## 5. ローカルでの hosts 登録（本番ドメイン確認用）
- Windows 管理者 PowerShell で `hosts` を編集してローカル検証を可能にする
  - 例: `127.0.0.1 shirasame.test` でローカル開発時に `http://shirasame.test:3000` を使う
- 注意: HTTPS が必要な OAuth 等は追加設定が必要

## 6. 画像変換（Image Resizing）テスト手順
- まず本番ドメインを用いて Cloudflare の Image Resizing を有効にし、代表的な transform URL を作る
  - 例: `${IMAGES_TRANSFORM_BASE}?width=400,quality=85,format=auto/<R2_PUBLIC_URL>/<basePath>/original.jpg`
- 本番ドメインとローカル（hosts 経由）両方で同一 transform を叩き、`cf-cache-status` とレスポンスサイズを確認
- 変換ユニーク数の監視: Cloudflare ダッシュボードの `Image Resizing`/Usage を見る

## 7. 管理画面のローカル検証フロー
- ローカル起動:
  - `pnpm install`
  - `pnpm dev`
- 操作確認:
  - 画像アップロード → R2（または開発モック）へ保存されるか
  - DB 更新（Supabase）→ Public API に正しく反映されるか
  - UI の動作（一覧、詳細、画像表示）

## 8. 管理画面本番デプロイ
- Vercel 推奨: Secrets を server-side に登録（`SUPABASE_SERVICE_ROLE_KEY` は絶対に公開しない）
- 環境変数を本番値に切替え、デプロイを行う
- 管理画面からの画像アップロードを一件テスト（公開ページ反映の確認）

## 9. 検証とローンチチェックリスト
- Public site が正しい `NEXT_PUBLIC_SITE_URL` で公開されている
- Workers `/products?published=true&shallow=true` が `200` を返す
- R2 の thumb URL（`thumb-400.jpg`）がブラウザで表示され、`cf-cache-status: HIT` が得られる（2回目以降）
- 画像 transform のユニーク変換数が計画内に収まっている
- Supabase RLS が公開のみを許可している（`published=true` 等）
- 管理画面での画像アップロード→公開ページ反映を一通り確認

## 10. ロールバック手順（簡易）
- Public site: 直近の安定なコミットへ revert & redeploy
- Workers: `wrangler deploy --rev <stable>`（CI にてタグを切っておく）
- R2: 元のオブジェクトに戻す（バージョン管理があれば復元）

---

## 付録: 便利な検証コマンド（PowerShell）
```powershell
# 1) ローカル dev 起動
pnpm install
pnpm dev

# 2) hosts を編集する（管理者 PowerShell）
# 管理者エディタで hosts を直接編集するか、下記コマンドでメモリ的に追記する
# ※ 永続的な編集はエディタで hosts を開いて保存してください
notepad $env:windir\System32\drivers\etc\hosts

# 3) ヘッダ確認（cf-cache-status）
Invoke-WebRequest -Method Head "https://<your-domain>/path/to/thumb-400.jpg" -UseBasicParsing | Select-Object StatusCode, Headers

# 4) Workers deploy（例）
wrangler publish

# 5) Workers secret 設定（例）
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

---

必要なら、この `deploy-checklist.md` をさらにプロジェクト固有の値（ドメイン名、wrangler.toml 内の設定例、Vercel のチーム名など）で埋めます。どの項目を自分でやるか代行するか教えてください。