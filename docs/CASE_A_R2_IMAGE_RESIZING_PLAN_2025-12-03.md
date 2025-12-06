# 最終設計書: CASE A — R2 オリジナル保存 + Cloudflare Image Resizing（オンデマンド）

この文書は本プロジェクトの画像設計の最終確定版である。以後、ここに記載した内容のみが正とする。

## 1. プロジェクト概要
- 目的: 画像は Cloudflare R2 に原本のみ保存し、配信は Cloudflare Image Resizing（`/cdn-cgi/image`）によるオンデマンド変換で行う。
- 方針: DB（Supabase）には「R2 のオリジナルキー（パス）のみ」を保存し、ドメインや変換パラメータ（`/cdn-cgi/image`）は保存しない。
- 配信: カスタムドメイン `https://images.shirasame.com` を Cloudflare プロキシ（オレンジ雲 ON）で公開し、その配下で `width=<200|400|800>,format=auto,quality=75` のルールで変換配信する。

## 2. 採用技術スタック（Cloudflare / R2 / Supabase / Pages / Workers）
- Cloudflare R2: 画像原本ストレージ。S3互換。鍵/バケット単位で管理。
- Cloudflare Workers: API 実装（Hono）。画像アップロードの受付、R2 への保存（key を生成）、DBへの key 保存、presigner の返却などを担う。
- Cloudflare Pages: 公開/管理ページのホスト。フロントは key を元に最終URLを生成し表示。
- Cloudflare Image Resizing: `https://images.shirasame.com/cdn-cgi/image/...` によるオンデマンド変換・エッジキャッシュ。
- Supabase（Postgres）: 画像メタの保存（key と最小限の metadata）。配信レイヤー情報は一切持たない。

## 3. 画像設計の絶対ルール（key-only 方針）
- DB に保存する画像情報は「R2 のオリジナルキー（パス）のみ」とする。
- 例: `images/2025/12/06/abcd1234.jpg`
- 許可しない形式:
  - フルURL（`https://...`）
  - `/cdn-cgi/image` を含むURL
  - R2 の生ホスト（例: アカウント直下の公開サブドメイン）の直接保存
  - `thumb-400.jpg` 等の派生ファイル名（用途・サイズを含む命名）
  - サイズ・用途を含むパス（例: `images/detail/800/...`）
- 以上はすべて禁止する。

## 4. R2 の保存形式と命名規約
- R2 には原本のみ保存する。
- キー（パス）の形式を以下に固定する。
  - `images/YYYY/MM/DD/<random>-<filename.ext>`
  - 例: `images/2025/12/06/abcd1234-filename.jpg`
- 拡張子はオリジナルを保持する。
- 用途・サイズをキーに含めない。派生サムネイルは作らない（事前生成禁止）。

## 5. Supabase のテーブル設計（画像関連カラム）
- 共通原則: 画像の「key（パス）」のみを保存する。配信レイヤーの情報（ドメイン、`/cdn-cgi/image`、品質、形式）は保存しない。
- テーブル例:
  - `images`（グローバル画像メタ）
    - `id uuid` — 主キー
    - `key text NOT NULL` — 例: `images/2025/12/06/abcd1234.jpg`
    - `width int`（任意）— 原本の寸法を保存したい場合のみ
    - `height int`（任意）
    - `metadata jsonb`（任意）— `{ source: "r2", contentType: "image/jpeg", size: 123456 }`
    - `user_id uuid`（任意）
  - `product_images`
    - `id uuid` — 主キー
    - `product_id uuid` — 外部キー
    - `key text NOT NULL`
    - `width int` / `height int`（任意）
    - `role text`（任意）
  - `users`
    - `profile_image_key text` — キーのみ
    - `header_image_keys jsonb` — キー配列のみ（URL混在禁止）
- 非推奨/廃止:
  - `url text` カラム（フルURL保存）を廃止する。移行期間は読み取りのみ許可し、書き込み禁止。

## 6. 環境変数一覧と用途
- `NEXT_PUBLIC_IMAGES_DOMAIN=https://images.shirasame.com` — フロントの配信ベースドメイン。
- `IMAGES_DOMAIN=https://images.shirasame.com` — Worker の配信ベースドメイン。
- `R2_BUCKET=images` — R2 のバケット名。
- `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` — R2 書き込み用資格情報（Worker 側）。
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — Supabase 接続。
- R2 の生ホスト（アカウント直下のサブドメイン等）は生成時・保存時に直接使わない（常に `images.shirasame.com` 経由で扱う）。

## 7. 画像アップロードの完全な流れ（管理画面 → API → R2 → DB）
1. 管理画面は画像ファイルを `/api/images/upload`（Worker）へ送信する。
2. Worker はキーを `images/YYYY/MM/DD/<random>-<filename.ext>` 形式で生成し、原本を R2 に保存する。
3. Worker は DB（Supabase）へ `key` と最小限の `metadata` を保存する（必要テーブルへ）。
4. Worker はクライアントへ `key` を返却する。
5. 管理画面は受け取った `key` を対象テーブルの該当カラム（例: `profile_image_key` / `product_images.key`）に保存する。
6. この流れの中でフルURLや `/cdn-cgi/image` を DB に保存しない。

## 8. 画像配信URLの生成ルール

## 9. 各表示用途ごとのサイズ仕様（完全固定）
- 他の公開ページ埋め込み: オリジナル配信（変換なし）

- 用途/サイズをパスに含める命名規則を使う。
 Invoke-WebRequest -Method Head "https://images.shirasame.com/uploads/<key>.jpg" -UseBasicParsing | Select-Object StatusCode,Headers
 curl -I "https://images.shirasame.com/cdn-cgi/image/width=400,format=auto/uploads/<key>.jpg"
- 変換・品質・ドメイン・キャッシュ戦略はアプリ外部（Cloudflare側）で管理すべき情報であり、DBに混入すると変更時に全レコード再書換えが必要になる。
- Cloudflare Image Resizing とエッジキャッシュは「Cloudflareプロキシ配下のカスタムドメイン + `/cdn-cgi/image`」でのみ正しく機能する。R2生ホストのURLは対象外。
- 無料枠（ユニーク変換数）最適化には代表幅スナップが必須であり、これをDBではなく生成ロジック側で一元管理する必要がある。
- DBを「不変キーの保管」に限定することで、環境変数やヘルパの更新だけで配信ポリシーを全体切替できる。

## 12. 将来拡張・ドメイン変更・品質変更に耐える理由
- ドメイン変更（例: `images` → `assets`）時も DB は変更不要。環境変数の更新と再デプロイだけで切替可能。
- 品質変更（例: `quality=75` → `80`）や代表幅変更も、ヘルパの定数更新だけで切替可能。DBの再書換えは不要。
- 別CDNや別リージョンへの移行も、キーが不変なら配信層の切替だけで対応可能。

## 13. 初心者向けの一発理解セクション（たとえ話）
- 画像の「倉庫の棚番号」が `key` である。DBには棚番号だけを書く。
- お客様に届ける「表札（URL）」や「梱包サイズ（変換）」は配達員（Cloudflare）が決める。配達ルールは変えても棚番号は変えない。
- もし棚番号ではなく表札や梱包サイズをDBに書いてしまうと、配達ルールを変えるたびに全伝票の書換えが必要になる。だから key だけを書くのが唯一の正解である。

---

## 実装影響（確定事項）
- 管理ページ: アップロード後は `key` のみを保存する。`header_image_keys`/`profile_image_key` はキー配列/キーのみ。
- 公開ページ: 画像表示は `key` を受け取り、`https://images.shirasame.com/cdn-cgi/image/width=<snap>,format=auto,quality=75/<key>` を生成して使用する。
- API（Worker）: presigner/アップロードAPIは `key` を返却し、必要なら内部でのみ `publicUrl` を用いる。DB保存は `key` かつ `metadata` のみ。
- Supabase スキーマ: `url` カラムの廃止（移行）。`key` を必須にする。
- 型定義: 画像関連は `key: string` を必須。`url` は非推奨/削除。
- 古い記述の削除: URL保存前提、`/cdn-cgi/image`保存、R2直URL保存、事前生成サムネイル前提をすべて廃止する。

### 管理ページ（admin）に関する追加ルール
- **管理ページは公開ページと同一の ImageUsage を利用すること。**
  - 管理 UI で画像を表示するときも `responsiveImageForUsage(image.key, usage)` を使い、公開ページとまったく同じ用途定義（`list`, `detail`, `header-large`, `gallery`, `recipe`, `avatar`, `attachment`, `original` 等）を使ってください。
  - 管理側で独自の `width` / `variant` / デフォルト幅を持たせないこと。管理専用の ImageUsage を新設することは禁止します。
- **管理 UI で固定幅（例: `width: 400`）を DB に保存してはならない。**
  - 管理画面で画像メタを保存する際、表示目的のサイズ指定は DB に入れず、用途名（usecase）経由で配信時に決めること。
  - これにより管理画面の閲覧だけで新たなユニーク変換が生まれず、R2 + Image Resizing のキャッシュ効率が最大化されます。

---

## 既存データ修正の考え方（例）
1. 影響範囲の把握: `url` を持つテーブル（`product_images`, `images`, `users.profile_image` など）を列挙。
2. `url` から `key` を抽出する正規化ロジック:
  - `https://images.shirasame.com/<key>` → `<key>`
  - R2 の公開サブドメインや変換付き URL（例: 生ホストのサブドメイン、`/cdn-cgi/image/...` を含むURL）からも同様に `<key>` を抽出し、必要に応じてバケット接頭辞を除去する。
3. `key` が抽出できた行に対して、`key` カラムへ保存し、`url` を NULL にする（あるいは列廃止）。
4. UI/コードは `key` を前提に動かす（この設計書準拠）。

### SQL の考え方（例）
> 実行前に必ずバックアップを取得すること。

```sql
-- product_images.url から key を抽出して product_images.key に書き込む例（代表パターン）
-- 1) images.shirasame.com 配下
UPDATE public.product_images
SET key = REGEXP_REPLACE(url, '^https?://images\.shirasame\.com/', '')
WHERE url ~ '^https?://images\.shirasame\.com/';

-- 2) R2 の公開サブドメイン（bucket接頭辞除去）
UPDATE public.product_images
SET key = REGEXP_REPLACE(REGEXP_REPLACE(url, '^https?://[^/]+/([^/]+)/', ''), '^/+', '')
WHERE url ~ '^https?://[^/]+/';

-- 4) /cdn-cgi/image を含む場合（末尾の /<key> 部分のみ抽出）
UPDATE public.product_images
SET key = REGEXP_REPLACE(url, '^https?://images\.shirasame\.com/cdn-cgi/image/[^/]*/', '')
WHERE url ~ '^https?://images\.shirasame\.com/cdn-cgi/image/';

-- 5) url を廃止（移行フェーズの終盤）
UPDATE public.product_images SET url = NULL WHERE key IS NOT NULL;
```

同様の置換を `images` テーブル、`users.profile_image`（→ `profile_image_key`）等へ適用する。正規化は段階的に進め、アプリ側を key-only に切り替えた後、`url` カラムは削除する。

---

## 付記: Cloudflare 設定の絶対条件
- `images.shirasame.com` は Cloudflare DNS で R2 の公開サブドメイン（アカウント固有の公開サブドメイン）へ CNAME を張り、Proxy=ON（オレンジ雲）を必ず有効化する。
- Pages/Workers の環境変数 `NEXT_PUBLIC_IMAGES_DOMAIN` / `IMAGES_DOMAIN` を必ず `https://images.shirasame.com` に設定する。
- 本番配信は常に `images.shirasame.com` 配下で行い、R2生ホストのURLは使わない。

---
title: ケースA — R2 (オリジナル保存) + Cloudflare Image Resizing 運用ドキュメント
date: 2025-12-03
---

## 概要
このドキュメントは「ケース A：R2 にオリジナルのみ保存し、Cloudflare Image Resizing によるオンデマンド変換を使う」運用を正式にまとめたものです。
今後の実装・検証・監視はこのドキュメントを中心に進めます。

対象: v0-samehome プロジェクトの画像配信ワークフロー

目的:
- コスト最小化（R2 の無料枠 + Image Resizing 無料変換枠内運用）
- 表示速度の確保（Edge キャッシュ活用）
- 運用手順と検証方法の標準化

---

## 主要前提（本ドキュメントの想定）
- 月間 PV: **8,000**
- 最大登録商品: **500 件**
- 1 商品あたり平均画像数: **3.1 枚（70% が4枚、30% が1枚）**
- 合計保存画像数: **1,550 枚**
- 画像 variants: 『- ヘッダー画像（大）: スマホ 800px / PC 800px（結果的に 800px のみ）
- 商品画像（一覧表示）: スマホ 200px / PC 400px
- 商品画像（詳細表示）: スマホ 400px / PC 400px（400px のみ）
- 添付画像（商品添付）: スマホ 200px / PC 400px
- ギャラリー表示（商品画像＋添付混合）: スマホ 200px / PC 400px
- レシピ画像: スマホ 400px / PC 800px
- プロフィールアイコン: スマホ 200px / PC 200px（200px のみ）
- ローディングアニメーション用 GIF: オリジナルのまま（変換しない）
- 他の公開ページに埋め込みの画像: オリジナルのまま』
- オリジナル平均サイズ: **600 KB**

これらの前提では:
- R2 保存容量 ≒ **0.93 GB**（無料枠 10 GB に収まる）
- unique transformations = **1,550 * 3 = 4,650**（Cloudflare Images の無料 5,000 に収まる）

---

## 画像バリアント（本運用で確定）
以下のバリアント幅を正式に採用します。これにより変換パラメータを固定し、ユニーク変換数の増加を抑えます。

- ヘッダー画像（大）: スマホ 800px / PC 800px（結果的に 800px のみ）
- 商品画像（一覧表示）: スマホ 200px / PC 400px
- 商品画像（詳細表示）: スマホ 400px / PC 400px（400px のみ）
- 添付画像（商品添付）: スマホ 200px / PC 400px
- ギャラリー表示（商品画像＋添付混合）: スマホ 200px / PC 400px
- レシピ画像: スマホ 400px / PC 800px
- プロフィールアイコン: スマホ 200px / PC 200px（200px のみ）
- ローディングアニメーション用 GIF: オリジナルのまま（変換しない）
- 他の公開ページに埋め込みの画像: オリジナルのまま

注: 実運用では `format=auto` と `quality` を併用します。実際に参照される幅は `200/400/800` に集約されるため、unique transformations は抑制されます。


## アーキテクチャ（要点）
1. クライアントは画像アップロードを `direct-upload` API 経由で R2 へ直接 PUT（presigned URL）する。
2. presigner はアップロード用の `uploadURL` に加え、オブジェクトの `publicUrl`（R2 の公開サブドメイン + オブジェクトキー）を返す。
3. 公開側（public-site）では、表示時に `publicUrl` を直接参照し、Image Resizing パラメータを URL 経由で付与して配信する。
   - 例: `https://<r2-subdomain>/cdn-cgi/image/width=400,format=auto/uploads/xxxxx.jpg`
4. Cloudflare エッジはオンデマンドで変換し、変換結果をエッジにキャッシュする（2 回目以降は高速）。

利点:
- サーバで `sharp` を常時動かす必要がなく Pages/Workers 上で軽量に運用できる。
- 変換ユニーク数が無料枠内であれば変換課金が発生しない。

---

## 実装ステップ（低リスク順・推奨）
1. presigner のレスポンスに `publicUrl` を追加する（サーバ側小変更）。
   - 目的: アップロード直後の即時プレビューや、クライアントで Image Resizing URL を素早く生成するため。
2. フロントエンド（`components/image-upload.tsx` など）を更新して `publicUrl` を優先して表示・参照する。
3. Image Resizing の代表的パラメータセットを決定する（例: `width=200,400,800; format=auto; quality=75`）。
4. Cloudflare ダッシュボードで Image Resizing を有効化し、必要なルール（サブドメイン、CORS、Cache Settings）を設定する。
5. 代表サンプル画像で HEAD/curl チェックを実行し `cf-cache-status`（MISS→HIT）とレスポンスタイムを確認する。
6. 1 週間のトラフィックで `Storage`、`Class A/B`、`unique transformations` を監視する。

---

## URL とサンプル（テンプレート）
- presigned upload の `publicUrl`（例）:
  - `https://images.shirasame.com/uploads/20251203-<id>.jpg`
- Image Resizing（例）:
  - 幅 400 の自動フォーマット: `https://images.shirasame.com/cdn-cgi/image/width=400,format=auto/uploads/20251203-<id>.jpg`
  - 幅 200（モバイル）: `https://.../cdn-cgi/image/width=200,format=auto/uploads/...` 

注: 実際のサブドメインとパスはアカウントの R2 サブドメイン設定に依存します。上記はテンプレートです。

---

## 検証手順（初心者向け・短い）
1. サンプル画像の HEAD チェック（PowerShell）:
```powershell
Invoke-WebRequest -Method Head "https://images.shirasame.com/uploads/<key>.jpg" -UseBasicParsing | Select-Object StatusCode,Headers
```
2. Image Resizing を使った HEAD（cf-cache-status を確認）:
```bash
curl -I "https://images.shirasame.com/cdn-cgi/image/width=400,format=auto/uploads/<key>.jpg"
# ヘッダ内 `cf-cache-status: MISS`（初回） → 再度実行で `HIT` になることを確認
```
3. 初回レスポンスタイムと 2 回目以降（HIT）の差を記録する（数値で比較する）。

---

## 監視・アラート（必須項目）
- Cloudflare ダッシュボード: `R2 Storage` 使用量（GB‑month）
- Cloudflare ダッシュボード: `Class A / Class B` 操作数（無料枠超過の監視）
- Cloudflare Images / Resizing: `unique transformations`（月間）
- アプリレベル: `cf-cache-status` のヒット率（目標: 80% 以上）
- しきい値アラート例:
  - Storage > 8 GB → アラート
  - Class B > 8,000,000 / 月 → アラート
  - unique transforms > 4,500 / 月 → ウォッチ（5,000 に近づいたら通知）

---

## 運用上のベストプラクティス（短期〜中期）
- 変換パラメータは出来るだけ固定し、ユニーク数を抑える。
- 人気コンテンツ（上位 10–20%）は事前生成して R2 に保存する（ハイブリッド）。
- 画像の `Cache-Control` を長め（例: 30 日）に設定し、更新時はバージョン（クエリ or ファイル名）で差し替える。
- 大量の一時処理やバッチ（sharp 等）が必要になったら、夜間バッチで R2 に variants を pre-generate する。

---

## フォールバック（トラブル時）
- もし Image Resizing のユニーク変換が想定を超えて課金される場合:
  1. 変換パラメータを減らす（例: 200/800 のみにする）。
  2. 人気画像を事前生成して R2 に保存する。 
  3. 必要なら Cloudflare Images の利用を検討（管理機能・品質面で有利）。

---

## 変更履歴
- 2025-12-03: 初版作成（ケース A の正式ドキュメント）

---

## 次のアクション（短期）
1. presigner に `publicUrl` を追加してデプロイ（軽微パッチ）。
2. フロントで `publicUrl` を優先する変更を実装。PR を作成してください。
3. Cloudflare 側で Image Resizing を有効化し、代表サンプルで検証を開始。
