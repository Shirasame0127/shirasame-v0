# 管理ページデプロイ手順（v0-samehome）

このドキュメントは、公開フロントの表示検証を進めるために「管理ページを先に用意してデータを増やす」方針で、最短で稼働させるための手順をまとめたものです。

結論（短く）
- まず管理ページをデプロイして、商品・画像・タグなどのデータを増やすのが効率的です。
- フロントは「SSG + CSR」で API から取得する構成のため、管理側でのデータ投入・画像アップロードがフロント検証の近道になります。

## 前提と構成
- 管理: `v0-samehome`（Next.js App Router）。
- データ: Supabase（DB・認証）、画像は Cloudflare R2（`thumb-400`/`detail-800` 生成運用を踏襲）。
- API: 現状は同一アプリから提供。将来的には Public Worker に分離（今は既存 API を利用）。
- フロント公開側は「SSG を維持 + CSR で Fetch」。管理での変更が反映されることを前提に検証します。

## デプロイ対象とモード
- デプロイ先の選択肢（どれでも可、まず動かす観点では Pages/Vercel いずれも現実的）
  - Cloudflare Pages（Functions 有効）
  - Vercel（Next 16 対応。環境変数の管理が容易）
- 今回は分かりやすさ重視で「Vercel」手順と「Cloudflare Pages」手順の両方を記載します（どちらか一方を選択）。

## 必要な環境変数（管理）
- Supabase（管理でサーバ側取得を行う場合は Service Role をサーバ環境変数に）
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`（クライアントへ露出しない）
- 画像/R2（公開 URL。アップロード処理の出力先と照合）
  - `R2_PUBLIC_URL` または `NEXT_PUBLIC_R2_PUBLIC_URL`
  - 任意: `R2_BUCKET`（キーの正規化に使用する場合）
- 認証/管理用（必要に応じて）
  - `DISABLE_AUTH`（開発簡易向け。true でログイン無効化。検証用のみ）
- 公開 API 基底 URL（管理からの確認・フロントの連携チェック用）
  - `NEXT_PUBLIC_API_BASE_URL`

注記
- クライアント側で使うキーは `NEXT_PUBLIC_*`。秘匿性が必要なキーはサーバ側環境変数へ。
- `.env.local` は開発用。デプロイ環境の変数はプロバイダ（Vercel/Pages）のダッシュボードで設定。

## Vercel デプロイ手順（簡易）
1. リポジトリを Vercel に接続（プロジェクト作成）。
2. ルートパスを `v0-samehome` に設定（Monorepo の場合）。
3. Build / Output 設定
  - Build Command: `pnpm install && pnpm build`
  - Output: `.next`
4. 環境変数を設定（前述の項目を Production/Preview に登録）。
5. デプロイ実行。完了後に管理 URL（例: `https://samehome-admin.vercel.app`）を取得。

## Cloudflare Pages デプロイ手順（簡易）
1. Pages で新規プロジェクトを作成し、GitHub リポジトリを接続。
2. Build 設定
  - Build command: `pnpm install && pnpm build`
  - Build output directory: `.next`
  - Functions: 有効（App Router / Route Handlers を使う場合）
3. 環境変数を設定（Production/Preview）。
4. デプロイ実行。管理 URL（例: `https://samehome-admin.pages.dev`）を取得。

## ローカル確認（開発）
```powershell
Push-Location "c:\Users\<あなたのユーザ>\Documents\shirasameProject\v0-samehome"
pnpm install
pnpm dev
```
- ブラウザで管理ページを開き、ログイン（または `DISABLE_AUTH=true` の簡易動作）で管理 UI に入る。

## 最小データ投入フロー（検証向け）
- 目的: フロントで一覧サムネ・詳細モーダル・タグ/検索の動作確認を行える最低限のデータを追加。
- ステップ:
 1) 商品を追加（タイトル / スラッグ / 説明 / 価格は任意）
 2) メイン画像をアップロード（R2 へ保存）。保存時に `thumb-400` / `detail-800` を生成する既存運用に従う（生成済みが確実であれば、フロントで variant を優先可能）。
 3) 添付画像（最大4枚目安）を追加（モーダルの添付表示を確認）。
 4) タグを追加（「Amazon」「公式サイト」など）。
 5) 必要ならコレクションへ商品を紐づけ、プロフィール・レシピも 1 件ずつ用意。
- 反映確認（フロント）:
  - フロント `public-site` で `pnpm build && pnpm start` または dev 起動後、`/products` などへの `fetch` が成功し、サムネが表示されるか確認。
  - 画像 404 の場合は、variant 未生成か URL 正規化の問題。`getPublicImageUrl` で正規化された公開 URL を優先する（既にフロント側修正済み）。

## 運用上の注意
- 画像: なるべく事前生成（`thumb-400` / `detail-800`）を用意する。未生成時はフロントが公開 URL を優先して表示するが、最適品質/ファイルサイズには variant 生成が望ましい。
- キャッシュ/反映: フロントは CSR でデータ取得するため、管理で保存後は API のキャッシュTTL/ETag に依存して反映。必要なら短 TTL or 管理側からキャッシュ無効化の仕組みを用意。
- 秘匿キー: `SUPABASE_SERVICE_ROLE_KEY` などはサーバ環境変数。クライアントに露出させない。

## トラブルシューティング（簡易）
- フロントのサムネが表示されない
  - 公開 URL（R2 の `pub-...` ドメイン）へ直接 HEAD/GET して 200 を確認。
  - `basePath` に対する `thumb-400.jpg` が未生成なら、管理側の生成処理を確認（保存 API の処理・バッチの実行）。
- API 取得が失敗する
  - `NEXT_PUBLIC_API_BASE_URL` の値を確認。CORS 設定（Workers 側）で管理・フロントのオリジンが許可されているかを確認。
## 推奨デプロイ先（無料・商用可）
- 結論: 管理は「Cloudflare Pages Free」を推奨（商用可・無料枠広め）。
- 理由: ビルド上限 500/月・Functions は Workers Free の枠内で十分／運用がシンプル。
- 代替: Vercel でも運用可能（Hobby での商用利用規定は最新規約を都度確認）。
 - 実務メモ: モノレポでは `Root Directory` を `v0-samehome` に設定。

---

## レシピ機能: 仕様・要件と Cloudflare Pages 適合性

概要: `v0-samehome` の管理 UI には「レシピ表示/編集」「画像クロップ」「ピン配置／ピンスタイル設定」などが実装されています。

- 主な UI 要素（管理画面）:
  - 画像アップロード / 画像クロップ（`ImageCropper`）
  - ピン編集パネル（タブ: スタイル / フォント / ピン設定）
  - ピンのドラッグで位置（X/Y %）設定、点サイズ/フォントサイズは画像幅に対するパーセントで保存
  - 商品の紐付け（ピン → productId）、複数商品選択補助、タグ表示文字列

- ピン（DB）で保存される代表的なプロパティ（抜粋）:
  - id, recipe_id, product_id, user_id
  - dotXPercent, dotYPercent, tagXPercent, tagYPercent
  - dotSizePercent, tagFontSizePercent, lineWidthPercent
  - tagPaddingXPercent, tagPaddingYPercent, tagBorderRadiusPercent, tagBorderWidthPercent
  - dotColor, dotShape, tagText, tagFontFamily, tagFontWeight, tagTextColor
  - tagBackgroundColor, tagBackgroundOpacity, tagShadowColor, tagShadowBlur, tagShadowDistance, tagShadowAngle
  - tagTextStrokeColor, tagTextStrokeWidth, tagTextAlign, tagVerticalWriting, tagLetterSpacing, tagLineHeight

- 管理 API の実装上ポイント:
  - 管理側 API（例: `POST /api/admin/recipe-pins`）はサーバ側で Supabase の Service Role Key を使って DB を更新します（`supabaseAdmin` 経由）。
  - 画像保存は R2（または Supabase Storage）へ行い、R2 の公開 URL または `basePath` を DB に保持します。
  - フロントでは位置はパーセントで保存、表示時にピクセル換算して描画するためレスポンシブに一致します（既存コード参照）。

- Cloudflare Pages（Functions）での実現性・留意点
  - 結論: 実現可能。ただし設定と検証が必要。
  - 理由: 管理は Next.js App Router + Route Handlers（app/api/**）を利用しており、Cloudflare Pages は Functions を有効化して Worker ランタイムで Next の Route Handlers を動かす形で対応できます。
  - 必須構成（Pages 側）:
    - Functions を有効化しておく（Pages の Build 設定で Functions を使用）
    - R2 バインディングを追加（画像への読み書き/公開 URL の紐付けに必要）
    - Secret / Environment に `SUPABASE_SERVICE_ROLE_KEY`（サーバ用）、`R2_PUBLIC_URL`/`R2_BUCKET`、`NEXT_PUBLIC_API_BASE_URL` を登録
  - 大きなファイルアップロードの取り扱い:
    - Pages/Workers にはリクエストサイズや実行制限があるため、管理画面から大きな画像を直接サーバ経由で POST するより、ブラウザから R2 へ直接アップロード（署名付き URL）するワークフローを推奨します。
    - 既存実装がサーバ経由の multipart upload を期待する場合は、動作確認と必要ならアップロード経路の修正（direct-to-R2）を行ってください。
  - 互換性チェックリスト（デプロイ前に必須検証）:
    1. `app/api/*` の Route Handlers が Worker ランタイムでビルド・動作するか（ビルドエラー/ランタイムエラーの検証）
    2. `supabaseAdmin`（Service Role 使用）の動作（Secrets の読み取りと DB 書込）
    3. 画像アップロード経路（ブラウザ→R2 署名付きURL か Pages Functions 経由か）の確認
    4. 期待するリクエストサイズ/タイムアウトが Pages の無料枠で問題ないかの検証
  - もし素早い「ほぼ確実に動く」運用を優先するなら Vercel を選ぶと手間が少ない（Next.js のサポートが最も自然）。Cloudflare Pages を選ぶ場合は上記チェックを確実に実行してください。

短い推奨ワークフロー（Cloudflare Pages を使う場合）:
1) Pages プロジェクト作成 → `v0-samehome` を `Root Directory` に指定
2) Functions 有効化、R2 バインディングを追加、Secrets 登録（`SUPABASE_SERVICE_ROLE_KEY`, `R2_PUBLIC_URL`, `R2_BUCKET`, `NEXT_PUBLIC_API_BASE_URL`）
3) まず `POST /api/admin/recipe-pins` のエンドポイントだけを検証（DB 書込の確認）
4) 画像アップロードは署名付き URL の実装で直接 R2 に書き込ませる（既存のサーバ経由が問題なければそのままでも検証可）


## まとめ
- データを増やしてフロントの表示を検証したいなら、管理ページを先にデプロイするのが最短です。
- 本ドキュメントの手順に従い、管理をデプロイ → 最小データ投入 → フロントで表示確認、の流れで進めてください。

## 管理機能一覧（フル）
以下は `v0-samehome` に実装されている、管理画面で扱う主要な機能の一覧です。デプロイ前に必要なエンドポイントと UI 要素を確認してください。
- 商品管理: CRUD（タイトル、説明、価格、SKU、在庫、公開フラグ）
- 画像管理: 画像アップロード、クロップ、サムネイル生成、原寸管理（R2/Supabase Storage を想定）
- コレクション: 複数商品のグルーピング、順序管理
- タグ管理: タグ作成・グループ化・割当
- レシピ管理: レシピ作成/編集、画像へのピン配置、ピンのスタイル設定（位置は % 保存）、ピンと商品紐付け
- レシピピン編集: ドラッグでの位置決め、フォント/サイズ/形状/影/枠線等の詳細スタイル設定
- ユーザ/プロフィール管理: 公開プロフィールの設定、表示順序
- サイト設定: 表示文言、SNSリンク、配信設定等の静的設定
- Amazon 連携（スケジュール/セール情報表示）: スケジュール管理 UI
- 監査ログ（軽量）: 主要操作の最小ログ（保存は DB）

## 必要な環境変数（完全リスト・参考）
これはアプリが期待する主要 env のフルリスト（デプロイ時に必須または強く推奨されるもの）です。実際の運用では Secrets 管理画面へ登録してください。
- `SUPABASE_URL` — Supabase の URL
- `SUPABASE_ANON_KEY` — クライアント用（公開可能）
- `SUPABASE_SERVICE_ROLE_KEY` — サーバ用（絶対に公開しない）
- `NEXT_PUBLIC_API_BASE_URL` — 公開 API のベース URL（Workers や Pages の Root）
- `NEXT_PUBLIC_R2_PUBLIC_URL` または `R2_PUBLIC_URL` — R2 の公開ベース URL
- `R2_BUCKET` — R2 バケット名（必要な場合）
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare 各種操作で必要な場合
- `CLOUDFLARE_API_TOKEN` — Pages / R2 管理用（CI や外部運用で使用する場合）
- `DISABLE_AUTH` — 開発時の簡易フラグ（true で auth をバイパス、検証用のみ）
- `NEXTAUTH_URL` / `NEXTAUTH_SECRET` — NextAuth 等を使う場合の設定
- `MAILER_DSN` — 管理通知メール送信に使用する場合

## ランタイム制約と互換性注意点（Cloudflare Pages を想定）
- `sharp` のようなネイティブモジュールは Pages Functions（Workers）でビルド/実行できない可能性があります。ネイティブ依存がある場合は次のいずれかを検討してください:
  - 画像処理をブラウザ側（簡易圧縮）＋署名付き PUT（直接 R2）へ切り替える
  - 画像処理を別の Node サービス（小さな VPS / Cloud Run）で行い、結果を R2 に保存する
  - Cloudflare Images / Image Upload API に移行して変換を CDN 側へ任せる
- リクエストサイズ / タイムアウト: Pages の Functions にはリクエストサイズと実行時間制限があります。大きな multipart POST は避け、直接署名付き PUT を推奨します。

## 推奨配信方式（結論）
- 推奨 (A): **Cloudflare Pages + R2 (direct-to-R2 signed PUT) + Supabase**（推奨理由: 最小運用コスト、Pages の統合、R2 の低コストストレージ）。
  - 画像はブラウザで圧縮（非 GIF）して署名付き PUT で直接 R2 に保存。保存完了後に `/api/images/complete` のような軽量エンドポイントへメタデータを登録。
  - サムネイルは可能ならオフラインバッチまたは別 Worker で生成（Pages 上で sharp が動かない場合の回避策）。
- 代替 (B): **Cloudflare Images（Image Delivery）** — 変換を完全に CDN に任せたい場合。変換コストは発生するが、配信・変換の運用が簡便。
- 高制御 (C): **Node サービス（VPS / Cloud Run）で server-side sharp 生成 + R2 保存** — `sharp` 等ネイティブ依存を残したい場合。運用コストは中〜高。

---

上記の更新内容を反映しました。必要なら私の方で `ADMIN_DEPLOY.md` に続けて「デプロイチェックリスト」や `pages` 用の R2 バインディング手順（スクリーンショット付き）を作成します。どちらを優先しますか？