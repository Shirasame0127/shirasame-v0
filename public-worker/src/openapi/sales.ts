export const salesPaths = {
  '/api/amazon-sale-schedules': {
    get: {
      tags: ['セール'],
      summary: 'セールスケジュール一覧を取得します',
      description: 'セールのスケジュールを取得します。',
      responses: { '200': { description: '正常', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, saleName: { type: 'string' }, startDate: { type: 'string', format: 'date-time' }, endDate: { type: 'string', format: 'date-time' } } } } } } } } }
    },
    post: {
      tags: ['セール'],
      summary: 'セールスケジュールを作成します',
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { saleName: { type: 'string' }, startDate: { type: 'string', format: 'date-time' }, endDate: { type: 'string', format: 'date-time' } }, required: ['saleName','startDate'] }, example: { saleName: 'ブラックフライデー', startDate: '2025-11-28T00:00:00Z', endDate: '2025-11-29T00:00:00Z' } } } },
      responses: { '200': { description: '作成済み' }, '400': { description: '無効な入力' } },
      security: [{ bearerAuth: [] }]
    }
  }
}
export default salesPaths
