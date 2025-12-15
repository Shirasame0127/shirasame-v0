export const tagGroupsPaths = {
  '/api/tag-groups': {
    get: {
      tags: ['タググループ'],
      summary: 'タググループ一覧を取得します',
      responses: { '200': { description: '正常', content: { 'application/json': { schema: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, label: { type: 'string' } } } } }} } },
      security: [{ bearerAuth: [] }]
    },
    post: {
      tags: ['タググループ'],
      summary: 'タググループを作成します',
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, label: { type: 'string' } }, required: ['name'] }, example: { name: 'リンク先', label: 'リンク先' } } } },
      responses: { '200': { description: '作成済み' } },
      security: [{ bearerAuth: [] }]
    },
    put: {
      tags: ['タググループ'],
      summary: 'タググループ名を変更します',
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, newName: { type: 'string' }, label: { type: 'string' } }, required: ['name','newName'] }, example: { name: '旧名', newName: '新名', label: '新ラベル' } } } },
      responses: { '200': { description: '変更済み' } },
      security: [{ bearerAuth: [] }]
    },
    delete: {
      tags: ['タググループ'],
      summary: 'タググループを削除します',
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] }, example: { name: '不要グループ' } } } },
      responses: { '200': { description: '削除済み' } },
      security: [{ bearerAuth: [] }]
    }
  }
}
export default tagGroupsPaths;
