export const settingsPaths = {
  '/api/site-settings': {
    get: {
      tags: ['設定画面'],
      summary: 'サイト設定を取得します',
      description: '公開サイトの設定情報（サイト名やロゴ等）を返します。',
      responses: { '200': { description: '正常', content: { 'application/json': { schema: { $ref: '#/components/schemas/SiteSettings' } } } } }
    },
    put: {
      tags: ['設定画面'],
      summary: 'サイト設定を更新します',
      description: 'サイト設定を更新します（管理者のみ）',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SiteSettings' }, example: { siteName: 'Shirasame', logoUrl: 'https://example.com/logo.png' } } } },
      responses: { '200': { description: '更新済み', content: { 'application/json': { schema: { $ref: '#/components/schemas/SiteSettings' } } } }, '401': { description: '未認証' } },
      security: [{ bearerAuth: [] }]
    }
  },
  '/api/profile': {
    get: {
      tags: ['設定画面'],
      summary: '現在のユーザー情報を取得します',
      responses: { '200': { description: '正常', content: { 'application/json': { schema: { $ref: '#/components/schemas/Profile' } } } }, '401': { description: '未認証' } },
      security: [{ bearerAuth: [] }]
    },
    put: {
      tags: ['設定画面'],
      summary: 'ユーザープロフィールを更新します',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Profile' }, example: { displayName: '山田 太郎', avatarUrl: 'https://example.com/avatar.png' } } } },
      responses: { '200': { description: '更新済み', content: { 'application/json': { schema: { $ref: '#/components/schemas/Profile' } } } }, '401': { description: '未認証' } },
      security: [{ bearerAuth: [] }]
    }
  }
}
export default settingsPaths
