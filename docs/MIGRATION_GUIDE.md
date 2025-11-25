**DB マイグレーション & データ移行ガイド**

目的: スキーマ変更やデータ統合を安全に行うための手順とチェックリスト

---

1) 事前準備（必須）
- スナップショットを取得する（Postgres の場合は `pg_dump`、Supabase の GUI スナップショットなど）
- アプリケーションのメンテナンスウィンドウを確保する（大規模変更時）
- テスト環境に同じ手順をまず適用し、作業手順とクエリを検証する

2) バックアップ（軽量で早い方法）
- テーブル単位のバックアップ:
```sql
CREATE TABLE public.recipes_backup AS TABLE public.recipes;
CREATE TABLE public.recipe_pins_backup AS TABLE public.recipe_pins;
```
- 重要: `CREATE TABLE ... AS TABLE` はスキーマとデータのコピーを作りますが、インデックス・FK・トリガーは複製されません。完全な復元が必要なら `pg_dump` を使ってください。

3) 検証クエリ（移行前）
- 参照整合性（参照先が存在するか）、データの偏り（NULL の比率）、JSONB フィールドの形式確認を実施する。
- 例:
```sql
-- orphaned pin を探す
SELECT p.* FROM public.recipe_pins p WHERE NOT EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = p.recipe_id) LIMIT 100;

-- recipes に images/pins が既にあるレコードのサンプル
SELECT id, images, pins FROM public.recipes WHERE images IS NOT NULL OR pins IS NOT NULL LIMIT 50;
```

4) 移行パターン（代表例）
- パターン A: 正規化テーブル（`recipe_pins`） → 埋め込み JSONB（`recipes.pins`）へ統合（小中規模推奨）
- パターン B: 埋め込み JSONB → 正規化テーブルへ移行（大規模検索要件があるなら）

5) トランザクションと分割適用
- 小さなチャンクに分けて実行することでロック時間を短くできる。
- 例: `recipe_id` のレンジで分割して移行 → 検証 → 次のチャンク。

6) 検証（移行後）
- 合計件数の整合: `recipe_pins` の総数と `jsonb_array_length` の合計が一致するか確認
- サンプルの表示検証: 公開ページでいくつかのレシピを表示してピンと画像が正しく描画されるか確認

---

## 具体的な統合例: `recipe_pins` → `recipes.pins`（安全手順）

以下は `recipe_pins` の内容を `recipes.pins` に統合する具体的な SQL の例です。**実行前に必ずバックアップを取り、テスト環境で検証してください。**

1) バックアップ
```sql
CREATE TABLE public.recipe_pins_backup AS TABLE public.recipe_pins;
CREATE TABLE public.recipes_backup AS TABLE public.recipes;
```

2) 集約 → マージ（既存の `recipes.pins` とマージして重複を避ける）
```sql
-- recipe_pins をレシピ毎にまとめる
WITH rp AS (
  SELECT p.recipe_id, jsonb_agg(to_jsonb(p) ORDER BY p.created_at) AS pins_agg
  FROM public.recipe_pins p
  GROUP BY p.recipe_id
),

to_update AS (
  SELECT r.id AS recipe_id,
         COALESCE(r.pins, '[]'::jsonb) AS existing_pins,
         COALESCE(rp.pins_agg, '[]'::jsonb) AS pins_from_table
  FROM public.recipes r
  LEFT JOIN rp ON rp.recipe_id = r.id
  WHERE rp.pins_agg IS NOT NULL
),

expanded_existing AS (
  SELECT recipe_id, elem AS pin, (elem->>'id') AS pin_id, ord
  FROM to_update, jsonb_array_elements(to_update.existing_pins) WITH ORDINALITY AS t(elem, ord)
),
expanded_new AS (
  SELECT recipe_id, elem AS pin, (elem->>'id') AS pin_id, ord
  FROM to_update, jsonb_array_elements(to_update.pins_from_table) WITH ORDINALITY AS t(elem, ord)
),

expanded_all AS (
  SELECT * FROM expanded_existing
  UNION ALL
  SELECT * FROM expanded_new
),

dedup AS (
  SELECT DISTINCT ON (recipe_id, pin_id) recipe_id, pin
  FROM expanded_all
  ORDER BY recipe_id, pin_id, ord
),

merged AS (
  SELECT recipe_id, jsonb_agg(pin ORDER BY (pin->>'id')) AS all_pins
  FROM dedup
  GROUP BY recipe_id
)

UPDATE public.recipes r
SET pins = m.all_pins
FROM merged m
WHERE r.id = m.recipe_id;
```

3) 検証
```sql
SELECT count(*) AS recipe_pins_total FROM public.recipe_pins;
SELECT SUM(jsonb_array_length(COALESCE(pins,'[]'::jsonb))) AS pins_in_recipes FROM public.recipes;
SELECT count(*) AS recipes_with_pins FROM public.recipes WHERE COALESCE(jsonb_array_length(COALESCE(pins,'[]'::jsonb)),0) > 0;
```

4) 問題なければアーカイブ
```sql
ALTER TABLE public.recipe_pins RENAME TO recipe_pins_archived_YYYYMMDD;
```

---

## 画像テーブル統合例: `product_images` -> `images`

小規模データ（例: 7 行など）の場合は手順が簡単です。以下は安全な移行手順のサンプルです。

1) バックアップ
```sql
CREATE TABLE public.product_images_backup AS TABLE public.product_images;
CREATE TABLE public.images_backup AS TABLE public.images;
```

2) 一時テーブル作成と挿入
```sql
CREATE TEMP TABLE tmp_product_images_for_migration AS
SELECT gen_random_uuid() AS new_image_id,
       id AS old_product_image_id,
       product_id,
       url,
       width,
       height,
       aspect,
       role,
       cf_id,
       created_at
FROM public.product_images;

INSERT INTO public.images (id, url, filename, metadata, owner_user_id, created_at, user_id, cf_id)
SELECT
  new_image_id,
  url,
  substring(url from '[^/]+$') AS filename,
  jsonb_build_object('width', width, 'height', height, 'aspect', aspect, 'role', role) AS metadata,
  NULL::uuid AS owner_user_id,
  COALESCE(created_at, now()) AS created_at,
  NULL::uuid AS user_id,
  cf_id
FROM tmp_product_images_for_migration;

CREATE TABLE public.product_images_map AS
SELECT old_product_image_id, new_image_id FROM tmp_product_images_for_migration;

ALTER TABLE public.product_images ADD COLUMN image_id uuid;

UPDATE public.product_images pi
SET image_id = m.new_image_id
FROM public.product_images_map m
WHERE pi.id = m.old_product_image_id;
```

3) 検証
```sql
SELECT count(*) AS mappings FROM public.product_images_map;
SELECT count(*) FILTER (WHERE image_id IS NOT NULL) AS rows_with_image_id, count(*) AS total FROM public.product_images;
SELECT count(*) AS images_count_after FROM public.images;
```

4) アーカイブ
```sql
ALTER TABLE public.product_images RENAME TO product_images_archived_YYYYMMDD;
```

注意: URL の重複回避や既存 images とのマージをしたい場合は別途クエリを用意しています。必要ならバージョンを出します。

7) ロールバックプラン
- 失敗したらすぐにバックアップテーブルから復元する手順を用意しておく
- 例: `DROP TABLE public.recipes; CREATE TABLE public.recipes AS TABLE public.recipes_backup;`（注意: インデックスや FK を再作成する必要あり）

8) アーカイブ（安全な削除）
- すぐにテーブルを DROP せず、`RENAME` して一定期間（例: 30 日）アーカイブしてから完全削除する
```sql
ALTER TABLE public.recipe_pins RENAME TO recipe_pins_archived_YYYYMMDD;
```

9) アプリ側の移行
- DB 側だけでは不十分。アプリ（API と UI）を段階的に更新する
  1. まず読み取りを両方から行えるようにする（互換レイヤ）
  2. 保存処理を新フォーマットに切替える
  3. 旧フォーマットの読み取りを廃止

---

最後に: マイグレーションは必ず小さなステップで行い、各ステップで検証結果を記録してください。実行前にここで生成した SQL を提示していただければ、さらにレビューと改善案を出します。