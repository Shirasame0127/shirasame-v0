# 公開ページ仕様・設計・関連ファイルまとめ

このドキュメントは、`v0-samehome` の公開ページ（トップページ）に関する仕様、UI/UX設計、データフロー、依存ファイル、API連携、状態管理、スタイル構成、および拡張方針を総合的にまとめたものです。運用・改修時の参照を目的としています。

## 概要
- パス: ルート公開ページは `app/page.tsx`。
- レイアウト: 全体レイアウトは `app/layout.tsx` により提供。フォント、グローバルCSS、`AppInitializer`、`@vercel/analytics` を適用。
- ナビゲーション: 右側スライドメニューを持つ公開ナビ `components/public-nav.tsx` をヘッダーで表示（ロゴ中央固定）。
- セクション構成（アンカーリンク対応）:
  - コレクション一覧（`#collection-<id>`）
  - すべての商品（`#all-products`）
  - デスクセットアップ（レシピ）（`#recipes`）
  - プロフィール（`#profile`）

## レイアウトとグローバル設定
- ファイル: `app/layout.tsx`
- フォント:
  - Google Fonts: `Geist`, `Geist_Mono`
  - ローカルフォント: `../public/fonts/Oswald-Medium.ttf` を CSS 変数 `--font-oswald-medium` として適用
- メタ情報: `Metadata` を設定（タイトル・説明・アイコン・Apple アイコン）
- Body 設定: `font-sans antialiased` + `oswaldMedium.variable` を付与
- 初期化: `AppInitializer` を body 直下に設置（アプリ初期状態を通知／制御）。
- 分析: `@vercel/analytics/next` を末尾に設置。

## ヘッダー／公開ナビ
- ファイル: `components/public-nav.tsx`
- 役割: ヘッダー固定・右側スライドメニューで目次リンクを提供。`db.collections` の `visibility === "public"` のコレクションを目次に表示。
- ロゴ: `/images/shirasame-logo.png` を中央固定でリンク。`next/image` 使用。
- メニュー: `Menu`/`X` アイコンで開閉。開くと固定パネルが右から表示。
- 目次:
  - コレクション一覧（`#collection-<id>`）を順に表示
  - すべての商品（`#all-products`）
  - デスクセットアップ（`#recipes`）
  - プロフィール（`#profile`）
- 管理導線: 下部に `/admin` へのボタン（`Sparkles` アイコン）
- 初期ロード表示制御: `window.__v0_initial_loading` と `v0-initial-loading` カスタムイベントで、初期ロード中の表示抑制に対応。
- スクロール挙動: 目次クリックで該当セクションへ `scrollIntoView({ behavior: 'smooth' })`。

## トップページ（公開）
- ファイル: `app/page.tsx`
- クライアントコンポーネント: `"use client"`
- 動的インポート（SSR 無効）：
  - `ProfileCard`, `ProductCardSimple`, `ProductDetailModal`, `RecipeDisplay`, `ProductMasonry`
- UI ライブラリ: `@/components/ui` 配下の `button`, `select`, `badge`, `label`, `sheet`, `accordion`, `input` を利用。
- アイコン: `lucide-react`（`Grid3x3`, `List`, `Filter`, `SortAsc`, `X`）

### データソース・取得戦略
- ストレージ:
  - ローカルモック DB: `db`（`@/lib/db/storage`）から `recipes`, `theme`, `user` などを参照（フォールバック用途）。
- API 呼び出し（クラウド優先・並列取得）:
  - `/api/products?published=true&shallow=true&limit=<pageLimit>&offset=0`
    - 公開商品一覧（軽量形式）。`images` が存在しない場合は `image` から正規化して `images` を構築。
  - `/api/collections`
    - コレクション一覧。
  - `/api/profile`（条件付き）
    - `document.cookie` に `sb-access-token` がある場合のみ取得。401 は未ログインとして扱い、強制遷移しない。
  - `/api/tag-groups`, `/api/tags`
    - タググループとタグ一覧を取得。サーバー側が空の場合は商品タグからグループを導出（リンク系は「リンク先」、その他は「その他」）。
- 初期表示: `products/collections/user/theme` が揃い次第 `isLoaded` を true にして表示。タグ取得はバックグラウンドで継続。

### 状態管理
- 商品・レシピ・コレクション・ユーザー・テーマ: `useState`（初期ロード後にセット）
- 表示モード: `displayMode`（`normal`|`gallery`）
- トランジション制御: `isTransitioning`（モード切替時など）
- モーダル: `selectedProduct`, `selectedImageUrl`, `isModalOpen`
- ビュー切替: `viewMode`（`grid`|`list`）、`gridColumns`（PC デフォルト 5 列）、`layoutStyle`（`masonry`|`square`）
- ソート: `sortMode`（`newest`|`clicks`|`price-asc`|`price-desc`）
- タグ絞り込み: `selectedTags`, `tagGroups`, `openGroups`（アコーディオン開閉状態。初期は全開）
- 検索: `searchText`（IME 配慮のデバウンス・確定時即反映）、`isGallerySearchSticky`
- フィルタ UI: `showFilters`, `isFilterSheetOpen`
- ページネーション／無限スクロール: `pageLimit`（デフォルト 24）, `pageOffset`, `loadingMore`, `hasMore`, `sentinelRef`

### フィルタ UI 仕様（`FilterContent`）
- 入力:
  - テキスト検索: `Input`（IME 合成中はデバウンス停止、確定で即反映、Enterで確定）
  - グリッド列数: `Select`（モバイル: 2/3 列、PC: 4/5 列。`viewMode === 'grid'` のみ）
  - 並び替え: `Select`（新しい順／クリック数順／価格昇順／価格降順）
  - タグ絞り込み: `Accordion` + `Badge`（選択・解除、グループごとの選択数バッジ表示、全解除ボタンあり）
- モバイル最適化: 高さ制約・スクロールバー調整・小さめテキスト。

### 商品リスト表示
- グリッド／リスト切替に対応。
- マス目レイアウト: `ProductMasonry`（`layoutStyle === 'masonry'`）
- シンプルカード: `ProductCardSimple`（`layoutStyle === 'square'` or `viewMode === 'list'` の場合に併用の可能性）
- 画像URL: `getPublicImageUrl`（`@/lib/image-url`）経由で公開画像のパスを生成。
- 詳細モーダル: `ProductDetailModal` で商品詳細・画像切替等を表示。

### レシピ（デスクセットアップ）表示
- コンポーネント: `RecipeDisplay`
- データ: `db.recipes.getAll()`（`published` フィルタ）
- セクションアンカー: `#recipes`

### プロフィール表示
- コンポーネント: `ProfileHeader` と `ProfileCard`
- データ: `/api/profile` が利用可能ならそちらを優先し、なければ `db.user.get()` をフォールバック。
- セクションアンカー: `#profile`

### 無限スクロール仕様（要旨）
- 初回ロード後、`sentinelRef` がビューポートに入ったら次ページを取得。
- クエリ: `/api/products?published=true&shallow=true&limit=<pageLimit>&offset=<pageOffset>`
- `hasMore` が true の間のみ追加ロード。取得後に `pageOffset` を更新。

## 関連ファイル一覧（主なもの）
- ページ／レイアウト
  - `app/layout.tsx`: HTML 構造・フォント・メタ・初期化・分析
  - `app/page.tsx`: トップ公開ページ本体（フィルタ・表示・データ取得）
- コンポーネント（公開側）
  - `components/public-nav.tsx`: ヘッダー＋右スライド目次
  - `components/profile-header.tsx`, `components/profile-card.tsx`: プロフィール表示
  - `components/product-card-simple.tsx`, `components/product-detail-modal.tsx`, `components/product-masonry.tsx`: 商品表示
  - `components/recipe-display.tsx`: レシピ表示
  - `components/app-initializer.tsx`: 初期ロード連携（グローバルフラグ・イベント）
  - `components/initial-loading.tsx`: 初期ロード用表示（必要に応じて）
- ライブラリ／ユーティリティ
  - `lib/image-url.ts`: 画像URL生成
  - `lib/db/storage`: クライアント側モックデータストレージ
  - `lib/db/schema`: 型定義（`Product`, `Collection` 等）
- API（サーバー側、Next.js Route Handler）
  - `app/api/*`（ルート実装は別途確認。上記の `/api/products`, `/api/collections`, `/api/profile`, `/api/tag-groups`, `/api/tags` を参照）
- スタイル
  - `app/globals.css`, `styles/globals.css`: グローバルスタイル適用

## デザイン指針／インタラクション
- 一貫したトーン: シンプルで見通しの良いカード／グリッド表示。フォントはモダン（Geist）＋見出し用ローカルフォント。
- 操作系:
  - ヘッダー常時固定、目次は右サイドからスライド表示。
  - 検索・絞り込み・並び替えは折りたたみ可能な UI。
  - タグの選択状態をバッジで可視化。解除も容易。
- レスポンシブ:
  - モバイルでは列数選択が 2/3 列、テキストサイズ縮小。
  - スクロール領域の調整（`Accordion` 内での overflow 調整）。

## 拡張・変更時のポイント
- API をクラウド優先にしつつ、モック DB をフォールバックとして維持しているため、サーバー機能導入中でもページが壊れにくい設計。
- `products` の軽量取得（`shallow=true`）に対して、`images` 配列をクライアント側で正規化する処理が入っている。サーバー側が完全形に移行したら正規化処理の簡略化が可能。
- タググループがサーバー未提供の場合は商品タグから導出している。サーバー側が `group` と `sort_order` を安定提供できる前提に切り替えると UI 並びの安定化に寄与。
- 無限スクロールは `sentinelRef` に依存するため、レイアウト変更時もセクション終端付近の sentinel を維持する。
- レイアウト切替（`masonry`/`square`、`grid`/`list`）が複数ルートで絡むため、表示論理の分岐箇所は機能追加時に副作用が出やすい。切替仕様をテストでカバーすることが望ましい。

## 既知の依存・前提
- `window.__v0_initial_loading` と `v0-initial-loading` イベントに依存した初期ローディング表示制御。
- 認証トークン（`sb-access-token`）クッキーがある場合のみ `/api/profile` を呼ぶ。
- 画像パスは `getPublicImageUrl` による変換を前提。

## 変更フロー（例）
1. データ仕様変更（API レスポンス）
   - サーバー側 Route Handler を更新 → 正規化コード（`app/page.tsx`）の影響範囲を確認 → UI の `images` 前提を満たすか検証。
2. UI 追加（新しいフィルタ）
   - `FilterContent` にインプット追加 → ステート／クエリ処理を `app/page.tsx` に拡張 → 絞り込みロジックへ反映。
3. セクション追加
   - `public-nav.tsx` に目次リンクを追加し、該当セクションにアンカー（`id`）を付与。`scrollIntoView` の対象に含める。

## テスト観点（推奨）
- 初期ロード後に公開データが表示される（`isLoaded` の切替）。
- タググループ・タグのサーバー提供有無による UI の分岐を確認。
- 無限スクロールが `hasMore` と `pageOffset` を正しく更新する。
- 検索（IME 合成時のデバウンス停止／確定時即反映）が意図通り動作する。
- 表示モード切替（`grid`/`list`、`masonry`/`square`）で崩れがない。

## 参考リンク／確認先
- `docs/ARCHITECTURE.md`: 全体アーキテクチャ
- `docs/API.md`, `docs/API_DETAILS.md`: API 概要・詳細
- `docs/IMAGE_DISTRIBUTION_AND_CDN.md`: 画像配信の方針
- `lib/` 配下: 認証・Supabase・ストレージ・サービス等

---
このドキュメントは公開ページ関連の仕様変更に応じて更新してください。必要に応じて、UI のスクリーンショット、API スキーマ例、状態遷移図などを追記するとより保守が容易になります。
