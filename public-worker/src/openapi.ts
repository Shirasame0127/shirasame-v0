import dashboardPaths from './openapi/dashboard'
import recipesPaths from './openapi/recipes'
import productsPaths from './openapi/products'
import authPaths from './openapi/auth'
import tagsPaths from './openapi/tags'
import tagGroupsPaths from './openapi/tag-groups'
import collectionsPaths from './openapi/collections'
import salesPaths from './openapi/sales'
import settingsPaths from './openapi/settings'

const mergedPaths = Object.assign({},
  dashboardPaths,
  recipesPaths,
  productsPaths,
  authPaths,
  tagsPaths,
  tagGroupsPaths,
  collectionsPaths,
  salesPaths,
  settingsPaths,
)

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Shirasame Public Worker API',
    version: '1.0.0',
    description: 'Shirasame のパブリック API ドキュメント（機能ごとに分割しています）。各機能ファイルに詳細なスキーマと例を記載しています。'
  },
  paths: mergedPaths,
  // セキュリティ定義および共通スキーマをここにまとめる
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '通常は HttpOnly Cookie (`sb-access-token`) を使いますが、API 参照用に Bearer トークンも指定できます。'
      }
    },
    schemas: {
      ErrorResponse: { type: 'object', properties: { ok: { type: 'boolean' }, message: { type: 'string' }, detail: { type: ['string','null'] }, code: { type: ['string','null'] } } },
      Product: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, price: { type: 'number' }, createdAt: { type: 'string', format: 'date-time' } }, required: ['id','title'] },
      ProductList: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Product' } }, total: { type: 'integer' } } },
      SiteSettings: { type: 'object', properties: { siteName: { type: 'string' }, logoUrl: { type: ['string','null'] } } },
      Profile: { type: 'object', properties: { id: { type: 'string' }, email: { type: 'string' }, displayName: { type: ['string','null'] }, avatarUrl: { type: ['string','null'] } } }
    }
  },
  // Swagger UI のサイドバーで表示するタグ（機能グループ）を日本語で定義
  tags: [
    { name: 'ダッシュボード', description: '管理画面のダッシュボード情報' },
    { name: 'レシピ', description: 'レシピ関連の操作' },
    { name: '商品', description: '商品の一覧・作成・取得' },
    { name: '認証', description: 'ログイン / ログアウト等の認証関連' },
    { name: 'タグ', description: 'タグの CRUD や並び替え' },
    { name: 'タググループ', description: 'タググループの管理' },
    { name: 'コレクション', description: 'コレクション関連' },
    { name: 'セール', description: 'セール・スケジュール' },
    { name: '設定画面', description: 'サイト設定やユーザー情報' }
  ],
}

export default openapi
