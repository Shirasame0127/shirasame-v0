# Tags API 仕様書

このドキュメントは管理画面・ワーカー側で提供されるタグ関連 API を整理したものです。

---

## 概要
- テーブル: `tags`
- 代表的なカラム（snake_case）:
  - `id` (text)
  - `user_id` (text)
  - `name` (text)
  - `group` (text | nullable)
  - `link_url` (text | nullable)
  - `link_label` (text | nullable)
  - `sort_order` (integer | nullable)
  - `created_at` (timestamp)

サンプルデータ:

```json
[{"idx":0,"id":"tag-1763815665826-638","name":"Amazon","group":"リンク先","link_url":null,"link_label":"Amazonで見る","user_id":"7b9743e9-fb19-4fb7-9512-c6c24e1d5ef4","created_at":"2025-11-22 12:47:47.226991+00","sort_order":3}]
```

---

## 共通ルール
- 認証: `resolveRequestUserContext` による検証を行います。ブラウザからは HttpOnly cookie (`sb-access-token`) を基本とし、必要に応じて `Authorization: Bearer <token>` も利用可能。
- スコープ: 書き込み系のエンドポイントは `user_id` スコープ内で実行します。管理者は `userId` を指定して他ユーザーの操作が可能（ただし `isAdmin` チェックあり）。
- レスポンス: 正常系は `{ ok: true, data: ... }`。エラーは `makeErrorResponse` に準拠する JSON を返します。

---

## エンドポイント一覧（管理）

1. GET `/api/admin/tags` — list / get-by-id
   - 説明: ユーザー固有のタグ一覧を取得。`?id=<id>` を指定すると単一項目を返す。
   - クエリ:
     - `id` (任意): 単一取得
     - `userId` (管理者のみ任意): 別ユーザーのタグを取得する
   - 認証: 必須
   - 返却例（一覧）:
     ```json
     { "ok": true, "data": [ { "id": "...", "name": "...", "group": "...", "link_url": null, "link_label": "...", "user_id": "...", "sort_order": 3, "created_at": "..." } ] }
     ```
   - 返却例（単一）:
     ```json
     { "ok": true, "data": { "id": "...", "name": "...", "group": "..." } }
     ```

2. POST `/api/admin/tags/save` — upsert multiple
   - 説明: 複数タグを一括で upsert（id があれば update、なければ insert）。重複（同名+同グループ）がある場合はエラー。
   - ボディ:
     ```json
     { "tags": [ { "id": "optional-id", "name": "タグ名", "group": "グループ名", "linkUrl": "", "linkLabel": "", "sortOrder": 1 } ], "userId": "optional-for-admin" }
     ```
   - 返却:
     ```json
     { "ok": true, "data": [ <created_or_updated_rows_or_provisional_objects> ] }
     ```
   - 備考: RLS 等で DB が更新後の行を返せない場合は `provisional: true` を付けたオブジェクトが返ることがあります。クライアントは保存完了後に `/api/admin/tags` を再フェッチすることを推奨します。

3. POST `/api/admin/tags/custom` — create (single/multiple) excluding duplicates
   - 説明: ユーザーのスコープで新しいタグを作成。重複があればエラー。
   - ボディ: 同上（`tags` 配列）
   - 返却: `{ ok: true, data: [ <inserted_rows> ] }`

4. POST `/api/admin/tags/reorder` — update sort_order / group
   - 説明: 並び順や group を複数反映する軽量エンドポイント。各要素は `{ id: 'tag-id', order: 2, group: 'カテゴリ' }`。
   - ボディ例:
     ```json
     { "tags": [ { "id": "tag-...", "order": 1 }, { "id": "tag-...", "order": 2 } ], "userId": "optional-for-admin" }
     ```
   - 返却: `{ ok: true }` またはエラー（更新対象が 0 件だった場合は 403 を返すことがあります）

5. DELETE `/api/admin/tags` — delete tag(s)
   - 説明: id または ids 指定でタグを削除する。管理者は `userId` を指定可能（権限チェックあり）。
   - ボディ例:
     ```json
     { "id": "tag-176...", "userId": "optional-for-admin" }
     // or
     { "ids": ["tag-1","tag-2"] }
     ```
   - 返却: `{ ok: true, data: [ <deleted_rows> ] }`

6. GET `/api/tags` — client-facing list (user-scoped)
   - 説明: ブラウザ側で通常使うタグ一覧。認証必須（cookie ベース）。
   - 返却: `{ data: [ ...mapped items...] }`（`name` を `name`, `group` を `group`、`link_url` -> `linkUrl` として整形）

---

## クライアント実装上の注意点
- 保存操作後は `/api/admin/tags` を再度フェッチして authoritative なリストで UI を上書きしてください。特に RLS によって書き込み後に行が SELECT できない環境では重要です。
- 並び替え（reorder）は fire-and-forget ではなく更新結果を監視し、エラーが返った場合は UI をロールバックしてください。
- 重複チェックはサーバ側で行われるため、クライアント側でも予防的に名前のユニーク性を示す UI を出すと UX が良くなります。

---

## 例: 新規タグ作成フロー（PowerShell/curl）

PowerShell (admin-site からの呼び出し想定):

```powershell
$uri = 'https://admin.shirasame.com/api/admin/tags/custom'
$body = @{ tags = @(@{ name = 'Amazon'; group = 'リンク先'; linkLabel = 'Amazonで見る' }) } | ConvertTo-Json
Invoke-RestMethod -Uri $uri -Method POST -Headers @{ 'Content-Type' = 'application/json' } -Body $body
```

curl:

```bash
curl -X POST 'https://admin.shirasame.com/api/admin/tags/custom' \
  -H 'Content-Type: application/json' \
  -d '{"tags":[{"name":"Amazon","group":"リンク先","linkLabel":"Amazonで見る"}] }'
```

---

必要なら、admin-site 側の `ProductsService` / `Tags` UI に対して「保存後に `/api/admin/tags` を再フェッチして authoritative な配列で置き換える」小さなパッチを作成します。希望があれば実装します。 

---

ファイル: `docs/完成版/TAGS_API_SPEC.md`

