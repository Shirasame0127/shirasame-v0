# API 現行ルート仕様 (v0-samehome)

このドキュメントは Next.js App Router 上の既存 API エンドポイント挙動を Workers (Hono) 移植前に正確に保存する目的のスナップショットです。移植後は差分を別ファイルで管理してください。

## 対象範囲
公開/公開準備中サイトで参照される以下のルート:
- `/api/products`
- `/api/collections`
- `/api/profile`
- `/api/recipes`
- `/api/tags`
- `/api/tag-groups`
- `/api/amazon-sale-schedules` (スタブ)
- `/api/images/thumbnail`

補足: ディレクトリには他にも管理系候補 (`admin/`, `auth/`, `site-settings/`, `recipe-pins/` 等) が存在するが本書では未移植領域として割愛。

---
## 共通仕様 / ポリシー現状
- 認証判定: Cookie に `sb-access-token` が存在しない、または `PUBLIC_HOST` と一致する Host の場合 "public request" として振る舞う。
- 公開コンテンツの所有者スコープ: `PUBLIC_PROFILE_EMAIL` で users テーブルから owner の `id` を引き当て、一覧系クエリ時に `user_id = ownerId` で絞り込み。
- エラーハンドリング: ほぼ全ルートで Supabase error は `status:500` + `{ error: message }` か `{ data: [] }` にフォールバック。レスポンス形は統一されていない。
- 型変換: DB カラム → フロント期待 shape に都度 map。型安全 (Zod 等) 未導入。
- キャッシュ: `/api/products` の public shallow list に 10s のメモリキャッシュ (Node プロセス内 Map)。他は未実装。HTTP キャッシュは products shallow のみ `Cache-Control: public, max-age=10`。
- ページネーション: `/api/products` のみ `limit` + `offset` + 任意 `count=true`。他ルートは全件返却。
- 公開画像 URL: `getPublicImageUrl` で R2 / CDN 変換。
- 画像配信ポリシー: 実行時のユニーク変換は原則廃止。保存時に 400px/800px を事前生成し、固定名 (`thumb-400.jpg` / `detail-800.jpg`) で R2 に保存。API は `images[].basePath` を返し、クライアントは `${R2_PUBLIC_URL}/${basePath}/thumb-400.jpg` 等を組み立てて利用。

---
## `/api/products`
### 用途
商品一覧 / 詳細 / モーダル表示用。Shallow モードで軽量一覧、Full モードで画像や affiliateLinks を含む詳細。

### クエリパラメータ
| パラメータ | 説明 |
|------------|------|
| `id` | 特定商品 ID 取得 (owner 絞り込み無視) |
| `slug` | 特定商品 slug 取得 (owner 絞り込み無視) |
| `tag` | `tags` JSONB 配列に特定タグを含む商品 |
| `published=true` | 公開商品のみ (public 判定に影響) |
| `shallow=true` / `list=true` | Shallow レスポンス (軽量) |
| `limit` | ページサイズ (shallow 未指定時も可) |
| `offset` | オフセット |
| `count=true` | Supabase exact count を要求 (遅いパス) |

### Public 判定と owner 絞り込み
`published=true` または access cookie 不在 または Host が `PUBLIC_HOST` → public request。public 且つ `id/slug` 未指定 (一覧) の場合 `user_id = ownerUserId` を追加。

### Shallow レスポンス shape
```json
{
  "data": [
    {
      "id": "...",
      "userId": "...",
      "title": "...",
      "slug": "...",
      "tags": ["tag1"],
      "price": 1234,
      "published": true,
      "createdAt": "...",
      "updatedAt": "...",
      "image": { "url": "https://cdn/...", "width": 400, "height": null, "role": null }
    }
  ],
  "meta": { "total": 240, "limit": 24, "offset": 0 }
}
```

### Full レスポンス追加要素
`shortDescription`, `body`, `showPrice`, `notes`, `relatedLinks`, `images[]`, `affiliateLinks[]`

画像項目に関する補足:
- `images[].url`: 後方互換のため引き続き返却（既定は 800px 版のURL）。
- `images[].basePath`: 追加。固定ファイル名で参照するためのベースパス。例: `products/<productId>/<imageId>`。

### キャッシュ
- Public + shallow + `count` 未指定の場合: 10s メモリキャッシュ。
- `Cache-Control: public, max-age=10` (public shallow のみ)。

### CDN サムネイル最適化
Shallow 商品画像は canonical URL から SHA256 ハッシュで `thumbnails/<hash>-400x0.jpg` を組み立て、`CDN_BASE_URL` が存在すればその URL を返す最適化 (存在確認はしない推測生成)。

### 既知課題 / 移植注意
- Shallow/full の動的 select 文字列を Hono では安全に列挙 (Injection 回避) 必要。
- メモリキャッシュは Workers では不可 → Cloudflare Cache API へ移行、Key に full query string。
- `count=true` は高コスト → Workers 移植時に usage を明示 / optional pre-computed index 検討。
- 画像 CDN 推測 URL はオブジェクト未存在時 404 の可能性。存在確認戦略要検討。

---
## `/api/collections`
### 用途
公開コレクションと内部に紐づく公開商品一覧を一括取得。

### 挙動
1. `collections` (visibility='public') を取得。
2. `collection_items` で product_id を集約。
3. 該当 products + `product_images` + `affiliate_links` を取得 (published=true)。
4. public request の場合 owner 絞り込み。
5. 各コレクションに属する products を map。

### レスポンス例 (要約)
```json
{
  "data": [
    {
      "id": "...",
      "title": "...",
      "products": [ { "id": "...", "images": [ {"url": "..."} ] } ]
    }
  ]
}
```

### 既知課題 / 移植注意
- N+1 潜在: `collection_items` → `products` は一括だが画像/links は join 的取得。最適化余地。
- ページネーションなし。件数増加時に肥大化。
- visibility 以外のフィルタ (タグ等) 未サポート。

---
## `/api/profile`
### 用途
公開ページ上部プロフィール表示。

### 挙動
- `PUBLIC_PROFILE_EMAIL` で users 行を取得。
- 未存在時はプレースホルダ静的データ返却 (基礎 UI 常時表示目的)。

### レスポンス例
```json
{ "data": { "id": "...", "displayName": "...", "avatarUrl": "...", "headerImages": ["..."], "bio": "..." } }
```

### 既知課題 / 移植注意
- プレースホルダを返す条件を明確化 (移植後も同一保証)。
- 複数 `header_image_keys` の場合最初を `headerImage` として利用するロジック維持。
- null 正規化未統一 (型スキーマ導入要)。

---
## `/api/recipes`
### 用途
レシピ一覧 + 画像 + ピン (商品タグ) 情報。

### 挙動
1. `getOwnerUserId()` で owner 判定。
2. owner あり → その user の recipes 全件 (未公開含む)。
   owner なし → `published=true` の公開レシピ。
3. `recipe_pins` を recipe_id IN (...) で取得。
4. pins を多岐の column バリアント名から正規化 (旧/新カラム互換)。
5. images は `recipes.images` JSONB をそのまま map。`base_image_id` があれば先頭に並べ替え。

### レスポンス例 (要約)
```json
{
  "data": [
    {
      "id": "...",
      "images": [{"url": "..."}],
      "pins": [{"productId": "...", "dotXPercent": 12.3 }]
    }
  ]
}
```

### 既知課題 / 移植注意
- 大量 pins / images 時の payload 圧縮なし。
- ページネーションなし。
- JSONB images スキーマ未検証。Zod 導入で壊れた行検出を追加する価値あり。

---
## `/api/tags`
### 用途
公開タグ一覧 (UI のフィルタ/グルーピング生成)。

### 挙動
- `tags` テーブルを `sort_order` → `created_at` で並び替え。
- 失敗時は `{ data: [] }`。

### レスポンス例
```json
{ "data": [{"id": "...", "name": "...", "group": "..."}] }
```

### 既知課題 / 移植注意
- オーナー絞り込み無し (全タグ)。公開表示が意図と一致しているか要確認。
- group 別ソート/フィルタ API 追加余地。

---
## `/api/tag-groups`
### 用途
タググループメタ (サイドメニュー分類)。

### 挙動
1. ownerUserId 解決必須 (失敗時空配列)。
2. `user_id` カラム存在を前提に query。存在しないエラー検知時グローバル fallback を再度 query。

### レスポンス例
```json
{ "data": [{"name": "season", "label": "季節", "sort_order": 1}] }
```

### 既知課題 / 移植注意
- Column 有無で分岐する互換処理は移植後にスキーマ固定化で削除可能。
- owner 解決失敗時は空配列 → UI の挙動 (崩壊しないか) 確認。

---
## `/api/amazon-sale-schedules`
### 用途
セールスケジュール (現状スタブ)。

### 現状挙動
常に `[]` を返却。

### 移植注意
- 将来: schedule → collection リンクで商品バッジを計算。別モデル設計 (開始/終了, discountType 等) 必要。

---
## `/api/images/thumbnail`（任意・移行フェーズ限定）
### 用途
任意画像を指定サイズ (幅 w / 高さ h) JPEG サムネイル化しキャッシュ。R2 + CDN 統合。

### クエリパラメータ
| パラメータ | 説明 |
|------------|------|
| `url` | 変換元絶対 URL |
| `key` | R2 内オブジェクトキー (url 代替) |
| `w` | 出力幅 (デフォルト 200) |
| `h` | 出力高さ (0=自動) |

`url` / `key` のどちらか必須。

### 主ロジック
1. 入力 `src` 正規化: 多重 percent-encoding, 多重 `/api/images/thumbnail` ラップを最大 5 回 unwrap。
2. ホスト許可判定: `ALLOWED_IMAGE_HOSTS` または `PUBLIC_HOST`/R2/公開 R2 URL/CDN host。非生産 (`NODE_ENV !== production`) は緩和。
3. ハッシュキー: `sha256(src|w=..|h=..)` → `thumbnails/<hash>-<w>x<h>.jpg`。
4. R2 利用可能なら HeadObject で存在確認 → あれば即取得/返却。
5. 未存在なら取得→ Sharp でリサイズ → R2 Put。
6. `CDN_BASE_URL` 設定時は 307 redirect で CDN パスに誘導。無ければバイナリ直接返却。
7. R2 未構成時は URL ソースからオンザフライ生成して返却。

### レスポンス
- 成功: `image/jpeg` バイナリ、`Cache-Control: public, max-age=31536000, immutable`
- 失敗: `{ error: ... }` + 適切なステータスコード。

### 既知課題 / 移植注意
- 本ルートは「事前生成方式」への移行に伴い利用を縮小/廃止予定。互換維持が必要な期間のみ提供。
- Workers 環境では Node/Sharp 非対応 → 採用しない方針（実行時変換を避ける）。
- R2 認証: S3Client を Workers (fetch-based) へ移行する必要は原則無し（事前生成は Next 管理API側で実行）。

---
## 環境変数一覧 (参照検知)
| 変数 | 用途 |
|------|------|
| `SUPABASE_URL` | Supabase 接続 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 管理権限キー (server サイド専用) |
| `PUBLIC_PROFILE_EMAIL` | 公開表示用オーナー email 参照 |
| `PUBLIC_HOST` / `NEXT_PUBLIC_PUBLIC_HOST` | public request 判定用ホスト名 |
| `CDN_BASE_URL` / `NEXT_PUBLIC_CDN_BASE` | 画像 CDN のベース URL |
| `CLOUDFLARE_ACCOUNT_ID` / `R2_ACCOUNT` | R2 アカウント ID |
| `R2_ACCESS_KEY_ID` / `R2_ACCESS_KEY` | R2 認証 (access key) |
| `R2_SECRET_ACCESS_KEY` / `R2_SECRET` | R2 認証 (secret) |
| `R2_BUCKET` | R2 バケット名 (既定 `images`) |
| `NEXT_PUBLIC_R2_PUBLIC_URL` / `R2_PUBLIC_URL` | 公開 R2 エンドポイント URL |
| `ALLOWED_IMAGE_HOSTS` | サムネイル元許可ホスト一覧 (カンマ区切り) |
| `NODE_ENV` | 開発/本番分岐 (許可ホスト緩和) |

### セキュリティ懸念
- Service Role Key が同一プロセスに存在するため認証境界不明瞭。Workers 移行時は KV / Secrets を server 側のみ露出。
- 画像変換で外部 URL fetch → SSRF 対策はホスト allowlist のみ。追加でスキーム検証 (http/https 強制) とサイズ制限 (Content-Length) 推奨。

---
## Workers (Hono) 移植ガイドライン (初期提案)
| 項目 | 提案 |
|------|------|
| ルーティング | Hono インスタンスに `/products`, `/collections` 等マウント。画像は別 Worker も可。 |
| 型検証 | Zod で query params & 出力スキーマ確定。バージョンタグ付与。 |
| キャッシュ | Cloudflare Cache API: Key = `URL.pathname + URL.search`; TTL 10s → Adjustable。 |
| Supabase | fetch-based client生成 (service role keyは Secrets)。ownerId は Durable Object / KV に短期キャッシュ。 |
| 画像処理 | Cloudflare Images もしくは zone Image Resizing を利用し変換パラメータを URL に encode。R2 生成が必要なら WASM sharp を後段検証。 |
| エラーフォーマット | `{ error: { code, message }, meta: {...} }` の統一。 |
| ログ | request id (UUID) を生成し `console.log` に構造化出力。 Workers Logpush 連携を前提。 |
| ページネーション | 全一覧系 (`collections`, `recipes`) に `limit/offset` 導入。 |
| レスポンスヘッダ | `Cache-Control`, `ETag`, `Content-Type`, `X-Request-Id`. |
| スロットリング | `/products` shallow への過剰アクセスに rate limit (Workers Durable/Turnstile)。 |

### 優先移植順
1. `products` (public shallow 一覧依存度最上位)
2. `profile`
3. `collections`
4. `recipes`
5. `tags` / `tag-groups`
6. `amazon-sale-schedules` (拡張実装)
7. `images/thumbnail` (代替手段選定後)

### 追加検討事項
- 正規化: `published` フラグ + owner scope の判定一元化 Middleware 化。
- Observability: Query 時間計測を Workers に残し Logpush / Analytics に転送。
- Response Size Monitoring: 大規模 payload (recipes pins) で gzip/brotli 圧縮率測定。

---
## 既存課題まとめ
| 課題 | 影響 | 移植時対応 |
|------|------|------------|
| レスポンス shape 非統一 | クライアント実装複雑化 | 共通ラッパ導入 |
| ページネーション不足 | 増加時パフォーマンス低下 | `limit/offset`, cursors |
| キャッシュ戦略弱い | 無駄な再フェッチ | Cache API + stale-while-revalidate |
| 画像処理 Node 依存 | Workers 非互換 | Cloudflare Images / WASM |
| SSRF 対策簡易 | セキュリティリスク | サイズ/スキーム検証追加 |
| owner 解決重複 | パフォーマンス低下 | KV キャッシュ + lazy refresh |
| エラー形式不統一 | 監視困難 | 標準エラー envelope |

---
## 次アクション (実装側)
1. Hono プロジェクト scaffold と共通 `createAppContext()` (Supabase client, ownerId cache)。
2. `/products` ルート移植 (query param parsing + cache + shallow/full 変換)。
3. 型 & Zod スキーマ導入。ドキュメント差分ファイル作成。
4. Cloudflare Image 手段検証 (PoC)。
5. 共通エラーレスポンス / ロギングユーティリティ追加。

移植開始前に本ファイル内容の確認 & 追加要望があれば追記してください。
