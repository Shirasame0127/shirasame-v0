# 公開ページのSSG化 + Cloudflare Pages 配信 設計メモ

このドキュメントは、現行の公開ページを「静的シングルページ（SSG）」へ移行し、Cloudflare Pages で配信する方針について、実現可能性・方式比較・メリデメ・コスト試算・移行手順をまとめたものです。

## 概要
- 目的: 表示速度の向上、配信コストの最小化、運用の簡素化。
- 前提:
  - 画像: Cloudflare R2 に保管（既存運用）。
  - データベース: Supabase。
  - API: Cloudflare Workers（以降「Workers」）へ分離予定。
  - 公開ページは 1 ページ構成（Gallery/Collections/All Items/Recipes/Profile 等）。
  - 商品数 ~120、各商品 画像1 + 添付4 → 画像合計 ~600。

## かんたん解説（専門用語なし）
※ 今回は「static-shell は使わない前提」で説明します（既存Next.jsアプリをそのまま活用）。

- 静的ページ = あらかじめ出来上がったページを配る方式。最初から中身が入った状態で表示が速い。
- 動的ページ = 見に来たタイミングで中身を作る方式。柔軟だが、その場で時間がかかることがある。
- 今回のゴール = 公開ページは「静的寄り」にして速く・安く見せる。管理で更新したら数分以内に反映されればOK。

やり方のざっくり比較（要点だけ）

| やり方 | 速さ | お金 | 反映の速さ | 作業の大きさ |
|---|---|---|---|---|
| そのままデプロイ（CSR中心） | ふつう（JS実行後に表示） | ほぼ0円 | ほぼ即時 | いちばん小さい |
| 静的生成（SSG/ISR） | 速い（中身入りで出せる） | ほぼ0円 | 数分（自動再生成） | 小〜中（公開ページ少し直す） |
| 完全静的＋JSON書き出し | いちばん速い | ほぼ0円 | 再ビルド後（数分） | 中（仕組みを足す） |

## 現状のやり方（構成と運用）
- 構成: 公開ページ・管理ページ・API は Next.js（App Router）で同一アプリ内に共存。
- データ: データベースは Supabase。画像は Cloudflare R2 に保管（公開URLで参照）。サムネイルは「ビルド時／アップロード時」に 400px/800px の2サイズを事前生成し、固定ファイル名（`thumb-400.jpg` / `detail-800.jpg`）で保存・直接配信する。
- API: 現在は同一アプリから提供。今後は API のみ Cloudflare Workers へ分離予定。
- 反映要件: リアルタイム性は不要。管理ページでの商品追加・編集・削除、画像差し替え後に「適切なタイミングで反映」されれば十分（再ビルド/再配信で可、Webhook による自動トリガー想定、目安: 数十秒〜数分）。
- 規模感: 商品 ~120、画像 ~600 → 完全静的配信（SSG + 静的 JSON）でも十分現実的なデータ量。
- 目的: 表示高速化と配信コスト最小化（Cloudflare Pages/R2 を最大活用）。

上記要件から、まずは「Full SSG + 静的 JSON」で公開（Option B）が最適。将来的に即時反映が必要な箇所のみ Workers を併用するハイブリッド（Option C）へ拡張可能。

## アーキテクチャ選択肢

### 選択肢 A: Static Shell + CSR Fetch（静的シェル + クライアント取得）
- 構成: HTML/CSS/JS を Cloudflare Pages で配信。初期HTMLは最小限のシェル。JS が Workers API から JSON を取得して描画・絞り込み。
- メリット:
  - 動的データ更新が即時反映（APIのキャッシュ制御次第）。
  - SSG再ビルド不要。運用がシンプル。
  - 初期表示はCDNから配信され高速。
- デメリット:
  - JS 依存。クローラ/初回描画で SSR/SSG ほどの即時性は出にくい。
  - API レイテンシに依存。キャッシュ設計が重要。

### 選択肢 B: Full SSG + 静的JSON（ビルド時データ固定）
- 構成: ビルドジョブが Supabase からデータを読み、`index.html` と `data/*.json` を生成。Cloudflare Pages に push。クライアントは Pages 上の静的 JSON を取得。
- メリット:
  - 完全静的配信のためパフォーマンス最強。Workers不要でコスト極小。
  - 失敗点が少なく安定（ネットワーク/レイテンシの影響が小）。
- デメリット:
  - 変更反映は「再ビルド」依存（Webhook/CI連携で自動化可）。
  - 在庫/価格の超リアルタイム性が必要な場合に不向き。

### 選択肢 C: Hybrid（SSG + On-Demand Refresh）
- 構成: 基本は B（静的JSON）。必要に応じて Workers 経由で「差分更新」や特定セクションのみ動的取得。Pages キャッシュは stale-while-revalidate。
- メリット:
  - 体感性能・近リアルタイム更新・運用コストのバランスが良い。
- デメリット:
  - 実装・運用がやや複雑（無効化・再生成の設計が必要）。

### 選択肢 D: Astro SSG + 部分ハイドレーション（今回の要望に最も近い）
- 構成: 公開ページは Astro で SSG（静的HTMLを事前生成）。必要な箇所だけJSを有効化（いわゆる“島”/Islands、例: `client:idle`, `client:visible`）。管理ページとAPIは既存の Next.js を継続利用（APIはWorkersへ移行可）。
- メリット:
  - 初回から中身入りHTMLをCDN配信（速い）。必要なところだけJSで“強化”。
  - 実装がシンプルで、デザインや構造のコントロールが容易（ページはそのままHTMLとして確認可能）。
  - コストは Pages Free 内でほぼ $0。R2/Supabaseも前述規模ならFree〜数十円/月。
- デメリット:
  - 公開ページが Astro、管理/APIが Next と二系統になる（学習/運用の分離）。
  - 既存Reactコンポーネントを使う場合、Astroでの統合（`@astrojs/react`）や分割設計が必要。

#### 実行難易度とコスト（Astro）
- 難易度: 中（公開UIをAstroへ移植、島に分割、Next管理/APIはそのまま）
- 移行工数の目安: 1〜3日（デザイン忠実度と機能範囲に依存）
- 月額コスト: ほぼ $0（Pages Free）+ R2 数円 + Supabase Free、合計 $0〜$1 未満想定（6k〜8k PV/月）

## 実現可能性（要件フィット）
- 検索・タグ絞り込み・並び替え・無限スクロールは、CSRで十分再現可（現行実装を移植/流用可能）。
- 画像は R2 → CDN 配信。Pages 直配 or Workers 画像最適化を経由の二択。
- 合計 ~120 商品・~600 画像規模は、完全静的 or 静的 + 低頻度再生成で十分運用可能。

結論: いずれの選択肢も実装可能。コスト最重視なら B（Full SSG + 静的JSON）、運用柔軟性なら A か C。

## 実例で理解する：商品を1つ追加したらいつ見える？

| シナリオ | 画面での見え方 | 反映タイミング | 補足 |
|---|---|---|---|
| そのままデプロイ（CSR中心） | ページを開く→JSがAPIから取得→表示 | ほぼ即時 | APIキャッシュを使うと速い＆安い |
| 静的生成（ISR, 例: 10分） | 中身入りHTMLで表示 | 最大10分（または更新時の再生成） | 管理画面更新時に「再生成」を叩けば即時も可 |
| 完全静的＋JSON | 中身入りHTML/JSONに基づき表示 | ビルド完了後（数十秒〜数分） | Supabase→Webhook→Pages再ビルドで自動反映 |

おすすめ（この規模・要件なら）
- まずは「静的生成（ISR）」がバランス良し：初回表示が速く、更新は数分or更新時即時再生成。
- いちばん簡単に移行したいなら「そのままデプロイ」＋APIにキャッシュヘッダを追加。

## 具体コスト試算（6k〜8k PV/月）
前提: 画像平均 300KB/枚・キャッシュヒット高め・1PVあたり API 5 リクエスト想定（保守的）

- Cloudflare Pages（配信/ビルド）
  - Free: $0/月（想定運用は Free 範囲内）
  - 備考: 1並列ビルド・ビルド回数の制限あり。必要時は Pro（≈$20/月）で拡張。

- Cloudflare Workers（Option A/C のみ）
  - Free: 100k リクエスト/日 目安 → 月 30k〜40k リクエストは $0/月
  - Paid 参考: $5/月で 10M リクエスト含む（超過 $0.50/百万）
  - 試算: 6k〜8k PV × 5 req/PV = 30k〜40k req/月 → Free 枠内 → $0/月

- Cloudflare R2（画像）
  - ストレージ: 0.2GB × $0.015/GB = 約 $0.003/月（≒¥0.5/月）
  - GET（Class B）: 例）平均 10 枚/訪問 × 8k PV = 80k GET/月
    - 単価: $0.36/100万 → 0.08 × 0.36 = 約 $0.0288/月（≒¥4/月）
  - PUT/LIST（Class A）: 例）1,000回/月 → $4.50/100万 → 約 $0.0045/月（≒¥0.7/月）
  - 転送: egress 無料（Cloudflare ネットワークからの配信）
  - 合計目安（R2）: 約 $0.04/月（≒¥6/月）

- Supabase（DB/ストレージ）
  - Free: $0/月（小規模運用の範囲内）
  - Pro: $25/月（上限拡張や安定運用が必要になった場合）
  - 試算: Option B（静的JSON）ではビルド時参照のみ → 実質 $0/月。Option A/C でもキャッシュ前提で Free 範囲内が現実的。

合計（予算観）
- Option B（Full SSG + 静的JSON）: 約 $0〜$0.05/月（≒¥0〜¥8/月） + Supabase Free $0
- Option C（Hybrid, Workers 併用）: 上記 + Workers Free $0 → 合計ほぼ $0/月
- 将来的に拡張時（例: Pages Pro/Workers Paid/Supabase Pro）: $20〜$25/月〜のオーダー

注記: 単価は一般公開情報に基づく目安（為替含め変動あり）。正式な料金は各サービスの最新価格に従います。

## 公開ページの表示速度とデータ量（目安）

前提（ホームの「商品一覧」想定）
- 商品: 約120。1商品あたりサムネイル1枚（添付4枚は詳細やギャラリー時に読み込み）。
- 初期表示: まずは上位24件（スマホ/PCでだいたい画面数枚ぶん）、残りはスクロールで徐々に読み込み。
- 画像サイズ: サムネイルは WebP/AVIF で 30〜80KB/枚 程度を想定（幅400〜600px）。

データ量の目安（初期表示時）

| 要素 | おおきさ（目安） |
|---|---|
| HTML（中身入りSSG/ISR） | 20〜80KB |
| CSS（Tailwindビルド後） | 50〜150KB（gzip後） |
| JS（必要部分） | 150〜300KB（gzip後） |
| JSON（商品24件のメタ） | 50〜150KB |
| サムネ画像（24枚 × 30〜80KB） | 0.7〜1.9MB |
| 合計（初期） | およそ 1.0〜2.5MB |

表示速度の目安（体感）
- CSR中心（そのままデプロイ）: 初期HTMLは薄い → JS実行後にリストが出る。4G相当で 2〜3秒台スタートが目安。
- SSG/ISR: 初期HTMLに中身が入る → 1〜2秒台で「とりあえず見える」状態。画像は遅延読み込みで後追い表示。
- 完全静的＋JSON: 体感は SSG/ISR と同等〜やや有利。すべてCDN配信で安定。更新はビルド後に反映。

さらに速く・軽くする小技
- サムネイルURLを統一（`?w=...&q=...`）し、画面幅に合わせて最適サイズを返す。
- 画像の遅延読み込み（`loading="lazy"`）とビューポート外のプリロード抑制。
- JSONは「一覧用（薄い）」と「詳細用（厚い）」に分ける。

## パフォーマンス設計
- キャッシュ:
  - Pages（静的資産）: `Cache-Control: public, max-age=31536000, immutable`（ハッシュ付きファイル）。
  - API/JSON: `stale-while-revalidate` を有効化（Workers or 静的JSONの再デプロイ）。
  - 画像: R2 + CDN キャッシュ長め。必要なら `?w=...` `?q=...` 付きのサムネイルURLを規格化。
- 画像最適化:
  - 原則は「事前生成 + 直接配信」。保存APIで 400px/800px の2サイズを生成し、R2 に `.../<basePath>/thumb-400.jpg` と `.../<basePath>/detail-800.jpg` として保存。
  - 実行時変換（Workers Image Resizing/Cloudflare Images）は使わない（ユニーク変換課金を避ける）。例外的に必要な場合のみ別途エンドポイントで対応。

### 画像配信の仕様（固定ファイル名 + basePath）
- 保存API（管理）: 原画像を受け取り、R2 に以下を作成
  - `<basePath>/thumb-400.jpg`
  - `<basePath>/detail-800.jpg`
- API（公開・一覧/詳細）: 画像エントリに `basePath` を含めて返却。
- クライアント（公開サイト）: 用途に応じて以下を組み立てて利用
  - 一覧: `${R2_PUBLIC_URL}/${basePath}/thumb-400.jpg`
  - 詳細/モーダル: `${R2_PUBLIC_URL}/${basePath}/detail-800.jpg`
  - 備考: 既存の `url` も後方互換のため返却するが、将来的には `basePath` ベースの参照に一本化可能。

## UI仕様（All Items オーバーレイ）

目的: 通常ビューの初期コストを抑えつつ、全件一覧は必要時にだけ読み込む（遅延ロード）ためのオーバーレイUI。

- トリガー: 画面内の「All Items」テキストをクリック/タップで起動。
- 表示: 右からスライドインするオーバーレイ（淡い水色の背景）。幅はデバイスに応じてレイアウトに追従（実装では既存スタイルに準拠）。
- 非表示: 右上の「×」ボタン、または `Esc` キーでクローズ。スライドアウトのアニメーションで収納。
- スクロール制御: オーバーレイ表示中は背面（本体）のスクロールをロック。オーバーレイ内のみスクロール可能。
- フォーカス管理/アクセシビリティ:
  - オープン時にオーバーレイ内へフォーカスを移動。タブ移動はオーバーレイ内でループ。
  - `aria-modal="true"`/`role="dialog"` を付与（実装側での付与可）。
- コンテンツ: グリッド一覧＋並び替え（Sort）をオーバーレイ内に再現。通常ビューのグリッドは描画しない（レンダリング/ネットワーク負荷削減）。
- 画像ロード: 初回オープン時にのみ画像を取得・描画（CSR）。クローズ→再オープン時はキャッシュ済みの内容を再利用（ブラウザ/アプリの状態管理に依存）。
- 画像URL: `basePath` から R2 の固定ファイル名を組み立てる（一覧は `thumb-400.jpg`、モーダル/詳細は `detail-800.jpg`）。WebPが利用可能な場合は優先（実装での `picture`/`source` 対応は任意）。
- ページネーション: 一覧は `limit`/`offset` をサポート（API側の仕様に追従）。初回は例えば `limit=24`、以降はスクロールや「もっと見る」で段階的に追加取得。
- URL/履歴: オーバーレイの開閉はURLを変更しない（戻るボタンで誤ってページ離脱しない）。将来的に `/all` などへルーティングしたい場合は別途検討。
- パフォーマンス: 遅延読み込み（`loading="lazy"`）、インターセクションオブザーバでビューポート内のみロード、`Cache-Control` と `ETag` をAPI側で付与（短期）し、同一セッションでの再取得を削減。

## セキュリティ/運用
- API鍵: クライアントからは「公開鍵」のみ。Supabase Service Role は Workers 側の環境変数に限定。
- CORS: Pages→Workers→Supabase の流れで `Origin` 制御。
- RLS: 公開エンドポイントは公開範囲に限定。ドラフト/非公開は返さない。
- 監視: Pages/Workers のログ・エラー通知（Wrangler/Analytics）。

## 推奨アーキテクチャ

1) まずは B（Full SSG + 静的JSON）で公開開始：
   - 最安・最速・シンプル。GitHub Actions or Cloudflare Pages ビルドで JSON/HTML を生成。
   - 更新は Supabase → Webhook で再ビルドをトリガー（数十秒〜数分で反映）。

2) 将来、即時反映が必要になったら C（Hybrid）へ拡張：
   - Workers に `/api/products` 等の薄いキャッシュ付きProxyを用意。
   - 重要部分のみ動的に差し替え。全体の再ビルド頻度を下げる。

## 実装ステップ（具体）

### ステップ 1: データ供給の確立
- Option B（Next SSG/ISR）
  - `scripts/build-public-json.mjs`（任意）でビルド時に Supabase → JSON 生成、または Next の Server Components/`revalidate` でサーバ側取得。
- Option C（Workers 併用）
  - Workers に `/api/products`, `/api/collections`, ... を実装。Edge Cache で 10〜60分TTL + `stale-while-revalidate`。
- Option D（Astro SSG）
  - Astro のビルド時（`astro build`）に Supabase から取得し、`src/content`/`src/data` に静的JSONを生成 or そのまま`getStaticPaths`等で注入。

### ステップ 2: フロント（Astro SSG）の統合
- 新規ディレクトリ例: `sites/public-astro`（同リポ内または別リポ）。
- 基本構成:
  - `src/pages/index.astro`（トップ） / `src/pages/profile/index.astro`（プロフィール等）
  - 公開ページはHTMLとして構造を再現。必要箇所のみ React/Vue/Svelte 等を島として読み込み（`@astrojs/react` + `client:idle` など）。
  - 例: モーダル、ローディング演出、無限スクロール、3D表示（GLB/Three.js）は島に分離。
  - 画像URLはR2の公開URL or サムネ変換サービスを利用（`?w=...&q=...`）。

### ステップ 3: 画像最適化の導入（任意）
- Workers ベース `GET /images/thumbnail?url=...&w=...` を実装 or Cloudflare Image Resizing を有効化。
- `main.js` の画像URL変換を統一（`thumbnailFor(url,w)` 的な関数）。

### ステップ 4: デプロイ/運用
- Cloudflare Pages で2プロジェクト運用（例）
  - 公開（Astro）: Build Command `npm ci && npm run build`、Output `dist/`
  - 管理/API（Next, next-on-pages）: Build Command `npm run build`、Functions有効化
- 環境変数（Pages Project）:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`（Astro/Nextのビルド時取得に利用）。
  - `PUBLIC_API_BASE`（Workers 経由にする場合）。
- Supabase → Webhook で Astro/Next の再ビルドをトリガー（更新を数分で反映）。

### ステップ 5: 保存時の自動反映（Save→Upload→Build/Revalidate）
更新頻度が「2日に1回」程度なら、以下のどちらでも十分現実的です。

- パターン B-1（おすすめ・手間最小）: Next ISR（時間ベース再生成）
  - 反映: `revalidate` で指定したTTL経過後、最初のアクセスで自動再生成（例: 12〜24時間）。
  - 実装要点:
    - 公開ページをサーバーコンポーネント化し、サーバー側で `fetch`。
    - `export const revalidate = 43200`（12h など）または `fetch(url, { next: { revalidate: 43200, tags: ["products"] } })`。
    - 保存直後に即時反映したい場合のみ、管理側から `revalidateTag('products')` を叩くAPIを用意。

  例: 公開ページ側のデータ取得（App Router）

  ```ts
  // app/page.tsx（サーバーコンポーネント）
  export const revalidate = 43200; // 12時間

  async function getProducts() {
    const res = await fetch(process.env.PUBLIC_API_BASE + "/api/products?published=true&shallow=true&limit=24&offset=0", {
      next: { revalidate: 43200, tags: ["products"] },
    });
    return res.json();
  }
  ```

  例: 保存後に即時再生成したい場合のAPI（管理側のみアクセス可能に）

  ```ts
  // app/api/admin/revalidate/route.ts
  import { NextResponse } from "next/server";
  import { revalidateTag } from "next/cache";

  export async function POST() {
    // 認可チェック（管理者のみ）を必ず入れる
    revalidateTag("products");
    return NextResponse.json({ ok: true });
  }
  ```

- パターン B-2: 完全SSG＋静的JSON（Pagesビルドフック）
  - 反映: Cloudflare Pages の Build Hook を叩いて再ビルド（数十秒〜数分）。
  - 実装要点:
    - 画像アップロード（R2）→ DB更新（Supabase）→ 成功後に Build Hook をサーバーから `POST`。
    - Hook URL はサーバー環境変数 `CF_PAGES_BUILD_HOOK_URL` に保持（クライアントに露出しない）。
    - 連続保存が多い場合は 5〜10分のデバウンス/合流（Queue）でビルド回数を抑制。

  例: 管理の保存APIでのビルドトリガー

  ```ts
  // app/api/admin/save/route.ts
  import { NextResponse } from "next/server";

  export async function POST(req: Request) {
    // 1) 画像アップロード（R2）
    // 2) Supabase へ商品レコード更新/作成
    // 3) 成功したらビルドフックを非同期で叩く
    const hook = process.env.CF_PAGES_BUILD_HOOK_URL;
    if (hook) {
      // 成功応答を先に返しつつ、裏で実行してもOK
      fetch(hook, { method: "POST" }).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  }
  ```

推奨順序と注意点
- 順序: 「画像アップロード → DB更新コミット → ビルド/再生成トリガー」
- セキュリティ: Hook URL や管理APIはサーバー環境変数に。クライアントから直接叩かせない。
- 冪等性: 同じ保存が連続で来ても多重ビルドを避ける（短時間デバウンス）。
- キャッシュ: 画像差し替えは `?v=<timestamp>` などでキャッシュバスティング。

## リスクと回避策
- 更新遅延（B）: Webhook + 差分ビルド、あるいは C でクリティカル部分のみ動的化。
- 画像破損/404: ビルド時にURLバリデーション。`/placeholder.svg` フォールバックを徹底。
- CORS/認証: Workers 経由し、公開情報のみ返す。キーはサーバ側に限定。
- Build時間増: ページ数少・JSON 1〜3本に集約して高速化。必要に応じ差分生成。

## まとめ
- 目標（速い・安い・安全）に対して、B（Full SSG + 静的JSON）が最短最安。将来の要件で A/C へ段階的に拡張できる構成にするのが得策。
- 公開ページを Astro SSG に置き換える（Option D）ことで、CDN配信の“中身入りHTML”＋必要箇所のみJSの体験が得られる。
- まずは B で公開し、トラフィック/更新頻度/運用感を見ながら最適点へ調整していく方針を推奨します。

---

## 用語ミニ辞典
- CSR（クライアントサイドレンダリング）: ブラウザでJSが動いて中身を作るやり方。
- SSG（静的サイト生成）: ビルド時にHTMLを作っておき、CDNから配るやり方。
- ISR（増分静的再生成）: 静的ページを一定間隔やイベントで作り直して最新化する仕組み。
- CDN: 世界中にある配信サーバから近い場所でファイルを届ける仕組み。速い。
- Webhook: あるイベント（商品を保存など）が起きたら、別のサービスに通知して自動処理を走らせる仕組み。
