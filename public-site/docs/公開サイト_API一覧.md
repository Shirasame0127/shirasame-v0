# 公開サイト API 一覧

このファイルは `public-site` から呼び出される API の一覧と簡単な説明です。
すべての呼び出しは `/api/public` 名前空間経由で行われます（`public-site/lib/api-client.ts` にて強制）。

- `/products`
  - 用途: 商品一覧取得および個別取得（ページネーション対応）。
  - 例: `/products?published=true&shallow=true&limit=24&offset=0`、`/products?id=<id>`。
  - 返却: `{ data: [...], meta?: { total, ... } }`（商品オブジェクトは snake_case の場合あり）。

- `/collections`
  - 用途: コレクション（カテゴリ）一覧取得。メニューやコレクションページで使用。
  - 返却: `{ data: [...] }`（コレクションに products を含む場合あり）。

- `/recipes`
  - 用途: レシピ一覧取得（レシピ表示コンポーネントで使用）。
  - 返却: `{ data: [...] }`。

- `/profile`
  - 用途: 公開プロフィール／サイトオーナー情報取得（ヘッダーやプロフィール表示に使用）。
  - 返却: `{ data: { displayName, bio, profileImage, headerImageKeys, socialLinks, ... } }`。
  - 備考: `site-settings` とマージして表示するロジックあり。

- `/site-settings`
  - 用途: サイト全体の設定取得（サイト名、デフォルトヘッダー画像、読み込みアニメなど）。
  - 返却: `{ data: { key: value, ... } }`（値が JSON 文字列で返される場合あり）。

- `/amazon-sale-schedules`
  - 用途: Amazon セールスケジュール取得（セール中商品のハイライトに使用）。
  - 返却: `{ data: [...] }`（開始/終了日時や collectionId を含む）。

- `/tag-groups`
  - 用途: タググループ取得（UI のタグ分類）。
  - 返却: `{ data: [...] }`。

- `/tags`
  - 用途: タグ一覧取得（タグフィルタ用）。
  - 返却: `{ data: [...] }`（各タグに name, group 等）。

---

注意事項:
- `public-site` の `apiFetch()` は、呼び出しパスが何であれ `/api/public` 名前空間へマッピングされるようになっています。
- 必要があれば各エンドポイントの詳細なレスポンス型（主要フィールド）を追記します。