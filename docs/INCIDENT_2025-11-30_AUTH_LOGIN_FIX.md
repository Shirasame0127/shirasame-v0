## **概要**
- **事象:** Google/メール認証後にリダイレクトやトークン更新が失敗し、`400 Bad Request`（特に `bad_json`）や再ログインループが発生。
- **期間:** 2025-11-30（開発環境）
- **影響:** 管理画面 `/admin` に遷移できない、または一定条件でセッション維持に失敗。

## **主原因**
- **誤ったリクエスト形式:** Supabase Auth のトークン交換/リフレッシュを `service role + application/x-www-form-urlencoded` で呼び出していた。
  - 正しい仕様は「`anon key` を `apikey` ヘッダに付与」「`application/json` でボディ送信」「`grant_type` はクエリパラメータ」。
- **補助要因:** `/auth/v1/user` 取得時に `apikey` を付与していなかったため、一部環境で検証が不安定。

## **観測されたエラー**
- ブラウザコンソール/Network:
  - `POST /api/auth/refresh 400 (Bad Request)` → Supabase が `{"error_code":"bad_json"}` を返却。
- サーバーログ:
  - `[middleware] remote /auth/v1/user returned non-ok: 401`
  - リフレッシュ失敗後に `sb-access-token` / `sb-refresh-token` がクリアされ、再ログイン誘導。

## **対応内容（ソース修正）**
- `callback` ルートのトークン交換を仕様準拠に変更。
  - `v0-samehome/app/api/auth/callback/route.ts`
    - `POST /auth/v1/token?grant_type=authorization_code`
    - ヘッダ: `Content-Type: application/json`, `apikey: <anon key>`
    - ボディ: `{ code, redirect_to }`
- `refresh` ルートを仕様準拠に変更（既に適合化済み）。
  - `v0-samehome/app/api/auth/refresh/route.ts`
    - `POST /auth/v1/token?grant_type=refresh_token`
    - ヘッダ: `Content-Type: application/json`, `apikey: <anon key>`
    - ボディ: `{ refresh_token }`
- ミドルウェアのユーザー検証で `apikey` を付与。
  - `v0-samehome/middleware.ts` の `/auth/v1/user` 取得ヘッダに `apikey`（anon key）追加。
- ログインページのUX改善（失敗時の可視化）。
  - `v0-samehome/app/admin/login/page.tsx`
    - `oauth_error` クエリに応じて日本語トースト表示。
  - `v0-samehome/lib/auth.ts`
    - Supabase エラーメッセージを日本語にマッピング（未確認メール、重複登録、認証失敗、パスワード短い、レート制限）。

## **環境前提と設定**
- `.env.local` に以下が必要:
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Supabase Auth 設定:
  - Redirect URLs: `http://localhost:3000/api/auth/callback`（必要に応じて 3001 も）
  - Site URL: `http://localhost:3000`
- Google OAuth クライアント:
  - Authorized redirect URI に `http://localhost:3000/api/auth/callback`

## **検証手順**
- Google 認証:
  - `GET /api/auth/google` → Supabase 認証 → `GET /api/auth/callback?code=...` → `302 /admin`。
  - レスポンスヘッダに `Set-Cookie: sb-access-token` 等が付与されていること。
- メール/パスワード:
  - `signUp` → メール確認 → `signInWithPassword` で `/admin` へ。
  - 失敗時、日本語トーストが期待通り表示されること。
- リフレッシュ:
  - 期限切れ後 `POST /api/auth/refresh` が 200 を返し、新しいトークン Cookie を設定すること（`sb-refresh-token` が存在する前提）。

## **再発防止/運用Tips**
- Supabase Auth の REST を直接叩く場合は、公式仕様（JSON + anon key + クエリ `grant_type`）を必ず参照。
- `/auth/v1/user` 取得時にも `apikey` を付ける（検証の安定化）。
- セッション復旧失敗（`refresh token` 不在）のときは 400 を過剰にリトライしない。必要に応じて 204 応答やUIトーストで再ログイン誘導を検討。

## **参考リンク**
- Supabase Auth ガイド: https://supabase.com/docs/guides/auth
- JS クライアント（OAuth/セッション）: https://supabase.com/docs/reference/javascript/auth-refreshsession
- GoTrue（Auth 実装）: https://github.com/supabase/gotrue
