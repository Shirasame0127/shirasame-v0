# API設計とコード解説

> このドキュメントでは、shirasame-v0 プロジェクトの **API の設計思想**、  
> **エンドポイントの作り方**、**コード構成パターン**、  
> **バリデーション**・**エラーハンドリング** の実装例を初心者にもわかるように解説します。

---

## 目次

1. [API 設計の全体像](#1-api-設計の全体像)
2. [エンドポイント一覧](#2-エンドポイント一覧)
3. [Next.js API Routes の書き方](#3-nextjs-api-routes-の書き方)
4. [Hono（Workers）の書き方](#4-honoworkersの書き方)
5. [認証・認可の仕組み](#5-認証認可の仕組み)
6. [リクエスト・レスポンスの形式](#6-リクエストレスポンスの形式)
7. [バリデーション](#7-バリデーション)
8. [エラーハンドリング](#8-エラーハンドリング)
9. [キャッシュ戦略](#9-キャッシュ戦略)
10. [API クライアントの設計](#10-api-クライアントの設計)

---

## 1. API 設計の全体像

### 1.1 アーキテクチャ

このプロジェクトの API は **2 種類の実装** が共存しています。

```
┌──────────────────────────────────────────────────────────────────┐
│                         API の全体構成                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ① Next.js API Routes（admin-site/app/api/）                    │
│     └── 管理系 API + 開発時のモック                               │
│     └── 認証系 API（ログイン/ログアウト/セッション）                │
│     └── 画像アップロード API                                      │
│                                                                  │
│  ② Hono on Workers（public-worker/src/）                         │
│     └── 公開 API（商品・レシピ・コレクション・タグ等）              │
│     └── 本番環境のメイン API                                      │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  リクエストの流れ（本番環境）:                                    │
│                                                                  │
│  ブラウザ                                                         │
│    │                                                             │
│    ├── /api/auth/*   → Next.js 内部で処理（Cookie 操作）          │
│    ├── /api/admin/*  → Next.js 内部で処理 or プロキシ             │
│    └── /api/*        → admin-api-proxy → public-worker           │
│                                                                  │
│  リクエストの流れ（開発環境）:                                    │
│                                                                  │
│  ブラウザ                                                         │
│    └── /api/*        → 全て Next.js 内部で処理                   │
│                        （middleware.ts が開発時はプロキシしない）   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

```
💡 初心者向け解説：REST API とは？
───────────────────────────────
REST API は、Web の仕組み（HTTP）を使ってデータのやり取りをする設計パターンです。

基本的な考え方:
  URL = データの場所（リソース）
  HTTP メソッド = データへの操作

  GET    /api/products       → 商品一覧を取得する
  GET    /api/products/123   → ID=123 の商品を取得する
  POST   /api/products       → 新しい商品を作成する
  PUT    /api/products/123   → ID=123 の商品を更新する
  DELETE /api/products/123   → ID=123 の商品を削除する

このプロジェクトでは GraphQL は使わず、REST API のみで構成されています。
```

### 1.2 設計ルール

| ルール | 説明 |
|--------|------|
| URL は名詞で表現 | `/api/products`（OK） `/api/getProducts`（NG） |
| HTTP メソッドで操作を表現 | GET=取得, POST=作成, PUT=更新, DELETE=削除 |
| レスポンスは `{ data: ... }` 形式 | 統一的なレスポンス構造 |
| エラーは `{ error: ... }` 形式 | エラーメッセージを含む |
| 公開 API は認証不要 | `published=true` のデータのみ返却 |
| 管理 API は認証必須 | Cookie / Authorization ヘッダーで認証 |

---

## 2. エンドポイント一覧

### 2.1 公開 API（認証不要）

| メソッド | パス | 説明 | ページネーション |
|---------|------|------|--------------|
| GET | `/api/products` | 商品一覧（Shallow/Full） | ✅ `limit` `offset` |
| GET | `/api/products?id=xxx` | 商品詳細 | — |
| GET | `/api/products?slug=xxx` | 商品詳細（スラッグ指定） | — |
| GET | `/api/products?tag=xxx` | タグ絞り込み | ✅ |
| GET | `/api/collections` | コレクション一覧＋商品 | ❌ |
| GET | `/api/recipes` | レシピ一覧（画像+ピン含む） | ❌ |
| GET | `/api/profile` | オーナープロフィール | — |
| GET | `/api/tags` | タグ一覧 | ❌ |
| GET | `/api/tag-groups` | タググループ一覧 | ❌ |
| GET | `/api/site-settings` | サイト設定 | — |
| GET | `/api/amazon-sale-schedules` | セールスケジュール（スタブ） | — |

### 2.2 管理 API（認証必須）

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/admin/products` | 商品一覧（全件） |
| POST | `/api/admin/products` | 商品作成 |
| PUT | `/api/admin/products` | 商品更新 |
| DELETE | `/api/admin/products` | 商品削除 |
| GET | `/api/admin/recipes` | レシピ一覧 |
| POST | `/api/admin/recipes` | レシピ作成 |
| PUT | `/api/admin/recipes` | レシピ更新 |
| DELETE | `/api/admin/recipes` | レシピ削除 |
| POST | `/api/admin/recipe-images` | レシピ画像管理 |
| POST | `/api/admin/recipe-pins` | レシピピン管理 |
| GET/PUT | `/api/admin/settings` | 設定管理 |

### 2.3 認証 API

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/auth/login` | メール+パスワードログイン |
| POST | `/api/auth/logout` | ログアウト（Cookie消去） |
| POST | `/api/auth/refresh` | トークンリフレッシュ |
| GET | `/api/auth/me` | 現在のユーザー情報 |
| GET | `/api/auth/whoami` | 認証状態確認 |
| POST | `/api/auth/session` | セッション設定（Cookie） |
| GET | `/api/auth/google` | Google OAuth 開始 |
| GET | `/api/auth/callback` | OAuth コールバック |

### 2.4 画像 API

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/images/upload` | 画像アップロード |
| POST | `/api/images/direct-upload` | R2 Presigned URL 発行 |
| POST | `/api/images/complete` | アップロード完了通知 |
| GET | `/api/images/thumbnail` | サムネイル生成（移行中） |

---

## 3. Next.js API Routes の書き方

### 3.1 基本構造

```
💡 Next.js App Router の API Route とは？
────────────────────────────────────────
app/api/ ディレクトリ内に route.ts ファイルを置くと、
そのパスが API エンドポイントになります。

ファイル内で export する関数名が HTTP メソッドに対応します:
  export async function GET()    → GET リクエストの処理
  export async function POST()   → POST リクエストの処理
  export async function PUT()    → PUT リクエストの処理
  export async function DELETE() → DELETE リクエストの処理
```

### 3.2 実装例：商品取得 API

```typescript
// admin-site/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// ──────────────────────────────────────
// GET /api/products — 商品一覧取得
// ──────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    // 1. クエリパラメータの取得
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const tag = searchParams.get('tag');
    const published = searchParams.get('published');
    const shallow = searchParams.get('shallow') === 'true'
                  || searchParams.get('list') === 'true';
    const limit = parseInt(searchParams.get('limit') || '24');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 2. Supabase クライアント取得
    const supabase = getSupabaseAdmin();

    // 3. 特定商品の取得（id 指定）
    if (id) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    // 4. 商品一覧の取得
    let query = supabase.from('products').select(
      shallow
        ? 'id, title, slug, price, published, tags, created_at, updated_at'
        : '*',
      { count: 'exact' }
    );

    // 公開商品のみフィルタ
    if (published === 'true') {
      query = query.eq('published', true);
    }

    // タグフィルタ
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // ページネーション
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 5. レスポンス返却
    const response = NextResponse.json({
      data,
      meta: { total: count || 0, limit, offset },
    });

    // 公開 + shallow の場合はキャッシュを設定
    if (published === 'true' && shallow) {
      response.headers.set('Cache-Control', 'public, max-age=10');
    }

    return response;

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### 3.3 実装例：認証 API（ログイン）

```typescript
// admin-site/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    // 1. リクエストボディからメール・パスワードを取得
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      );
    }

    // 2. Supabase Auth でサインイン
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: 'ログインに失敗しました' },
        { status: 401 }
      );
    }

    // 3. レスポンスを作成（Cookie にトークンを設定）
    const response = NextResponse.json({
      data: {
        user: data.user,
        access_token: data.session.access_token,
      },
    });

    // HttpOnly Cookie にトークンを保存
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,         // JavaScript からアクセス不可
      secure: true,           // HTTPS 通信でのみ送信
      sameSite: 'lax',        // CSRF 対策
      path: '/',              // 全パスで有効
      maxAge: 60 * 60 * 24,   // 1日間有効
    });

    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7日間有効
    });

    return response;

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### 3.4 実装例：画像アップロード API

```typescript
// admin-site/app/api/images/direct-upload/route.ts
// R2 への直接アップロード用 Presigned URL を発行する

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(req: NextRequest) {
  try {
    const { key, contentType } = await req.json();

    // R2 クライアント初期化
    const r2 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.R2_SECRET!,
      },
    });

    // Presigned URL を生成（5分間有効）
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET || 'images',
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(r2, command, {
      expiresIn: 300, // 5分
    });

    return NextResponse.json({
      data: {
        uploadUrl: presignedUrl,
        key,
        publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
      },
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Upload URL generation failed' },
      { status: 500 }
    );
  }
}
```

---

## 4. Hono（Workers）の書き方

### 4.1 基本構造

```
💡 Hono とは？
────────────
Hono は Cloudflare Workers 向けに設計された
軽量 Web フレームワークです。
Express.js に似た書き方ができるので、
Node.js 経験者なら馴染みやすいです。
```

### 4.2 エントリーポイント

```typescript
// public-worker/src/index.ts（簡略版）
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { productRoutes } from './routes/public/products';
import { collectionRoutes } from './routes/public/collections';
import { recipeRoutes } from './routes/public/recipes';
import { profileRoutes } from './routes/public/profile';
import { tagRoutes } from './routes/public/tags';

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  IMAGES_BUCKET: R2Bucket;
  IMAGES_DOMAIN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ── ミドルウェア ─────────────────────────
// CORS（クロスオリジンリクエスト許可）
app.use('/api/*', cors({
  origin: (origin) => {
    // 管理サイトと公開サイトからのリクエストを許可
    const allowed = [
      'https://admin.shirasame.com',
      'https://shirasame.com',
    ];
    return allowed.includes(origin) ? origin : '';
  },
  credentials: true,
}));

// ── ルート登録 ─────────────────────────
app.route('/api', productRoutes);
app.route('/api', collectionRoutes);
app.route('/api', recipeRoutes);
app.route('/api', profileRoutes);
app.route('/api', tagRoutes);

// ── OpenAPI ドキュメント ────────────────
app.get('/api/docs', (c) => {
  return c.html('<!-- Swagger UI -->');
});

export default app;
```

### 4.3 ルートの実装例

```typescript
// public-worker/src/routes/public/products.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// クエリパラメータのバリデーションスキーマ
const productQuerySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().optional(),
  tag: z.string().optional(),
  published: z.enum(['true', 'false']).optional(),
  shallow: z.enum(['true', 'false']).optional(),
  list: z.enum(['true', 'false']).optional(),
  limit: z.string().optional().transform(v => v ? parseInt(v) : 24),
  offset: z.string().optional().transform(v => v ? parseInt(v) : 0),
  count: z.enum(['true', 'false']).optional(),
});

export const productRoutes = new Hono();

productRoutes.get(
  '/products',
  zValidator('query', productQuerySchema),
  async (c) => {
    const query = c.req.valid('query');
    
    // Supabase クライアント生成（Workers 環境）
    const supabase = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Shallow モード判定
    const isShallow = query.shallow === 'true' || query.list === 'true';
    
    const selectColumns = isShallow
      ? 'id, title, slug, price, published, tags, created_at, updated_at'
      : '*';

    let dbQuery = supabase
      .from('products')
      .select(selectColumns, { count: query.count === 'true' ? 'exact' : undefined })
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.tag) {
      dbQuery = dbQuery.contains('tags', [query.tag]);
    }

    const { data, error, count } = await dbQuery;

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({
      data,
      meta: { total: count ?? 0, limit: query.limit, offset: query.offset },
    });
  }
);
```

### 4.4 ルート構造の比較

```
┌──────────────────────────────────────────────────────────────┐
│               Next.js vs Hono の比較                         │
├─────────────────────────┬────────────────────────────────────┤
│     Next.js API Route   │           Hono Route               │
├─────────────────────────┼────────────────────────────────────┤
│ ファイルベースルーティング│ コードベースルーティング            │
│                         │                                    │
│ app/api/products/       │ app.get('/products', ...)           │
│   route.ts              │                                    │
│   export async function │                                    │
│     GET(req) { ... }    │                                    │
├─────────────────────────┼────────────────────────────────────┤
│ req: NextRequest        │ c: Context (Hono)                  │
│ NextResponse.json()     │ c.json()                           │
│ req.nextUrl.searchParams│ c.req.query() or validated query   │
│ process.env.XXX         │ c.env.XXX                          │
├─────────────────────────┼────────────────────────────────────┤
│ Node.js ランタイム       │ Workers ランタイム（V8 Isolate）   │
│ Sharp 使用可能          │ Sharp 使用不可                     │
│ ファイルシステムあり     │ ファイルシステムなし                │
└─────────────────────────┴────────────────────────────────────┘
```

---

## 5. 認証・認可の仕組み

### 5.1 認証の流れ

```typescript
// ── 認証チェックの実装パターン ─────────────────

// パターン1: サーバーサイド認証（admin-site/lib/server-auth.ts）
// Edge Runtime 互換の REST ベース認証
async function getAuthUser(req: NextRequest) {
  // Cookie からアクセストークンを取得
  const accessToken = req.cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    return null;  // 未認証
  }

  // Supabase REST API でトークンを検証
  const response = await fetch(
    `${process.env.SUPABASE_URL}/auth/v1/user`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: process.env.SUPABASE_ANON_KEY!,
      },
    }
  );

  if (!response.ok) {
    return null;  // トークン無効
  }

  return await response.json();
}


// パターン2: Workers での認証（public-worker）
// Cookie または Authorization ヘッダーからユーザーを特定
function extractUserId(req: Request): string | null {
  // Authorization ヘッダーを確認
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // JWT をデコードしてユーザー ID を取得
    const token = authHeader.slice(7);
    const payload = decodeJwt(token);
    return payload?.sub || null;
  }

  // Cookie を確認
  const cookie = req.headers.get('Cookie') || '';
  const match = cookie.match(/sb-access-token=([^;]+)/);
  if (match) {
    const payload = decodeJwt(match[1]);
    return payload?.sub || null;
  }

  // X-User-Id ヘッダー（プロキシ経由）
  return req.headers.get('X-User-Id') || null;
}
```

### 5.2 認可（オーナーチェック）

```typescript
// ── 公開データのオーナースコープ ─────────────────
// 公開 API は特定のオーナーのデータのみを返す

async function getOwnerUserId(supabase: any): Promise<string | null> {
  const email = process.env.PUBLIC_PROFILE_EMAIL;
  if (!email) return null;

  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  return data?.id || null;
}

// 使用例: 商品一覧取得時にオーナーで絞り込み
const ownerId = await getOwnerUserId(supabase);
let query = supabase.from('products').select('*');

if (ownerId) {
  query = query.eq('user_id', ownerId);  // このオーナーの商品のみ
}
query = query.eq('published', true);      // 公開商品のみ
```

### 5.3 middleware.ts での認証ゲート

```typescript
// admin-site/middleware.ts（簡略版）
// /admin/* へのアクセスに認証を要求する

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin/* への認証チェック
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const accessToken = req.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      // 未ログイン → ログインページへリダイレクト
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // トークンの有効性を確認
    const user = await verifyToken(accessToken);
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
```

---

## 6. リクエスト・レスポンスの形式

### 6.1 リクエスト例

#### 商品一覧取得（GET）

```http
GET /api/products?published=true&shallow=true&limit=24&offset=0 HTTP/1.1
Host: api.shirasame.com
Accept: application/json
```

#### 商品をタグで絞り込み

```http
GET /api/products?published=true&tag=季節&limit=12 HTTP/1.1
Host: api.shirasame.com
```

#### 商品作成（POST）

```http
POST /api/admin/products HTTP/1.1
Host: admin.shirasame.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Cookie: sb-access-token=eyJhbGciOiJIUzI1NiIs...

{
  "title": "新しい商品",
  "slug": "new-product",
  "price": 2980,
  "tags": ["人気", "新着"],
  "shortDescription": "おすすめの商品です",
  "published": true
}
```

### 6.2 レスポンス形式

#### 成功レスポンス（一覧 — Shallow）

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "399e...",
      "title": "おしゃれなバッグ",
      "slug": "stylish-bag",
      "tags": ["バッグ", "人気"],
      "price": 5980,
      "published": true,
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-15T14:30:00Z",
      "image": {
        "url": "https://images.shirasame.com/cdn-cgi/image/width=400,format=auto,quality=75/products/550e.../main.jpg",
        "width": 400,
        "height": null,
        "role": null
      }
    }
  ],
  "meta": {
    "total": 240,
    "limit": 24,
    "offset": 0
  }
}
```

#### 成功レスポンス（詳細 — Full）

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "399e...",
    "title": "おしゃれなバッグ",
    "slug": "stylish-bag",
    "tags": ["バッグ", "人気"],
    "price": 5980,
    "published": true,
    "shortDescription": "おすすめの商品です",
    "body": "<p>商品の詳細な説明...</p>",
    "showPrice": true,
    "notes": "特記事項",
    "relatedLinks": [],
    "images": [
      {
        "id": "img-001",
        "url": "https://images.shirasame.com/products/550e.../main.jpg",
        "basePath": "products/550e.../main",
        "width": 1200,
        "height": 900,
        "role": "main"
      }
    ],
    "affiliateLinks": [
      {
        "id": "aff-001",
        "url": "https://www.amazon.co.jp/dp/...",
        "label": "Amazonで購入",
        "provider": "amazon"
      }
    ],
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-15T14:30:00Z"
  }
}
```

#### エラーレスポンス

```json
// 400 Bad Request
{ "error": "id パラメータが不正です" }

// 401 Unauthorized
{ "error": "認証が必要です" }

// 404 Not Found
{ "error": "商品が見つかりません" }

// 500 Internal Server Error
{ "error": "データベースエラーが発生しました" }
```

#### プロフィールレスポンス

```json
{
  "data": {
    "id": "399e...",
    "displayName": "Shirasame",
    "avatarUrl": "https://images.shirasame.com/avatars/profile.jpg",
    "headerImages": ["https://images.shirasame.com/headers/main.jpg"],
    "bio": "ようこそ Shirasame へ"
  }
}
```

---

## 7. バリデーション

### 7.1 Zod を使ったバリデーション

```
💡 Zod とは？
───────────
Zod は TypeScript で書かれたスキーマ検証ライブラリです。
「このデータはこういう形であるべき」というルールを定義し、
実際のデータがそのルールに合致するかチェックします。

メリット:
  ✅ TypeScript の型と連動する（型推論が効く）
  ✅ エラーメッセージが詳細
  ✅ 軽量で高速
```

```typescript
// ── Zod スキーマの定義例 ──────────────────────

import { z } from 'zod';

// 商品作成時のバリデーションスキーマ
const createProductSchema = z.object({
  title: z.string()
    .min(1, 'タイトルは必須です')
    .max(200, 'タイトルは200文字以内です'),

  slug: z.string()
    .min(1, 'スラッグは必須です')
    .regex(/^[a-z0-9-]+$/, 'スラッグは英小文字・数字・ハイフンのみ使用できます'),

  price: z.number()
    .int('価格は整数で指定してください')
    .min(0, '価格は0以上です')
    .optional(),

  tags: z.array(z.string()).optional().default([]),

  shortDescription: z.string().max(500).optional(),

  published: z.boolean().optional().default(false),
});

// 型の自動推論
type CreateProductInput = z.infer<typeof createProductSchema>;
// → { title: string; slug: string; price?: number; tags: string[]; ... }


// ── バリデーションの実行 ────────────────────

// 方法1: parse（エラー時に例外を投げる）
try {
  const validated = createProductSchema.parse(requestBody);
  // validated は CreateProductInput 型として推論される
} catch (error) {
  if (error instanceof z.ZodError) {
    // バリデーションエラーの詳細を取得
    const messages = error.errors.map(e => e.message);
    // → ['タイトルは必須です', 'スラッグは英小文字…']
  }
}

// 方法2: safeParse（例外を投げない）
const result = createProductSchema.safeParse(requestBody);
if (!result.success) {
  // result.error にエラー情報
  return c.json({ error: result.error.flatten() }, 400);
}
// result.data にバリデーション済みデータ
```

### 7.2 Hono + Zod バリデーション

```typescript
// public-worker/src/routes/public/products.ts

import { zValidator } from '@hono/zod-validator';

// クエリパラメータのバリデーションをミドルウェアとして定義
app.get(
  '/products',
  zValidator('query', z.object({
    id: z.string().uuid().optional(),
    slug: z.string().optional(),
    tag: z.string().optional(),
    limit: z.string()
      .optional()
      .transform(v => Math.min(parseInt(v || '24'), 100)),  // 最大100件
    offset: z.string()
      .optional()
      .transform(v => Math.max(parseInt(v || '0'), 0)),     // 0以上
  })),
  async (c) => {
    const query = c.req.valid('query');
    // query は型安全！ TypeScript が補完してくれる
    // query.limit は number 型（transform で変換済み）

    // ...
  }
);
```

---

## 8. エラーハンドリング

### 8.1 エラー処理のパターン

```typescript
// ── パターン1: try-catch ラッパー ──────────────

// Next.js API Route
export async function GET(req: NextRequest) {
  try {
    // 正常処理
    const data = await fetchData();
    return NextResponse.json({ data });

  } catch (err: any) {
    // Supabase エラー
    if (err.code) {
      return NextResponse.json(
        { error: err.message },
        { status: err.code === 'PGRST116' ? 404 : 500 }
      );
    }

    // 一般的なエラー
    console.error('API Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}


// ── パターン2: Hono のエラーハンドラ ───────────

// グローバルエラーハンドラ
app.onError((err, c) => {
  console.error('Worker Error:', err);

  // Zod バリデーションエラー
  if (err instanceof z.ZodError) {
    return c.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'リクエストパラメータが不正です',
        details: err.errors,
      },
    }, 400);
  }

  // 一般的なエラー
  return c.json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'サーバーエラーが発生しました',
    },
  }, 500);
});

// 404 ハンドラ
app.notFound((c) => {
  return c.json({
    error: {
      code: 'NOT_FOUND',
      message: `${c.req.path} が見つかりません`,
    },
  }, 404);
});
```

### 8.2 Supabase エラーの処理

```typescript
// Supabase のエラーオブジェクト構造
interface PostgrestError {
  message: string;      // エラーメッセージ
  details: string;      // 詳細情報
  hint: string;         // 修正のヒント
  code: string;         // PostgreSQL エラーコード
}

// 一般的なエラーコードの対応表
const SUPABASE_ERROR_MAP: Record<string, { status: number; message: string }> = {
  'PGRST116': { status: 404, message: 'データが見つかりません' },
  '23505':    { status: 409, message: 'データが重複しています' },
  '23503':    { status: 400, message: '関連データが存在しません' },
  '42501':    { status: 403, message: 'アクセス権限がありません' },
};

function handleSupabaseError(error: PostgrestError) {
  const mapped = SUPABASE_ERROR_MAP[error.code];
  if (mapped) {
    return { status: mapped.status, body: { error: mapped.message } };
  }
  return { status: 500, body: { error: 'データベースエラー' } };
}
```

---

## 9. キャッシュ戦略

### 9.1 現在のキャッシュ実装

```typescript
// ── インメモリキャッシュ（Next.js 内）──────────────
// admin-site/app/api/products/route.ts

const CACHE_TTL = 10_000; // 10秒
const cache = new Map<string, { data: any; timestamp: number }>();

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

// API ハンドラ内で使用
export async function GET(req: NextRequest) {
  const cacheKey = req.nextUrl.search; // クエリパラメータ全体をキーに

  // キャッシュヒット
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  // DB から取得
  const data = await fetchFromDatabase();

  // キャッシュに保存
  setCache(cacheKey, data);

  return NextResponse.json(data);
}


// ── HTTP キャッシュヘッダー ────────────────────────
// 公開 + shallow の場合のみ
response.headers.set('Cache-Control', 'public, max-age=10');


// ── Workers でのキャッシュ（将来移行予定）───────────
// Cloudflare Cache API を使用
const cacheKey = new Request(c.req.url, { method: 'GET' });
const cache = caches.default;

// キャッシュから取得
const cached = await cache.match(cacheKey);
if (cached) return cached;

// 新しいレスポンスをキャッシュ
const response = new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=10',
  },
});
c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
return response;
```

### 9.2 API クライアント側のキャッシュ

```typescript
// admin-site/lib/api-client.ts のキャッシュ機構
// GET リクエストのインメモリキャッシュ（5秒TTL）+ Promise 合体

const GET_CACHE = new Map<string, { promise: Promise<any>; expires: number }>();
const CACHE_TTL = 5000; // 5秒

export async function apiFetch(path: string, init?: RequestInit) {
  const method = init?.method?.toUpperCase() || 'GET';

  // GET リクエストのみキャッシュ
  if (method === 'GET') {
    const cacheKey = path;
    const cached = GET_CACHE.get(cacheKey);

    // 有効期限内のキャッシュがあればそれを返す
    if (cached && Date.now() < cached.expires) {
      return cached.promise;
    }

    // 新しいリクエストを発行
    const promise = doFetch(path, init);
    GET_CACHE.set(cacheKey, {
      promise,
      expires: Date.now() + CACHE_TTL,
    });

    return promise;
  }

  return doFetch(path, init);
}
```

---

## 10. API クライアントの設計

### 10.1 URL ルーティングの仕組み

```typescript
// admin-site/lib/api-client.ts

function resolveApiUrl(path: string): string {
  // ブラウザ環境かどうかで判定
  if (typeof window === 'undefined') {
    // サーバーサイド: 内部 API を直接呼ぶ
    return `${process.env.INTERNAL_API_BASE || 'http://localhost:3000'}${path}`;
  }

  // ブラウザ環境:
  // admin.shirasame.com では常に同一オリジン（Cookie 送信のため）
  const host = window.location.hostname;

  if (host === 'admin.shirasame.com' || host === 'localhost') {
    // 同一オリジンの /api/* パスを使用
    // → middleware.ts がプロキシしてくれる
    return path;
  }

  // その他: 明示的な API ベース URL を使用
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  return `${apiBase}${path}`;
}
```

### 10.2 ブラウザからの API 呼び出し例

```typescript
// ── コンポーネントから API を呼ぶ例 ─────────────

import { apiFetch } from '@/lib/api-client';

// 商品一覧を取得
async function loadProducts() {
  try {
    const result = await apiFetch('/api/products?published=true&shallow=true&limit=24');
    // result = { data: [...], meta: { total, limit, offset } }
    return result.data;

  } catch (err) {
    if (err.message === 'unauthenticated') {
      // ログインページへリダイレクト
      window.location.href = '/admin/login';
    }
    throw err;
  }
}

// 商品を作成
async function createProduct(product: CreateProductInput) {
  const result = await apiFetch('/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return result.data;
}

// 商品を削除
async function deleteProduct(id: string) {
  await apiFetch(`/api/admin/products?id=${id}`, {
    method: 'DELETE',
  });
}
```

### 10.3 データの流れ（図解）

```
┌──────────────┐     ┌───────────────┐     ┌──────────────────┐
│ React        │     │ API Client    │     │ API Server       │
│ Component    │     │ (apiFetch)    │     │ (Next.js/Hono)   │
└──────┬───────┘     └───────┬───────┘     └────────┬─────────┘
       │                     │                      │
       │ 1. loadProducts()  │                      │
       │ ──────────────────>│                      │
       │                     │ 2. GET /api/products │
       │                     │    + Auth ヘッダー    │
       │                     │ ────────────────────>│
       │                     │                      │ 3. Supabase
       │                     │                      │    クエリ実行
       │                     │                      │    ┌────────┐
       │                     │                      │───>│   DB   │
       │                     │                      │<───│        │
       │                     │                      │    └────────┘
       │                     │ 4. { data, meta }    │
       │                     │ <────────────────────│
       │ 5. 商品データ       │                      │
       │ <──────────────────│                      │
       │                     │                      │
       │ 6. 画面に表示       │                      │
       │ (setState / render)│                      │
```

---

## まとめ

| 概念 | このプロジェクトでの実装 |
|------|----------------------|
| API スタイル | REST API（JSON） |
| 公開 API サーバー | Hono on Cloudflare Workers |
| 管理 API サーバー | Next.js API Routes |
| バリデーション | Zod（Workers）/ 手動チェック（Next.js） |
| 認証 | Supabase Auth + HttpOnly Cookie + JWT |
| 認可 | オーナースコープ（`user_id` 絞り込み） |
| エラー形式 | `{ error: "..." }` / `{ error: { code, message } }` |
| キャッシュ | インメモリ（10s）+ HTTP Cache-Control |
| API クライアント | `apiFetch()` ラッパー（認証自動付与） |

---

> **次のドキュメント**: [開発環境.md](開発環境.md) でセットアップ手順、ビルド、テスト、デバッグの流れを解説します。
