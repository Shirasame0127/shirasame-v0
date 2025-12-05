## Supabase 実スキーマ（提供JSONに基づく確定版）

提供いただいた JSON（テーブル定義/外部キー）を解析し、確定スキーマとして以下に整理しました。型/NULL/DEFAULT は Supabase/PG の表記に準じます。

---

### Tables

- affiliate_links
  - id: uuid, NOT NULL, default gen_random_uuid()
  - product_id: text, NULL
  - provider: text, NULL
  - url: text, NULL
  - label: text, NULL
  - created_at: timestamptz, NULL, default now()
  - user_id: text, NULL

- amazon_credentials
  - id: text, NOT NULL
  - access_key: text, NULL
  - secret_key: text, NULL
  - associate_id: text, NULL
  - updated_at: timestamptz, NULL, default now()
  - user_id: uuid, NULL

- amazon_sale_schedules
  - id: uuid, NOT NULL, default gen_random_uuid()
  - user_id: uuid, NULL
  - sale_name: text, NOT NULL
  - start_date: timestamptz, NOT NULL
  - end_date: timestamptz, NOT NULL
  - collection_id: text, NOT NULL
  - created_at: timestamptz, NOT NULL, default now()
  - updated_at: timestamptz, NOT NULL, default now()

- collection_items
  - id: text, NOT NULL
  - collection_id: text, NULL
  - product_id: text, NULL
  - order: integer, NULL
  - created_at: timestamptz, NULL
  - user_id: text, NULL

- collections
  - id: text, NOT NULL
  - user_id: text, NULL
  - title: text, NULL
  - slug: text, NULL
  - visibility: text, NULL
  - description: text, NULL
  - product_ids: ARRAY, NULL
  - created_at: timestamptz, NULL
  - updated_at: timestamptz, NULL
  - item_count: integer, NULL, default 0

- custom_fonts
  - id: text, NOT NULL
  - name: text, NULL
  - url: text, NULL
  - added_at: timestamptz, NULL

- images
  - id: uuid, NOT NULL, default gen_random_uuid()
  - cf_id: text, NULL
  - url: text, NULL
  - filename: text, NULL
  - metadata: jsonb, NULL
  - owner_user_id: uuid, NULL
  - created_at: timestamptz, NULL, default now()
  - user_id: uuid, NULL

- product_images
  - id: text, NOT NULL
  - product_id: text, NULL
  - url: text, NULL
  - width: integer, NULL
  - height: integer, NULL
  - aspect: text, NULL
  - role: text, NULL
  - cf_id: text, NULL
  - created_at: timestamptz, NULL, default now()

- products
  - id: text, NOT NULL
  - user_id: text, NULL
  - title: text, NULL
  - slug: text, NULL
  - short_description: text, NULL
  - body: text, NULL
  - tags: ARRAY, NULL
  - price: numeric, NULL
  - published: boolean, NULL, default false
  - created_at: timestamptz, NULL
  - updated_at: timestamptz, NULL
  - related_links: ARRAY, NULL
  - notes: text, NULL
  - show_price: boolean, NULL

- recipe_pins
  - id: text, NOT NULL
  - recipe_id: text, NULL
  - product_id: text, NULL
  - user_id: text, NULL
  - tag_display_text: text, NULL
  - dot_x_percent: numeric, NULL, default 0
  - dot_y_percent: numeric, NULL, default 0
  - tag_x_percent: numeric, NULL, default 0
  - tag_y_percent: numeric, NULL, default 0
  - dot_size_percent: numeric, NULL, default 0
  - tag_font_size_percent: numeric, NULL, default 0
  - line_width_percent: numeric, NULL, default 0
  - tag_padding_x_percent: numeric, NULL, default 0
  - tag_padding_y_percent: numeric, NULL, default 0
  - tag_border_radius_percent: numeric, NULL, default 0
  - tag_border_width_percent: numeric, NULL, default 0
  - dot_color: text, NULL
  - dot_shape: text, NULL
  - tag_text: text, NULL
  - tag_font_family: text, NULL
  - tag_font_weight: text, NULL
  - tag_text_color: text, NULL
  - tag_text_shadow: text, NULL
  - tag_background_color: text, NULL
  - tag_background_opacity: numeric, NULL, default 1
  - tag_border_color: text, NULL
  - tag_shadow: text, NULL
  - line_type: text, NULL

- recipes
  - カラム詳細は JSON に未掲載（`recipe_pins.recipe_id -> recipes.id` の FK のみ確認）。API は `select('*')` を基本とし、画像などの不要結合は行わない。

---

### Foreign Keys

- affiliate_links.product_id → products.id
- collection_items.collection_id → collections.id
- product_images.product_id → products.id
- recipe_pins.recipe_id → recipes.id

---

### API への反映（設計メモ）

- amazon_sale_schedules: `order('start_date')` を使用（`date` カラムは存在しない）。
- products: 画像は `product_images`、アフィリエイトは `affiliate_links` を結合して取得。
- collections: `collection_images` は存在しないため結合しない。`collection_items` を優先利用し、必要なら `collections.product_ids` で補完。
- recipes: `recipe_images` に依存しない実装に変更。`recipe_pins` は別クエリで一括取得し、`recipe_id` でグルーピングしてマージ。
- recipe_pins API: スキーマに無いカラム（例: `created_at`/`updated_at`/`line_color` 等）は出力/更新対象に含めない。

このドキュメントは実スキーマベースの最新版です。変更があれば本ファイルを更新して実装と同期させます。
