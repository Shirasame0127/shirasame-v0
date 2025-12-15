const collectionsPaths = {
  '/api/collections': {
    get: {
      tags: ['コレクション'],
      summary: 'コレクション一覧を取得します',
      description: 'ユーザーのコレクション一覧を返します。',
      responses: { '200': { description: '正常', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } } } } } } } }
    },
    post: {
      tags: ['コレクション'],
      summary: 'コレクションを作成します',
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] }, example: { name: '春のおすすめ' } } } },
      responses: { '200': { description: '作成済み' }, '400': { description: '無効な入力' } },
      security: [{ bearerAuth: [] }]
    }
  },
  '/api/collections/{id}': {
    get: {
      tags: ['コレクション'],
      summary: 'コレクションを取得します',
      parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'}, description: 'コレクション ID' }],
      responses:{ '200': { description:'正常' }, '404': { description: '見つかりません' } }
    }
  }
}
export default collectionsPaths;
