# Shirasame — Repository Summary for ChatGPT

このドキュメントは、ChatGPT（あるいは他のレビュア）がこのリポジトリだけを読んで、一発でプロジェクト構成・主要機能・開発手順・注意点を把握できるようにまとめた要約です。

---

## プロジェクト名と目的
- 名称: Shirasame (workspace: ホームページ開発 / shirasame-v0)
- 目的: EC/商品カタログ＋管理画面＋公開 API を含むウェブサイトと運用ワークフローの集合体（公開サイト・管理サイト・Cloudflare Workers を含む）。

## 概要（1行）
- 公開用フロントエンド（public-site）、管理用 UI（admin-site）、Cloudflare Workers（cloudflare/ 以下）で構成されるフルスタックリポジトリ。TypeScript + Next.js (app router) + Tailwind CSS、pnpm ワークスペース。

## 技術スタック（要点）
- フレームワーク: Next.js (app router, React 19)
- 言語: TypeScript
- CSS: Tailwind CSS
- パッケージ管理: pnpm
- エッジ: Cloudflare Workers
- テスト: Playwright（設定あり）

## リポジトリ構成（トップレベル）
- `public-site/` — 公開フロントエンド（Next.js app）
  - 主要: `app/`, `components/`, `public/`, `next.config.mjs`, `tsconfig.json`
  - 例: `public-site/components/initial-loading.tsx`（初期ローディング）
  - 例: `public-site/components/product-detail-modal.tsx`（商品モーダル）
- `admin-site/` — 管理用 Next.js アプリ
- `cloudflare/` — Workers 実装 (例: `internal-api-worker`, `admin-api-proxy`)
- `shared/` — 両側で使う型・ユーティリティ
- `docs/` — API/デプロイ/アーキテクチャのドキュメント群

## 主要コンポーネントと責務（要点）
- `public-site/app/`: ページルーティング（トップ、商品一覧、商品ページ）
- `public-site/components/`: UI コンポーネント群
  - `initial-loading.tsx`: カスタムスロット式ローディング（英→ひらがな→漢字、個別ロック、バースト回転、welcome 表示→スライドアップでアンマウント）。SSR 安全設計（サーバーは決定論的出力）。
  - `product-detail-modal.tsx`: 商品モーダル（最近、余白を個別制御に変更）
- `admin-site/`: 商品管理、画像クロップ/アップロードなどの UI
- `cloudflare/*`: 管理 API プロキシ、内部 API、画像配信ロジック等

## API（概観）
- 公開 API は主に `public-site` と Cloudflare Workers 経由で提供。
- 詳細は `docs/API.md`, `docs/API_CURRENT_ROUTES.md` を参照。
- 画像配信・変換（R2 や CDN 経由）に関する設計・コスト検討ドキュメントが `docs/` にある。

## データフロー（要点）
- 管理画面で商品と画像を登録 → DB/ストレージ（例: R2）に保存 → 公開サイトは API で商品を取得してギャラリーを表示。
- 画像は配信時に変換/リサイズを行う想定（docs に設計メモあり）。

## ローカル起動 / 開発手順（public-site を例に）
前提: Node.js と pnpm がインストール済み。

```bash
pnpm install
pnpm --filter public-site dev
# 管理サイト:
pnpm --filter admin-site dev
```

Cloudflare Workers のローカル作業は `wrangler` などの設定に従う。

## ビルド / デプロイ
- 各サービスは独立してビルド・デプロイ可能。Next.js のビルドを用いる。
- CI はコミット時にビルドを走らせる想定（リポジトリ内 docs に手順あり）。
- 注意: サーバー/クライアント混在でブラウザ専用 API を誤ってサーバー側で呼ぶとビルドエラーになる（例: `new Image()` → `document.createElement('img')` に修正した履歴あり）。

## テスト
- Playwright 設定あり。E2E テストを用いて UI 機能を検証可能。

## 運用・セキュリティ（重要）
- 管理 API は認証必須。管理系はプロキシと認証フローで保護。
- 画像のクライアント側での「ダウンロード禁止」は不完全。強固にするには透かし・署名付き URL・配信ポリシーを検討。
- フォントは `public/` に置かれ、`@font-face` で利用。CSP/配信設定に注意。

## 実装上の注意（過去の変更より）
- SSR とクライアントの不一致を避けるため、初期 DOM は決定論的にし、クライアントでアニメーション開始する。
- タイマー（setInterval / setTimeout）は ref に保存して unmount 時にクリアする。
- ブラウザ API はクライアント側でのみ使用すること（TypeScript ビルドでエラーになるため）。
- 初期ローディングの主なフェーズ: 英字 -> ひらがな -> 漢字、個別ロック、全体バースト回転、"welcome!" 表示 (0.8s)、スライドアップ。

## 最近の変更 & 現在のフォーカス
- 初期ローディングのアニメーション強化（per-char lock, burst-spin on kanji, welcome 0.8s, SLIDE_DURATION 制御）。
- `product-detail-modal` の余白調整。
- ビルドエラー修正（`new Image()` → `document.createElement('img')`）。

## 主要参照ファイル
- 初期ローディング: `public-site/components/initial-loading.tsx`
- トップページ: `public-site/app/page.tsx`
- 商品モーダル: `public-site/components/product-detail-modal.tsx`
- 管理サイト README: `admin-site/README.md`
- API ドキュメント: `docs/API.md`, `docs/API_CURRENT_ROUTES.md`

## 推奨アクション（優先）
1. ローカルで `pnpm --filter public-site dev` を実行して UI とローディング挙動を目視確認。
2. Playwright E2E を実行して主要フローを自動検証。
3. 画像の流出対策（署名 URL / 透かし）を検討。
4. `docs/API.md` を最新のエンドポイント・認証方式で更新。

---

この要約をリポジトリのルートに `README_CHATGPT_SUMMARY.md` として保存しました。コミットと push を希望する場合、教えてください。また、要約を英語で出力したい、あるいはより短く/詳細版に拡張したい場合も指示ください。
