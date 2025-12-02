# Supabase RLS ポリシー — テンプレと推奨

このファイルは今回の公開 API（Worker 経由の anon 読み取り）に適した、Supabase（Postgres）の RLS ポリシーテンプレを示します。

重要な前提
- 公開 API は `anon` キーで読み取りを行います。したがって RLS は **公開可能な行のみ** を許可するように設計してください（例: `published = true`、`visibility = 'public'` など）。
- 管理系（作成/更新/削除）は管理用の service-role キーを使う別経路で行い、Worker 側には持たせないでください。
- ここで示す SQL は例です。実稼働前に Supabase SQL エディタでテストしてください。

推奨公開テーブル一覧（今回の用途）
- `products`（商品） — 公開: `published = true`
- `product_images`（商品画像） — 公開画像のみ（親 `products` が公開されていること）
- `collections` — `visibility = 'public'`
- `collection_items` — `collection_id` が公開のコレクションに属するもの
- `recipes` — `published = true`
- `recipe_pins` — `recipe_id` が公開レシピに属するもの
- `tag_groups`, `tags` — 非機密のタグ情報
- `users`（プロフィール） — 公開してよい列のみを含む `view` を作って公開するのが安全

基本方針
1. 行ベースのポリシー: `published = true` や `visibility = 'public'` の行のみ許可する。
2. 画像など参照テーブルは、親テーブルの公開条件に基づいて許可する政策を作る。
3. 個人情報（email 等）は絶対に公開しない。プロフィールは `public_profiles` のような view を作り、公開列のみを含めて `select` を許可する。

SQL テンプレート

-- products
```sql
-- RLS を有効に
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 公開されている商品の SELECT を許可
CREATE POLICY "public_select_published_products"
  ON public.products
  FOR SELECT
  USING (published = true);
```

-- product_images（親テーブル products の published を参照）
```sql
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_product_images_if_product_published"
  ON public.product_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p WHERE p.id = product_images.product_id AND p.published = true
    )
  );
```

-- collections
```sql
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_collections"
  ON public.collections
  FOR SELECT
  USING (visibility = 'public');
```

-- collection_items（公開コレクションに紐づくアイテムのみ）
```sql
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_collection_items"
  ON public.collection_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c WHERE c.id = collection_items.collection_id AND c.visibility = 'public'
    )
  );
```

-- recipes
```sql
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_recipes"
  ON public.recipes
  FOR SELECT
  USING (published = true);
```

-- recipe_pins（公開レシピに属するピンのみ）
```sql
ALTER TABLE public.recipe_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_recipe_pins"
  ON public.recipe_pins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes r WHERE r.id = recipe_pins.recipe_id AND r.published = true
    )
  );
```

-- tag_groups / tags
```sql
ALTER TABLE public.tag_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_tag_groups_select" ON public.tag_groups FOR SELECT USING (true);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_tags_select" ON public.tags FOR SELECT USING (true);
```

注: `tag_groups` / `tags` を完全公開している場合は単純に `USING (true)` でも良いですが、特定ユーザー毎に分けたい場合は `user_id` に基づくポリシーを追加してください。

-- users（プロフィール）: view を作る推奨
```sql
CREATE VIEW public.public_profiles AS
SELECT id, display_name, profile_image, bio, social_links
FROM public.users
WHERE (profile_public = true) OR (id = '公開用オーナーID');

GRANT SELECT ON public.public_profiles TO anon;
```

注: supabase の権限名は環境に依存します。必要に応じて `GRANT SELECT` 対象を `anon` / `authenticated` / `public` 等で調整してください。

検証手順
1. SQL を Supabase の SQL Editor に貼って実行
2. `Table Editor` から各テーブルにダミーデータを入れて、期待通り `SELECT` できるか試す
3. Worker を用いて `curl` から実際に取得してみる（`SUPABASE_ANON_KEY` を Worker にセット）

セキュリティ注意点
- 絶対に Service Role Key を Worker やブラウザに置かないでください。Service Role はサーバー側（管理側）でのみ使用すること。
- `users` テーブルのメールやパスワード等は決して公開しないでください。公開用 `view` を作ること。

カスタム要件がある場合
- 「オーナー公開（特定ユーザーの全行を公開）」のような要件がある場合は、公開対象の行に `published` / `visibility` ようなフラグを追加し、上の `USING` 条件に組み込む方法を推奨します。
- どうしても動的に Worker の環境変数を RLS 条件に反映したい場合は、Supabase 側でカスタム SQL 関数を用意し、その関数を参照する形にできますが設計が複雑になるためここでは割愛します。

---

必要なら、あなたの実際のテーブル定義（`\d+ table_name` 的な情報）を共有してください。テーブル列に合わせてより正確なポリシーと `SELECT` の `USING` 条件を作成します。