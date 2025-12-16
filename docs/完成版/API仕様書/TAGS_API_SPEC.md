# タグ API 仕様書＆実装チェックレポート

このドキュメントは「タグ（`tags` テーブル）」に関する API をまとめたものです。admin サイト（`admin-site`）からの呼び出しを想定し、public-worker 側の実装状況、エンドポイント仕様、呼び出し例、返却フォーマット、テーブル想定スキーマ、サンプルを記載しています。

---

**現状（実装場所）**
- admin サイト側エンドポイント（ブラウザ→同一オリジン）: `admin-site/app/api/tags/route.ts`（`forwardToPublicWorker` 経由で public-worker に中継されるプロキシがある想定）。
- public-worker 実装: `public-worker/src/index.ts` に管理向けのタグ関連エンドポイントが実装されています（`GET /api/admin/tags`, `POST /api/admin/tags/*`, `POST /api/admin/tags/reorder` など）。

---

## 目的（管理画面で必要な主な API）
1. タグ一覧を取得する API（ユーザーごと）
2. 単一タグを取得する API（編集画面用）
3. タグを作成 / 一括 upsert する API
4. タグを更新する API
5. タグを削除する API
6. 並び順（`sort_order`）や `group` を一括反映する `reorder` API
7. クライアント（public）向けタグ一覧（user-scoped）

---

## 1) タグ一覧を取得する API
- 実装場所: `public-worker/src/index.ts` — `GET /api/admin/tags`
- 呼び出し例（admin クライアント）: `GET /api/admin/tags`（または same-origin `/api/tags` を admin サーバーが proxy で forward）
- 推奨呼び出し:
  - URL: `GET https://admin.shirasame.com/api/admin/tags`
  - ヘッダ: セッション cookie（`sb-access-token`）や `Authorization: Bearer <token>`
  - クエリパラメータ（実装によりサポート）: `id`, `userId`, `limit`, `offset`, `shallow`
- 返却（成功）:
  - JSON: `{ ok: true, data: [ ...tags ], meta?: { total, limit, offset } }`
  - item 例:

```json
{
  "id": "tag-1763815665826-638",
  "user_id": "7b9743e9-fb19-4fb7-9512-c6c24e1d5ef4",
  "name": "Amazon",
  "group": "リンク先",
  "link_url": null,
  "link_label": "Amazonで見る",
  "sort_order": 3,
  "created_at": "2025-11-22T12:47:47.226991+00"
}
```

---

## 2) 単一タグ取得 API（編集画面用）
- 実装場所: `GET /api/admin/tags/:id` または `GET /api/admin/tags?id=<id>`（public-worker）
- 呼び出し: `GET /api/admin/tags/<id>`
- ヘッダ: セッション cookie / Authorization
- 返却: `{ ok: true, data: <tag> }`

---

## 3) タグ作成 / upsert（複数）
- 実装場所: 例: `POST /api/admin/tags/save`（upsert） / `POST /api/admin/tags/custom`（create）
- 呼び出し:
  - URL: `POST https://admin.shirasame.com/api/admin/tags/save`
  - ヘッダ: `Content-Type: application/json` + セッション cookie
  - ボディ例:

```json
{
  "tags": [
    { "id": "optional-id", "name": "タグ名", "group": "グループ名", "linkUrl": "", "linkLabel": "", "sortOrder": 1 }
  ],
  "userId": "optional-for-admin"
}
```

- サーバ側注意点:
  - RLS 環境ではワーカー側で `user_id` を解決して付与することを推奨します（クライアント任せにしない）。
  - DB が更新後の行を返さない環境があるため、アップサート後にクライアントが `GET /api/admin/tags` を再フェッチする運用を推奨します。
- 返却:
  - 成功: `{ ok: true, data: [ <created_or_updated_rows_or_provisional_objects> ] }`

---

## 4) タグ更新 API
- 実装場所: `PUT /api/admin/tags/:id`（public-worker）
- 呼び出し:
  - URL: `PUT https://admin.shirasame.com/api/admin/tags/<id>`
  - ヘッダ: `Content-Type: application/json` + セッション cookie
  - ボディ: 部分更新を想定（`name`, `group`, `linkUrl`, `linkLabel`, `sortOrder` 等）
- 権限: 呼び出しユーザーが対象 `tag.user_id` と同一、または admin 権限が必要
- 返却: `{ ok: true, data: <updated_tag> }`

---

## 5) タグ削除 API
- 実装場所: `DELETE /api/admin/tags/:id` または bulk で `DELETE /api/admin/tags`（実装に依存）
- 呼び出し例:
  - `DELETE https://admin.shirasame.com/api/admin/tags/<id>`
  - または `POST/DELETE` で `{ ids: [...] }` を受け付ける実装もある
- 権限: 所有者または admin のみ
- 返却: `{ ok: true, data?: <deleted_rows> }`

---

## 6) 並び替え（reorder）API
- 実装場所: `POST /api/admin/tags/reorder`
- 目的: UI のドラッグ＆ドロップ結果を永続化する軽量エンドポイント
- ボディ例:

```json
{
  "tags": [
    { "id": "tag-...", "order": 1 },
    { "id": "tag-...", "order": 2 }
  ],
  "userId": "optional-for-admin"
}
```

- 実装ノート: 一括 UPDATE / トランザクションでの更新を推奨します（逐次 UPDATE は途中失敗で整合性が崩れるリスク）。
- 返却: `{ ok: true }` または `{ ok: true, updated: <count> }`

---

## 7) クライアント向け一覧（public / user-scoped）
- 実装場所: `GET /api/tags`（user-scoped, public-facing）
- 説明: ブラウザからの通常のタグ一覧取得。HttpOnly cookie による認証で user スコープを解決するのが基本。
- 返却例: `{ data: [ { id, name, group, linkUrl, linkLabel } ] }`（フロントで camelCase に整形して返すことが多い）

---

## tags テーブル想定スキーマ（抜粋）
- `tags` テーブル（例）:
  - `id`: text (PK)
  - `user_id`: text
  - `name`: text
  - `group`: text (nullable)
  - `link_url`: text (nullable)
  - `link_label`: text (nullable)
  - `sort_order`: integer (nullable)
  - `created_at`, `updated_at`: timestamp

注意: 環境によっては `created_at`/`updated_at` が存在しない場合があるため、INSERT 時に不要フィールドを渡すと 500 エラーになる可能性があります。ワーカー側は不要なタイムスタンプを挿入しない設計が望ましいです。

---

## 実装チェックリスト
- [x] 管理向け一覧取得（`GET /api/admin/tags`）が存在することを確認
- [x] 一括 upsert / create のエンドポイント（`POST /api/admin/tags/save` 等）があることを確認（実装に依存）
- [x] `POST /api/admin/tags/reorder` が利用可能であることを確認
- [x] 書き込み系ハンドラが RLS 環境で動くように、リクエスト者のトークンを Supabase クライアントにセットするかサービスロールを使用する実装であることを確認
- [ ] 必要なら `GET /api/tags`（client-facing）で camelCase 整形レスポンスを用意する

---

## サンプルリクエスト / レスポンス
- GET `/api/admin/tags` レスポンス例:

```json
{
  "ok": true,
  "data": [
    {
      "id": "tag-1763815665826-638",
      "user_id": "7b9743e9-fb19-4fb7-9512-c6c24e1d5ef4",
      "name": "Amazon",
      "group": "リンク先",
      "link_url": null,
      "link_label": "Amazonで見る",
      "sort_order": 3,
      "created_at": "2025-11-22T12:47:47.226991+00"
    }
  ]
}
```

- POST `/api/admin/tags/reorder` ボディ例:

```json
{
  "tags": [
    { "id": "tag-1", "order": 0 },
    { "id": "tag-2", "order": 1 }
  ]
}
```

---

## 推奨・注意点
- 保存操作後は `/api/admin/tags` を再フェッチして authoritative なリストで UI を置き換えてください。特に RLS により書き込み後に行が SELECT できない環境では重要です。
- 並び替えは可能な限りトランザクションまたは一括 SQL 更新で処理してください。
- クライアントは `name` の重複を事前にチェックし、サーバ側でも重複防止を行ってください。

---

## 次アクション候補
- admin 側での保存後に `/api/admin/tags` を再取得する小さなパッチを admin-site に追加（希望があれば実装します）
- `tags` の bulk delete / bulk upsert のエンドポイント仕様を OpenAPI に変換して `/api/docs` で公開する

---

ファイル: `docs/完成版/TAGS_API_SPEC.clean.md`
