---
title: INTERNAL_API_BASE Hardenning Guide
---

目的: `INTERNAL_API_BASE`（内部 API / 管理用 API）側で受け取る認証情報を厳格に検証し、リクエストごとに `user_id`（owner）チェックを行うための設計案と実装例を示します。Worker は `Authorization` ヘッダ・Cookie を転送していますが、upstream 側でも必ず検証を実施してください。

前提:
- 環境変数: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`（管理目的ならサービスロールは極力使わない）、`JWKS_URL`（Supabase jwks の場所）
- 推奨: DB 側に RLS（Row-Level Security）を設定して owner チェックを強制する（最終防衛線）。

推奨アプローチ（優先順位）:
1. JWT の署名検証（JWKs）を行い、`sub` / `user_id` を取得する。`jose` 等を利用する。
2. 検証できない場合のフォールバックとして `GET ${SUPABASE_URL}/auth/v1/user` でトークンを検証して user を取得する（ただし頻繁呼び出しはキャッシュを使う）。
3. 取得した `user_id` を用いて SQL で `WHERE user_id = :user_id` を必須付与するか、RLS ポリシーで強制する。

例: Node.js (Express) ミドルウェア（jose を使用）

```js
// express-middleware example (Node.js)
// npm i jose node-fetch
const { jwtVerify, createRemoteJWKSet } = require('jose');
const fetch = require('node-fetch');

const JWKS_URL = process.env.JWKS_URL; // e.g. https://<supabase-url>/.well-known/jwks.json
const jwks = createRemoteJWKSet(new URL(JWKS_URL));

async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization;
    const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : (req.cookies['sb-access-token']);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    // JWT 署名検証
    const { payload } = await jwtVerify(token, jwks, { algorithms: ['RS256'] });
    // payload.sub または payload.user_id を userId として扱う
    req.user = { id: payload.sub || payload.user_id };
    return next();
  } catch (err) {
    // フォールバック: Supabase /auth/v1/user で検証する
    try {
      const resp = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
        headers: { Authorization: `Bearer ${req.cookies['sb-access-token'] || ''}` }
      });
      if (!resp.ok) return res.status(401).json({ error: 'Unauthorized' });
      const user = await resp.json();
      req.user = { id: user.id };
      return next();
    } catch (e) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
}

// 利用例: route handler で owner チェックを強制
// SELECT * FROM products WHERE id = $1 AND user_id = $2
app.get('/admin/products', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  // クエリには必ず userId をバインドして owner スコープを付与する
});
```

クエリ側での強制付与（例: SQL）:

- 単純な強制: `SELECT * FROM products WHERE user_id = :userId`（管理用途）
- 詳細取得でも owner を確認: `SELECT * FROM products WHERE id = :id AND user_id = :userId`。見つからなければ 404/401 を返す。

RLS の例（Postgres / Supabase）:

```sql
-- テーブル: products(user_id uuid, ...)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their products" ON public.products
  FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid);
```

上記はアプリが接続時に `SET LOCAL app.current_user_id = '<user-id>'` を実行することを前提とする（あるいは JWT 連携で `jwt.claims` を使う）。RLS を使えばアプリ側のミスによる漏洩リスクを大幅に下げられる。

その他注意点:
- Worker が `Authorization` / Cookie を upstream に転送しているため、upstream はそれを信用して owner チェックを行うこと。Worker 側で勝手に owner を付けるのではなく、upstream 側も独立して検証を行うこと。
- キャッシュ: `/auth/v1/user` による検証はコストが高いため短時間キャッシュ（例: 30-60秒）をおすすめします。
- ログ: 失敗した認証や owner チェック失敗はセキュリティログとして収集すること。

まとめ: 上流の `INTERNAL_API_BASE` では必ずトークンの真正性確認（JWK 署名検証が理想）→ `user_id` の取得→DB/クエリに owner 条件を付与、もしくは RLS で強制する流れを実装してください。
