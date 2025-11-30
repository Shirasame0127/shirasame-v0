**Image Distribution & CDN Guide**

目的
- 公開ページ訪問者（SNS 経由など）に対して高速で安定した画像配信を実現するための方針と実装手順をまとめる。

結論（推奨）
- 公開向けアセットはできるだけ静的（事前生成 + CDN 配信）にする。
- 管理画面からのアップロードは継続するが、アップロード時に事前最適化・事前サムネイル生成を行い、R2（または S3）に保管して CDN で配信するワークフローにする。

利点
- 低レイテンシ（エッジ配信）
- オリジン負荷軽減（画像変換をオンデマンドで行わない）
- キャッシュ効率・コスト削減
- 502/再帰的 thumbnail 呼び出しなどの実行時障害を回避

用語
- R2: Cloudflare R2（S3 互換）
- CDN_BASE_URL: 環境変数で設定する CDN のベース URL
- thumbnails: 事前生成したサムネイルを格納するキー（`thumbnails/<hash>-<w>x<h>.jpg`）
- LQIP: Low Quality Image Placeholder。まず小さいサムネイルを表示し、遅れて大きい画像を読み込む戦略

実装ワークフロー（高レベル）
1. 管理 UI から画像/GIF アップロード（既存）
2. サーバ（upload handler）で実行:
   - ファイル種別チェック、サイズチェック
   - 静止画: sharp 等で最適化（AVIF/WebP/JPEG など）
   - GIF: 基本はオリジナルを保持。必要なら MP4/WebM に変換を検討
   - 事前サムネイル生成（例: 40, 100, 400 px）
   - サムネイルは決定論的ハッシュキーで保存（hash = sha256(`${publicSrc}|w=${w}|h=${h}`) 形式）
   - R2 に `thumbnails/<hash>-${w}x${h}.jpg` をアップロード
   - `images` テーブルに `thumbnails` JSON と `thumbnail_keys` を保存
   - サムネイルアップロードは retry/backoff を行い失敗ログを残す
3. CDN（Cloudflare）を `CDN_BASE_URL` に設定して、サムネイル URL を容易に配信できるようにする
   - 例: `${CDN_BASE_URL}/${r2Bucket}/thumbnails/${hash}-400x0.jpg`
4. products API（shallow）では、公開ページ向けに CDN の事前生成サムネイル URL を返す
   - CDN 未設定時は canonical public URL を返す
5. クライアント: LQIP 戦略を実装
   - 初期は 40px サムネイルを表示（高速）
   - IntersectionObserver によってビューポートに入ったら 400px を読み込む
   - `loading="lazy"` を使い、above-the-fold のみ eager にする
6. キャッシュ制御
   - サムネイル: `Cache-Control: public, max-age=31536000, immutable`
   - API / HTML: 短い TTL（例: public, max-age=10）

セキュリティ / 悪用対策
- `ALLOWED_IMAGE_HOSTS` 環境変数で許可ホストを設定し、thumbnail エンドポイントが任意の外部 URL を取得しないようにする
- アップロード時にファイルタイプ・サイズの上限をチェック
- サムネイルエンドポイントでの入力デコード・ネスト解除ロジックに最大深度を設ける

DB について（提案）
- `images` テーブルに次のカラムを用意することを推奨:
  - `thumbnails JSON` : { "40": "https://.../thumbnails/..", "100": "..." }
  - `thumbnail_keys JSON` : { "40": "thumbnails/<key>", ... }

例: マイグレーション SQL（Postgres）

ALTER TABLE images
ADD COLUMN IF NOT EXISTS thumbnails jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS thumbnail_keys jsonb DEFAULT '{}'::jsonb;

（※ 実行前にバックアップを推奨）

クライアント実装ヒント
- `components/product-card.tsx`（一覧）: `image.url` はまず 40px を読み、交差時に 400px に差し替える。
- Next/Image を使う場合: `priority` を above-the-fold のみに設定し、他は `loading="lazy"`。
- モーダル: 開く際はまず shallow 情報で UI を表示し、同時にフルデータを fetch、取得完了で差し替える。
- ローディング GIF: 管理画面でアップロード → CDN に置く形がベスト。公開ページでは CDN URL を参照。

運用運用と CDN の注意点
- 画像差し替えを多用する場合はキー名を変えてバージョン化する戦略を優先（`/thumbnails/<hash>-...` に同じキーで上書きするより、別キーでアップロードして DB を更新した方が CDN キャッシュの問題を避けやすい）。
- CDN パージはコストや API 制約があるので、可能ならキーを変更する戦略を推奨。

テスト / 検証
- 自動テストスクリプト（簡易）を用意すると確認が楽:
  - upload API に対してダミー画像を送信 → DB の thumbnails が埋まるか
  - `/api/products?shallow=true` を叩いて `image.url` が CDN URL になるか
  - 再帰的 thumbnail URL（入れ子）を投げて 403 または正しく正規化されるか

次の実行プラン（推奨順）
1. `images` テーブルに `thumbnails` カラムを追加（マイグレーション）
2. アップロードハンドラを確認し、生成されたサムネイルのキー/URL を DB に確実に格納
3. `CDN_BASE_URL` を設定し、`/api/products` が CDN URL を返すことを確認
4. クライアントを LQIP に更新（small → large）
5. 監視とアラート（thumbnail 500/502）を設定

参考: 既存コードとの整合点
- 既に `upload/route.ts` に事前生成ロジックが存在するため、今回の方針はその上に乗せる形で整合します。
- 重要: `thumbnail/route.ts` に再帰的 URL を展開するガードと `ALLOWED_IMAGE_HOSTS` などのホワイトリストを入れておくこと（既に一部追加済み）。

---

ファイル保存場所
- このドキュメントは `docs/IMAGE_DISTRIBUTION_AND_CDN.md` に保存しました。

必要なら私の方で次のどれかを進めます:
- `images` テーブルのマイグレーション SQL を実行用に準備する
- クライアント（`page.tsx` / `product-card` 等）の LQIP 実装パッチを作る
- 開発環境で `CDN_BASE_URL` を模擬して end-to-end テストを行う

ご希望を教えてください。