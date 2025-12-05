# データベース移行ガイド

このドキュメントでは、モックデータから実際のデータベースへの移行手順を説明します。

## 対応データベース

- **Supabase** (推奨)
- **Neon** (PostgreSQL)
- **PlanetScale** (MySQL)
- **Prisma + 任意のDB**

## 1. Supabaseへの移行

### 1.1 テーブル作成

\`\`\`sql
-- users テーブル
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_name text not null,
  email text unique not null,
  avatar_url text,
  role text not null default 'viewer',
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- products テーブル
create table products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  slug text unique not null,
  short_description text,
  body text,
  tags text[] default '{}',
  price integer,
  published boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- images テーブル
create table images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  width integer not null,
  height integer not null,
  aspect text,
  role text not null default 'main'
);

-- collections テーブル
create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  slug text unique not null,
  visibility text not null default 'draft',
  created_at timestamptz not null default now()
);

-- collection_items テーブル
create table collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references collections(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  position integer not null,
  added_at timestamptz not null default now(),
  unique(collection_id, product_id)
);

-- recipes テーブル
create table recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  base_image_id uuid,
  width integer not null,
  height integer not null,
  created_at timestamptz not null default now()
);

-- annotations テーブル
create table annotations (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade,
  type text not null,
  x_pct numeric not null,
  y_pct numeric not null,
  x2_pct numeric,
  y2_pct numeric,
  label text,
  linked_product_id uuid references products(id) on delete set null,
  style jsonb
);

-- affiliate_clicks テーブル
create table affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  affiliate_key text not null,
  destination_url text not null,
  referrer text,
  ip_hash text,
  created_at timestamptz not null default now()
);
\`\`\`

### 1.2 Row Level Security (RLS) の設定

\`\`\`sql
-- products テーブルのRLS
alter table products enable row level security;

-- 全員が公開済み商品を閲覧可能
create policy "Public products are viewable by everyone"
  on products for select
  using (published = true);

-- オーナーは全商品を閲覧・編集可能
create policy "Users can view own products"
  on products for select
  using (auth.uid() = user_id);

create policy "Users can update own products"
  on products for update
  using (auth.uid() = user_id);

create policy "Users can delete own products"
  on products for delete
  using (auth.uid() = user_id);

create policy "Users can insert own products"
  on products for insert
  with check (auth.uid() = user_id);
\`\`\`

### 1.3 サービス層の更新

各サービスファイル（`lib/services/*.service.ts`）内のTODOコメント部分を実装します:

\`\`\`typescript
// 例: ProductsService.getAll()
static async getAll(): Promise<Product[]> {
  const supabase = createClient() // Supabaseクライアント作成
  const { data, error } = await supabase.from('products').select('*')
  if (error) throw error
  return data || []
}
\`\`\`

## 2. 環境変数の設定

`.env.local`ファイルを作成:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# または Neon
DATABASE_URL=postgresql://...
\`\`\`

## 3. 認証の実装

Supabase Authを使用する場合:

\`\`\`typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
\`\`\`

## 4. 画像ストレージ

Supabase Storageを使用:

\`\`\`typescript
// 画像アップロード例
const file = event.target.files[0]
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`${userId}/${file.name}`, file)

if (!error) {
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path)
  
  // publicUrlをデータベースに保存
}
\`\`\`

## 5. 移行チェックリスト

- [ ] データベーステーブル作成
- [ ] RLS ポリシー設定
- [ ] 環境変数設定
- [ ] サービス層の更新
- [ ] 認証実装
- [ ] 画像ストレージ設定
- [ ] モックデータのインポート（必要に応じて）
- [ ] テストとバグ修正

## トラブルシューティング

### エラー: "relation does not exist"
→ テーブルが作成されていません。SQL を実行してください。

### エラー: "new row violates row-level security policy"
→ RLS ポリシーを確認してください。

### 画像が表示されない
→ Storage のパケット権限を確認してください。
