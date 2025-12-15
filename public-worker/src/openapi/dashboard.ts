export const dashboardPaths = {
  '/api/admin/dashboard': {
    get: {
      tags: ['ダッシュボード'],
      summary: '管理ダッシュボードのサマリーを返します',
      description: '管理画面で表示する統計情報（売上合計、登録数などの要約）を取得します。',
      responses: { '200': { description: '正常', content: { 'application/json': { schema: { type: 'object', properties: { totalSales: { type: 'number' }, productCount: { type: 'integer' } } }, example: { totalSales: 123456.78, productCount: 42 } } } } },
      security: [{ bearerAuth: [] }]
    }
  }
}
export default dashboardPaths
