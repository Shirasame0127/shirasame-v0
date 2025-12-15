export const tagsPaths = {
  '/api/tags': { get: { tags: ['タグ'], summary: 'タグ一覧を取得します', description: 'ユーザーに紐づくタグ一覧を返します', responses: { '200': { description: '正常', content: { 'application/json': { schema:{ type:'object' } } } } } },
  '/api/admin/tags': { post: { tags: ['タグ'], summary: 'タグを1件作成します', description: '新しいタグを作成します。（同名・同グループは重複扱い）', responses: { '200': { description: '作成済み' }, '400': { description: '重複や無効な入力' } }, security: [{ bearerAuth: [] }] }, delete: { tags: ['タグ'], summary: 'タグを削除します', responses: { '200': { description: '削除済み' } }, security: [{ bearerAuth: [] }] } },
  '/api/admin/tags/save': { post: { tags: ['タグ'], summary: '複数タグの upsert（保存）', description: '配列で渡したタグを挿入または更新します', responses: { '200': { description: '保存済み' } }, security: [{ bearerAuth: [] }] } },
  '/api/admin/tags/custom': { post: { tags: ['タグ'], summary: '複数タグの作成（重複除外）', responses: { '200': { description: '作成済み' } }, security: [{ bearerAuth: [] }] } },
  '/api/admin/tags/reorder': { post: { tags: ['タグ'], summary: 'タグの並び替え', description: 'sort_order と group を更新します', responses: { '200': { description: '更新済み' }, '403': { description: '権限なし／見つからない' } }, security: [{ bearerAuth: [] }] } }
}
export default tagsPaths
