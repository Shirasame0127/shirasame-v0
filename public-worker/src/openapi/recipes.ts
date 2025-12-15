export const recipesPaths = {
  '/api/recipes': {
    get: {
      tags: ['レシピ'],
      summary: 'レシピ一覧を取得します',
      description: 'ユーザーのレシピ一覧を取得します（ページネーション対応）。',
      parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: '上限' }, { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'オフセット' }],
      responses: { '200': { description: '正常', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' } } } }, total: { type: 'integer' } } } } } }
    }
  },
  '/api/recipes/{id}': {
    get: {
      tags: ['レシピ'],
      summary: 'レシピを取得します',
      parameters: [{ name:'id', in:'path', required:true, schema:{type:'string'}, description: 'レシピ ID' }],
      responses:{ '200': { description:'正常', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, steps: { type: 'array', items: { type: 'string' } } } } } } }, '404': { description: '見つかりません' } }
    }
  }
}
export default recipesPaths
