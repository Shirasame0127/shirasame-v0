# 画像取り扱い方針（key-only 統一）

日付: 2025-12-08

目的:
- プロジェクト全体で画像の取り扱いを厳格に統一します。以後、以下に定めるルール以外で画像を保存・表示・変換してはなりません。これにより運用の安定化、キャッシュ効率の最大化、無料枠内運用を保証します。

重要な構成決定（必須）:
- public-worker を唯一の API 入口（単体完結）とします。admin-site は本番では API を直接処理せず、すべての `/api/*` 呼び出しを public-worker 経由で行います。
- `INTERNAL_API_BASE` や内部プロキシを用いる構成は利用しません。コードやドキュメントに内部プロキシの分岐・チェック・例外を残してはなりません。

このドキュメントは設計の唯一の正解です。例外・暫定措置・将来検討の表現は用いません。

=== 最重要ルール（必須、絶対守ること） ===
1. DB に保存するのは「オリジナルのキー」のみとする。例: `images/2025/12/06/abcd1234.jpg`。
   - フル URL（`https://` で始まるもの）、変換付き URL（`/cdn-cgi/image` を含むもの）、Cloudflare の delivery URL を一切保存してはいけない。
2. 表示時は常にキーから CDN の変換 URL を生成して配信する。例:
   - `https://images.shirasame.com/cdn-cgi/image/width=400,format=auto,quality=75/<key>`
   - DB に変換情報（幅、format、quality 等）を保存しない。
3. 管理画面（admin）でも公開サイトと全く同じ変換バリアントを使う。管理 UI 独自のサイズ指定／バリアント生成は禁止。

=== 必須の画像バリアント（これ以外は作らない） ===
- ヘッダー（大）: 800px (スマホ/PC 共通)
- 商品一覧: スマホ 200px / PC 400px
- 商品詳細: 400px (スマホ/PC 共通)
- 添付画像: スマホ 200px / PC 400px
- ギャラリー: スマホ 200px / PC 400px
- レシピ画像: スマホ 400px / PC 800px
- プロフィールアイコン: 200px
- ローディング GIF: オリジナルのまま（変換しない）
- 他の埋め込み画像: オリジナル（変換しない）

変換パラメータの固定:
- すべての変換は `format=auto` と `quality=75` をデフォルトとして固定する。
- 許可リストにない幅やパラメータは生成禁止。

=== 受け入れ基準（自動検査で確認） ===
1. DB の images / product_images / users.profile_image 等の対象カラムに `http://` や `https://` を含む値が無いこと（すべて key のみ）。
2. アップロード API が返すレスポンスは `key` のみ。例: `{ "key": "images/2025/12/06/abcd1234.jpg" }`。
   - `POST /api/images/complete` は冪等性を持ち、同一 `key` の重複挿入を行わないこと（存在する場合は成功として既存レコードを返す/無視する）。
3. フロント・管理 UI は `responsiveImageForUsage(key, usage)` や `getImageUrl(key, usage)` の共通ヘルパー経由で表示していること。
4. CI に画像ルール違反チェックを追加し、違反があればビルドを失敗させること。
5. Cloudflare 側のカスタムドメイン `https://images.shirasame.com` と Image Resizing 設定が有効であること（検証手順を用意）。
6. 既存データ移行スクリプトがあり、実行前にバックアップを取り、移行後に検証して問題がないこと。

=== 必ず作る成果物（実作業項目） ===
A. ドキュメント `docs/images_handling.md`（本ファイル） — key-only 方針、バリアント、表示ルール、移行手順、検証手順を明記する。
B. アップロード API の修正（サーバ） — アップロード完了時に `key` のみ返す（既存 `url` を返さない）。
C. 表示ヘルパーの整備（共通ライブラリ） — `getImageUrl(key, usage)` / `responsiveImageForUsage(key, usage)` を用意し、usage による幅を固定する。
D. 管理画面の修正 — 管理画面の画像表示をヘルパー経由に統一し、管理者が開いただけで新たなユニーク変換が発生しないようにする。
E. DB 移行スクリプト — `url` から `key` を抽出して `key` カラムに書き換える SQL/スクリプト。実行前に必ずバックアップを取ること。
F. CI テスト追加 — 画像ルール違反（`http(s)://` を含む値、`/cdn-cgi/image` を DB に書くコード）を検出してビルド失敗にするテスト。
G. 監視・アラート設定 — unique transformations の閾値、cf-cache-status の HIT 率などの監視を設定。
H. ロールアウト手順・ロールバック手順の文書化（ステージング→本番）。

=== 実装・移行手順（優先度付き） ===
1. (高) A + B を同時に実施する。
   - `admin-site` と `public-worker` の upload エンドポイントを確認し、レスポンスを `key` のみに変更する。
   - フロントは `key` を受け取り `POST /api/images/complete` で key を保存する（既に存在する場合は migrate 時に変換）。
   - 注意: 署名付き URL を使ったブラウザ直上げは、Cloudflare の挙動により `PUT` ではなく **multipart/form-data の POST** を要求される場合があります。クライアント実装は multipart/form-data POST を優先し、失敗時にサーバ経由の proxy アップロードへフォールバックしてください。
2. (中) ステージングで E（移行スクリプト）を実行して検証する。移行は必ずバックアップ後に行う。
3. (中) C と D を合わせて切り替え（管理 UI の表示を共通ヘルパーにする）。
4. (中) F（CI テスト）を導入して破壊的変更を防止。
5. (低) G（監視）を追加、最終本番デプロイ。
6. (最終) 問題がないことを確認後に `url` カラムを削除（または書き込み禁止にしてから削除）。

=== DB 移行スクリプト（例：Postgres / Supabase 用） ===
事前準備:
1. 本番 DB のバックアップを取得する（Supabase のスナップショットや `pg_dump` を利用）。
2. ステージング環境で試験実行する。

例: `product_images.url` から `key` を抽出して `product_images.key` に書き込む SQL のサンプル
```sql
-- 1) 影響確認（実行前）
SELECT id, url FROM public.product_images WHERE url IS NOT NULL LIMIT 10;

-- 2) images.shirasame.com 配下の URL から key を抽出して書き込む
UPDATE public.product_images
SET key = REGEXP_REPLACE(url, '^https?://images\.shirasame\.com/', '')
WHERE url ~ '^https?://images\.shirasame\.com/';

-- 3) R2 公開サブドメイン (例: https://<account>.r2.cloudflarestorage.com/<bucket>/...) を正規化して key に変換する例
UPDATE public.product_images
SET key = REGEXP_REPLACE(REGEXP_REPLACE(url, '^https?://[^/]+/([^/]+)/(.*)$', '\2'), '^/+', '')
WHERE url ~ '^https?://[^/]+/[^/]+/';

-- 4) /cdn-cgi/image を含む場合（変換付き URL の末尾パスを抽出）
UPDATE public.product_images
SET key = REGEXP_REPLACE(url, '^https?://images\.shirasame\.com/cdn-cgi/image/[^/]*/', '')
WHERE url ~ '^https?://images\.shirasame\.com/cdn-cgi/image/';

-- 5) 最終チェック
SELECT count(*) FILTER (WHERE key IS NULL OR key = '') AS missing_keys FROM public.product_images;
```

注: 以上はテンプレートです。実際の URL パターンに合わせて正規表現を調整してください。

=== バックアップ例（supabase CLI / pg_dump） ===
- `pg_dump` の例（接続情報は安全に扱うこと）:
```bash
PGPASSWORD="$PGPASSWORD" pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -b -v -f backup_before_image_migration.dump
```
- Supabase のバックアップ機能を使える場合はそれを優先してください。

=== CI テストの例（単純な Node スクリプト / grep ベース） ===
- 目的: コード内で直接 `'/cdn-cgi/image'` や `http://` / `https://` を DB に書き込むような新コードを防ぐ。
- 例: `scripts/check-image-rules.js`（擬似）
  - レポジトリ内の SQL/TS/JS/TSX ファイルを走査し、禁止パターンを検出したら非0で終了。
- 単純な grep を CI に入れるだけでも効果あり（例: `git grep -n "cdn-cgi/image\|https://.*images"`）。

=== 表示側（フロント）でのヘルパー利用例 ===
- 既存の `shared/lib/image-usecases.ts` に `getPublicImageUrl`, `buildResizedImageUrl`, `responsiveImageForUsage` があり、これを使うことで表示は `key` のみを受け取り CDN URL を生成できます。
- 例（React）:
```tsx
import { responsiveImageForUsage } from 'shared/lib/image-usecases'

const { src, srcSet } = responsiveImageForUsage(record.image_key, 'list')
return <img src={src} srcSet={srcSet} alt="..." />
```

=== 検証手順（運用担当向け） ===
1. ステージングでアップロードを行い、DB の保存行が `key` のみになっていることを確認。
2. 表示ページを開き、devtools の Network タブで実際のリクエスト URL が `https://images.shirasame.com/cdn-cgi/image/.../<key>` 形式になっていることを確認。
3. `curl -I` で `cf-cache-status` ヘッダを確認し、初回は `MISS`、再リクエストで `HIT` になることを確認する。

=== ロールアウト手順（高レベル） ===
1. ステージング: A, B を適用 → E をステージング DB で実行（バックアップ） → C, D をステージングで切替 → 検証（手順上）。
2. CI に F を追加してマージ継続をブロック。
3. 本番: 本番 DB の完全バックアップ → メンテナンスウィンドウで E（移行）実行 → 本番サービスを切替 → モニタリング（cf-cache-status, errors）。
4. 問題発生時はバックアップを元にロールバック（手順を別途ドキュメント化）。

=== 検証に必要な情報（あなたへのお願い） ===
- 確認 1: この方針で進めて良いですか？（はい / 修正点）
- 確認 2: 配信に使うドメインは `https://images.shirasame.com` で確定して良いですか？
- 確認 3: 既存 DB のバックアップを取得できる DB 管理者アカウント（接続先や手順を教えてください）。

=== 原子的 upsert を有効にするための DB 側作業（必須） ===

`images/complete` エンドポイントはワーカー側で atomic な upsert ロジックを実装しましたが、Postgres の `ON CONFLICT (key)` を有効にするためには、`images.key` に対する一意制約（または一意インデックス）が DB 側に必要です。これが無いと `on_conflict=key` 指定はエラーになります。

手順（安全に実行するための推奨順）:
1. 本番では必ずバックアップを取得してください（`pg_dump` など）。
2. ステージングで以下 SQL を実行して重複とインデックスの適用手順を検証してください。

重複確認（実行前）:
```sql
SELECT key, COUNT(*) AS cnt FROM public.images GROUP BY key HAVING COUNT(*) > 1 ORDER BY cnt DESC LIMIT 100;
```

重複を削除してユニーク化（例: created_at の最も古い行を残す）:
```sql
WITH ranked AS (
   SELECT id, key, ROW_NUMBER() OVER (PARTITION BY key ORDER BY created_at ASC, id ASC) AS rn
   FROM public.images
)
DELETE FROM public.images
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
```

上記で問題なければ一意インデックスを追加します（インデックス作成は瞬間的に失敗する可能性があるためステージングで必ず確認してください）:
```sql
CREATE UNIQUE INDEX IF NOT EXISTS images_key_unique ON public.images (key);
```

代替（テーブル制約）:
```sql
ALTER TABLE public.images ADD CONSTRAINT images_key_unique UNIQUE (key);
```

実行後、ワーカーの `images/complete` へ `POST`（`on_conflict=key` を使った upsert）がエラー無く動作するはずです。

実行手段の例:
- Supabase SQL Editor（Web コンソール）で実行
- `psql` を使ってリモート DB に接続して実行
- `supabase` CLI の `db remote` / `db query` 機能を使う

もし実行を代行して欲しい場合は、実行可能な方法（安全な手順か一時的な管理者キーの提供、もしくは実行ログ付きでのコマンド文の提示）を教えてください。私は SQL 文の適用、検証手順、及び再テスト（upload → complete ×2）まで代行できます。

---
このドキュメントに同意いただければ、次に B（アップロード API の patch 作成）をコミットして PR を作成します。移行用の SQL は、ステージングのサンプルデータを見て最終調整します。