# 公開サブドメインの設定手順（`shirasame`）

このドキュメントは、公開用サブドメイン `shirasame` を割り当てて、このアプリの公開ページをそのサブドメインで配信するための手順をまとめたものです。

重要: `shirasame` はサブドメイン部分の例です。最終的な完全修飾ドメインは `shirasame.example.com` のようにルートドメインを付ける必要があります。

## 1) 全体の流れ（要点）
- ドメインプロバイダで `shirasame.<your-domain>` の DNS レコードを追加する。
- デプロイ先（Vercel / Netlify / Fly / 自前サーバ等）でサブドメインを紐付け、SSL を有効にする。
- （任意）Supabase 認証の Cookie ドメインをルートドメインに合わせて設定する（共有ログインが必要な場合）。
- 環境変数 `NEXT_PUBLIC_SITE_URL` 等を新しいサブドメインの URL に変更する。

---

## 2) DNS 設定（例）
- ルートドメイン: `example.com`（あなたのドメイン）
- 作成するサブドメイン: `shirasame.example.com`

Vercel などを使う場合は、ホスト側の指示に従って `CNAME`（または A レコード）を追加します。

例（CNAME）:

```
Type: CNAME
Name: shirasame
Value: cname.vercel-dns.com.   # デプロイ先の指示に合わせる
TTL: 自動
```

例（自前サーバ）:

```
Type: A
Name: shirasame
Value: 203.0.113.12    # サーバのIP
TTL: 自動
```

DNS 変更の反映には数分〜数時間かかる場合があります。

---

## 3) デプロイ先の設定
- Vercel の場合: Project > Domains > Add > `shirasame.example.com` を追加。Vercel が TLS 証明書を自動発行します。
- Netlify / Fly / その他: 各ホスティングの公式ドキュメントの手順に従ってドメインを追加してください。

---

## 4) Next.js / アプリ側の設定
- 環境変数（例）: デプロイ先のプロジェクトに次を追加してください。

```
NEXT_PUBLIC_SITE_URL=https://shirasame.example.com
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>  # サーバ側で使う場合
SUPABASE_JWT_SECRET=<jwt-secret>            # middleware でローカル検証する場合
```

- （注意）Supabase の Cookie ドメインを `example.com` のようにルートに設定しておくと、`shirasame.example.com` と `www.example.com` で同じ Cookie ドメインを共有できます。Supabase Console の Authentication > Settings > Cookie settings から設定します。

---

## 5) Supabase（Auth / Cookie）に関する注意
- サブドメインで認証を正しく共有したい場合、Supabase 側の `Site URL` と `Cookie domain` の設定を行ってください。
  - `Site URL` に `https://shirasame.example.com` を追加
  - `Cookie domain` を `example.com`（先頭にドットを付ける場合: `.example.com`）にすることで、サブドメイン間で Cookie を共有できます。
- セキュリティ上の注意: パブリックなプロジェクトでは、Cookie のドメイン設定と SameSite ポリシーを慎重に設定してください。

---

## 6) ミドルウェア / ルーティングに関する補足
- 本リポジトリの `middleware.ts` は `/admin` 以下のみを保護する設定になっており、公開ページはクッキー無しでも閲覧可能な仕様です（追加の変更不要）。
- もしホスト名で振り分けたい場合（例: `admin.example.com` を管理サイト、`shirasame.example.com` を公開サイトにする）、`middleware.ts` にホスト判定を追加できます。例:

```ts
// middleware.ts の一部
const host = req.nextUrl.hostname // ex: 'shirasame.example.com'
// 管理用ホストを別にするなら以下のように判定
if (host === 'admin.example.com' && pathname.startsWith('/admin')) {
  // 管理用の認証チェック
}
```

この変更は必須ではありません。通常はドメインをサブドメインに向け、`/admin` パスにアクセスする際に認証を求める現在の挙動で問題ありません。

---

## 7) ローカルでの検証（hosts を使う方法）
Windows の `hosts` を編集してローカルで `shirasame.test` などを割り当てることができます（管理者権限が必要）。

1. 管理者 PowerShell を開く
2. `C:\Windows\System32\drivers\etc\hosts` をエディタで開き、以下を追加:

```
127.0.0.1   shirasame.test
```

3. 開発サーバ起動:

```powershell
pnpm dev
```

4. ブラウザで `http://shirasame.test:3000` にアクセスして動作を確認します。

注意: `localhost` と同じポートで動作させるために、ホストヘッダを許容する開発サーバ設定が必要になる場合があります。Windows の hosts による検証は簡便ですが、HTTPS を伴うフロー（OAuth のリダイレクト等）は別途 TLS 証明書やローカルプロキシが必要です。

---

## 8) まとめ / 推奨手順
1. ルートドメインを決める（例: `example.com`）。
2. DNS に `shirasame.example.com` を追加し、デプロイ先の指示に従う。
3. デプロイ先でサブドメインを追加し、`NEXT_PUBLIC_SITE_URL` を更新してデプロイ。
4. 必要なら Supabase の Cookie 設定をルートドメインに合わせる。

必要なら、私のほうでこのリポジトリに `middleware` のホスト判定サンプルや、`next.config.mjs` の `experimental.domain` 型のメモ、あるいは `start-dev.ps1` をローカル検証向けに更新するパッチを当てられます。どれを希望しますか？
