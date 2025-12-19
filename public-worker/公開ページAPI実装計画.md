# 公開ページ API 実装計画

作成日: 2025-12-19

目的: 認証不要で公開ページが参照するための API 群を `public-worker` に実装するための実装予定一覧。

優先度の高い API リスト（実装順の提案）:

1. GET /api/public/health
   - 用途: ワーカー稼働確認（簡易なヘルスチェック）
   - 認証: なし
   - キャッシュ: no-cache

2. GET /api/public/products
   - 用途: 公開商品一覧（ページング・検索・フィルタ・fields）
   - クエリ: page, per_page, sort, order, q, fields, include
   - キャッシュ: short TTL（例: max-age=60）

3. GET /api/public/products/:id_or_handle
   - 用途: 商品詳細（公開済みのみ）
   - パス変数: id または handle を許容
   - preview: オプションのプレビュー用トークン対応

4. GET /api/public/collections
   - 用途: コレクション一覧（title/handle/thumbnail 等）
   - クエリ: page, per_page, q, fields

5. GET /api/public/collections/:id_or_handle
   - 用途: コレクション詳細 + 関連商品（ページネーション可能）

6. GET /api/public/recipes
   - 用途: レシピ一覧（ブログ/リソース）

7. GET /api/public/recipes/:id_or_handle
   - 用途: レシピ詳細

8. GET /api/public/search
   - 用途: 横断検索（q=、type=product|collection|recipe）
   - 結果の簡易スコア/ヒット型式を返す

9. GET /images/:key
   - 用途: 画像配信エンドポイント（キーから配信・変換・キャッシュ）
   - パラメータ: w, h, fit, format（変換用クエリ）
   - キャッシュ: 長めに設定しつつ、署名/preview は例外

10. GET /api/public/tags
    - 用途: タグ一覧（名称とカウント）

共通実装要件:
- すべての public エンドポイントは公開済みフラグ (`published`) を確認して公開データのみ返すこと。
- プレビュー用: `?preview=TOKEN` を受け取り検証できる実装を用意（通常リクエストでは未公開データを返さない）。
- 機密データはレスポンスに含めない（例: 仕入先、内部メモ、内部ID、原価の内訳）。
- CORS 設定は運用方針に合わせて `Access-Control-Allow-Origin` を設定（開発は `*`、本番はドメインホワイトリスト推奨）。
- レート制限: IP ベース等で (例: 60 req/min) を導入し、超過時は 429 を返す。
- キャッシュ: CDN キャッシュを前提に `Cache-Control` と `ETag` を付与。プレビューはキャッシュをバイパス。
- エラーフォーマットは統一 `{ code, message, details? }`。

実装フェーズ:
1. ルーティング + ヘルスチェック + images 配信（キー→変換→キャッシュ）
2. `products` 一覧 / 詳細
3. `collections` 一覧 / 詳細（関連商品のページング）
4. `recipes` / `tags` / `search`
5. プレビュートークン検証、レート制限、CORS ポリシー調整

モニタリング / 運用:
- 監査ログ（異常リクエストの記録）、メトリクス（リクエスト数、エラー率、レイテンシ）を組み込む。
- WAF や CDN のルールでボット/悪用対策を実施。

備考:
- OpenAPI スキーマを同時に用意するとフロント実装が楽になります。
- まずは最小限の read-only 機能でローンチし、トラフィックを見ながらキャッシュ/TTL を調整してください。

ファイル: `public-worker/公開ページAPI実装計画.md`
