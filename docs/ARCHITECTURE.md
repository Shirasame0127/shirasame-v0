**アプリ概要と構成**

- フレームワーク: Next.js (App Router, TypeScript)
- DB: Supabase（Postgres）
- ストレージ/CDN: Cloudflare R2 を一次バイナリストアとして想定。Cloudflare Images / Supabase Storage がフォールバックに使われることがある。
- クライアント: React（Next.js）、クライアント側に軽量キャッシュ (`lib/db/storage.ts`) を持つ
- 管理 UI: `app/admin/*` 内に配置され、API エンドポイントは `app/api/admin/*` にある
- 公開 API: `app/api/*`（パブリック用）、管理 API は認証・オーナーチェックを行うことを想定

**主要フォルダ（抜粋）**
- `app/` — Next.js App Router ページ、API ルート、管理ページ
- `components/` — UI コンポーネント
- `lib/` — DB / 画像 URL 正規化 / 公開 URL 生成 / クライアントキャッシュ
- `app/api/` — API エンドポイント（公開・管理共存）
- `sql/` — マイグレーションおよび初期スクリプトの置き場

**重要な設計決定（要注意）**
- 画像保存: アップロードは Cloudflare R2 を第一候補として利用し、公開される URL は `NEXT_PUBLIC_R2_PUBLIC_URL` を基に正規化される。アップロード API は `/api/images/upload`。
- レシピ画像: `recipes.images`（`jsonb`）に画像配列を保存する設計が採用されている。
- ピン情報: `recipes.pins`（`jsonb`）と `recipe_pins`（正規化テーブル）が共存している場合がある。どちらかに一本化する方針を検討すること。
- DB 型の不整合: `users.id` が `uuid` なのに他テーブルの `user_id` のまま残っているケースがある。新しい FK 制約を付与する前に型を揃えること。

---

## 移行方針サマリー（画像・ピンの一本化）

現在のコードベースでは、同じ概念（画像メタ・ピン情報）が複数箇所に分散しているため、運用上のリスクが高くなっています。以下は推奨される方針です。

- 短期（推奨）: `recipes.images`（jsonb）および `recipes.pins`（jsonb）を「公式の単一ソース」とする。理由は、公開ページでの取り扱いやすさと既存 API との互換性が高いためです。
	- 手順（概略）: ①バックアップ（`*_backup` テーブル）→ ②`recipe_pins` の集約（recipe 単位で jsonb 化）→ ③`recipes.pins` へマージ→ ④検証→ ⑤アーカイブ（テーブル名を変更）

- 長期（必要に応じて）: 大規模検索・フィルタ要件が増える場合は正規化テーブル（`recipe_pins`）を主データとして採用する方針に切り替えられます。その際は FK、インデックス、型の一致を厳密に設計してください。

## ピン（pins）の保存スタイル（推奨 JSON スキーマ）

フロントエンドとバックエンドが確実に整合するよう、`recipes.pins` に保存するオブジェクトは下記の形を推奨します（キー名は camelCase をクライアント側で使用し、DB 保存時は snake_case に変換しても可）。

```
{
	"id": "pin-...",
	"productId": "prod-..." | null,
	"userId": "399e...",           // 可能なら UUID 文字列で統一
	"dotXPercent": 44.79,           // 数値で保持（保存時に parseFloat を行う）
	"dotYPercent": 24.09,
	"tagXPercent": 80,
	"tagYPercent": 52.81,
	"styling": {
		"dotSizePercent": 1.2,
		"tagFontSizePercent": 1.4,
		"lineWidthPercent": 0.2,
		"tagPaddingXPercent": 1.2,
		"tagPaddingYPercent": 0.6,
		"tagBorderRadiusPercent": 0.4,
		"colors": {
			"dotColor": "#ffffff",
			"tagTextColor": "#ffffff",
			"tagBackgroundColor": "#000000"
		}
	}
}
```

保存時のルール:
- 数値は文字列で受け取る場合でもサーバー側で数値に正規化してから保存すること。
- `id` はユニークであること（`pin-UUID` の形式推奨）。
- ピン追加/更新の API は必ずオーナー・権限チェックを行うこと。

詳細な移行手順と SQL の例は `docs/MIGRATION_GUIDE.md` を参照してください。

**動作フロー（画像アップロード例）**
1. クライアントが `POST /api/images/upload` に画像（file または data URL）を送る。
2. サーバーは R2 に保存を試み、成功したら公開 URL を正規化して返す。失敗時は Cloudflare Images や Supabase Storage にフォールバックする。
3. クライアントは返却された公開 URL（あるいは `variants` 配列）を使って UI を表示し、必要なら管理 API を通じて DB に保存する（例: `recipes.images` に push）。

**運用上の注意**
- 環境変数（例: `NEXT_PUBLIC_R2_PUBLIC_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`）は各デプロイ環境で正しく設定してください。
- 画像の公開ポリシーとキャッシュ制御を明文化しておくこと（CDN TTL 等）。
- API の変更は後方互換を保つように `imageDataUrl` のようなフォールバックフィールドを残す。

(詳しい API 列挙は `API.md` を参照)