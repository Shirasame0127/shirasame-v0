# 公開ページの SSG 化 + Cloudflare Pages（無料枠）

- 目的: 高速表示・低コスト運用。
- 構成: 公開ページは SSG シェル、データは CSR で Workers API を fetch。
- 画像: R2 原本＋ユニーク変換（200/400/800）、必要なら事前生成を併用。
- 反映: 管理更新→（必要時）Pages のビルドフックで再ビルド。CSR データは即時反映。
- コスト: Pages/Workers/Supabase/R2 の無料枠を前提。

関連: `公開ページ仕様.md` / `Workers_Products_API仕様.md`