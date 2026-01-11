# Gallery Display Specification

このドキュメントは公開ページの「Gallery」モード（Pinterest風のランダム表示）の挙動・表示件数・データソースを正確に記載します。

## 要点（要約）
- 初期表示件数: 24件（定数 `PAGE_DEFAULT_LIMIT = 24`）
- 追加読み込み: 無限スクロールで同じ `pageLimit` 単位（デフォルト24件）ずつ取得して表示を追加
- 表示対象: サーバーのギャラリーAPIが返す "flattened gallery items"（商品のメイン画像だけでなく、添付画像も含むフラットな画像エントリ群）
- 並び順: サーバーから返った配列に対してクライアント側で `shuffleArray()` を適用してランダム化
- 表示方式: `ProductMasonry` を使った masonry（Pinterestライク）レイアウト。グリッド列数はデスクトップ時に7列、モバイル時に2列（`gridColumns` が切り替わる）
- フィルタ: クライアント側で selectedTags / searchText による絞り込みが適用される（`galleryFlatItems`→`galleryItemsShuffled`→`galleryItems` のフロー）

## 実装参照（該当ファイル）
- 実装場所: `public-site/app/page.tsx`
  - 初期フェッチ: `apiFetch(`/gallery?limit=${pageLimit}&offset=0`)`（`pageLimit` は `PAGE_DEFAULT_LIMIT = 24`）
  - ランダム化: `setGalleryFlatItems(shuffleArray(apiProductsFlattened))`
  - フィルタ／スコアリング: `galleryItemsShuffled` から検索語やタグに基づいてスコアリングし `galleryItems` を生成
  - 表示: `<ProductMasonry items={galleryItems} columns={gridColumns} fullWidth={true} ... />`
  - カラム数: ギャラリ表示時 `updateCols()` により `displayMode === 'gallery'` の場合、モバイルは2列、デスクトップは7列に設定（`setGridColumns(isMobileViewport ? 2 : 7)`）。
  - ページネーション（ロードモア）: `loadMore()` で `/gallery?limit=${pageLimit}&offset=${pageOffset}` を呼び、追加のフラットアイテムを取得して `setProducts` にマージ

## データフォーマット（ギャラリーAPIに期待する形）
- 各エントリ（flattened gallery item）例:
  - id: エントリ固有ID
  - productId: 紐づく商品ID（存在する場合）
  - image / url / src: 画像URL
  - aspect: アスペクト比（サーバが返す場合）
  - title, slug, srcSet, role ...（あると望ましい）

クライアント側ではこれらをそのまま `galleryFlatItems` に格納し、ランダム化・フィルタを経て `galleryItems` として `ProductMasonry` に渡します。

## 表示件数の挙動（詳細）
1. 初回ロード
   - `/gallery?limit=24&offset=0` を取得 → 最大24件がクライアントに渡る
   - クライアント側で `shuffleArray()` を適用 → 表示順はランダムになる
   - `ProductMasonry` に渡して Masonry 表示
2. 追加読み込み
   - ページ下部の sentinel が交差すると `loadMore()` が呼ばれ、次の `/gallery?limit=24&offset=<currentOffset>` を取得
   - 取得分は既存の products/flat items にマージされ、再度表示リストが更新される
3. 表示上限
   - サーバが返す総数（`meta.total`）によっては、最終的にすべて読み切るまで無限スクロールで増えていく

## 備考／注意点
- Gallery モードは "商品単位の 1:1 正方形グリッド" ではなく、商品メイン画像と添付画像を混ぜた "画像エントリ" を表示する用途向けです。
- 画像の事前読み込み（モーダル用）やエラー時のフォールバック（`/placeholder.svg`）等は `page.tsx` 内で既に扱われています。
- もしギャラリーの初期件数やロード単位を変更したい場合は `PAGE_DEFAULT_LIMIT`（およびそれを参照する `pageLimit`）を更新してください。

---
ドキュメント保存場所: `docs/GALLERY_SPEC.md`

必要ならこのドキュメントを `README` にリンク追加する、あるいは `page.tsx` 内に参照コメントを挿入しても良いです。