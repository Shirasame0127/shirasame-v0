# Workers Public API 指針（画像 basePath ポリシー含む）

本ドキュメントは公開向け API を Cloudflare Workers（Hono 等）で提供する際の統一方針を示します。特に画像配信は「実行時変換を避け、保存時に2サイズ（400/800）を事前生成し R2 に固定名で保存・直接配信」を基本とします。

## エンドポイント（例）
- `GET /products`（一覧/詳細）
- `GET /collections`
- `GET /recipes`
- `GET /profile`
- `GET /tags`
- `GET /tag-groups`

必要に応じて `?published=true&shallow=true&limit&offset` 等のクエリを許可。

## 画像ポリシー（必須）
- 保存API（管理側）が原画像から以下2サイズを事前生成:
  - `<basePath>/thumb-400.jpg`
  - `<basePath>/detail-800.jpg`
  - 付随: 同名 `.webp` を追加生成（`thumb-400.webp` / `detail-800.webp`）。クライアント側の将来最適化用で、APIレスポンス形は変更しない。
- 公開APIは各画像項目に `basePath` を含めて返す。
- クライアントは `R2_PUBLIC_URL` を用いて固定ファイル名で直接参照する:
  - 一覧/サムネ: `${R2_PUBLIC_URL}/${basePath}/thumb-400.jpg`
  - 詳細/モーダル: `${R2_PUBLIC_URL}/${basePath}/detail-800.jpg`
- 旧 `thumbnail` 互換APIは移行期間のみ提供（原則廃止）。

## レスポンス例（/products shallow）
```json
{
  "data": [
    {
      "id": "...",
      "title": "...",
      "image": {
        "url": "https://r2-public/.../thumb-400.jpg",
        "width": 400,
        "height": 300,
        "role": null,
        "basePath": "products/<productId>/<imageId>"
      }
    }
  ],
  "meta": { "limit": 24, "offset": 0, "total": 120 }
}
```

## キャッシュ
- `GET /products?published=true&shallow=true` は Cloudflare Cache API で 10s など短TTL + ETag 対応。
- その他は要件に応じ TTL を設定（stale-while-revalidate 推奨）。

## 環境変数
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `PUBLIC_PROFILE_EMAIL`, `PUBLIC_HOST`（公開スコープ判定）
- `R2_PUBLIC_URL`（= `NEXT_PUBLIC_R2_PUBLIC_URL` 相当）

## セキュリティ
- Service Role Key は Workers Secrets にのみ配置。クライアントへは露出しない。

## 備考
- 本方針は「ユニーク変換課金（Cloudflare Images など）」を避け、配信コストを最小化することを目的とします。
