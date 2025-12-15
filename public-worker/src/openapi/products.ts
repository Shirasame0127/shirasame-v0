export const productsPaths = {
  '/api/products': {
    get: {
      tags: ['商品'],
      summary: '商品一覧を取得します',
      description: 'ページネーション可能な商品一覧を取得します。認証済みユーザーのリソースを返します。',
      parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: '取得上限' },
        { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: '開始オフセット' }
      ],
      responses: { '200': { description: '正常', content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductList' } } } }, '401': { description: '未認証', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } },
      security: [{ bearerAuth: [] }]
    },
    post: {
      tags: ['商品'],
      summary: '新しい商品を作成します',
      description: '商品を作成します。管理者または該当ユーザーで実行してください。',
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, price: { type: 'number' }, description: { type: 'string' } }, required: ['title'] }, example: { title: 'テスト商品', price: 1234, description: '商品の説明' } } } },
      responses: { '200': { description: '作成済み', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } }, '400': { description: '無効な入力' }, '401': { description: '未認証' } },
      security: [{ bearerAuth: [] }]
    }
  },
  '/api/products/{id}': {
    get: {
      tags: ['商品'],
      summary: '商品を取得します',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: '商品 ID' }],
      responses: { '200': { description: '正常', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } }, '404': { description: '見つかりません' } },
      security: [{ bearerAuth: [] }]
    }
  }
}
export default productsPaths
