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
      Profile: { type: 'object', properties: { id: { type: 'string' }, email: { type: 'string' }, displayName: { type: ['string','null'] }, avatarUrl: { type: ['string','null'] } } },

      // Tags
      Tag: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          group: { type: ['string','null'] },
          linkUrl: { type: ['string','null'] },
          linkLabel: { type: ['string','null'] },
          userId: { type: ['string','null'] },
          sortOrder: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: ['id','name']
      },
      TagList: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Tag' } } } },
      TagCreateRequest: { type: 'object', properties: { name: { type: 'string' }, group: { type: ['string','null'] }, linkUrl: { type: ['string','null'] }, linkLabel: { type: ['string','null'] } }, required: ['name'] },

      // Tag groups
      TagGroup: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          label: { type: 'string' },
          sortOrder: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: ['name']
      },
      TagGroupList: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/TagGroup' } } } },

      // Auth
      AuthToken: { type: 'object', properties: { access_token: { type: 'string' }, token_type: { type: 'string' }, expires_in: { type: 'integer' } } },
      WhoAmI: { type: 'object', properties: { id: { type: 'string' }, email: { type: 'string' }, role: { type: 'string' } } },

      // Recipes
      Recipe: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, ingredients: { type: 'array', items: { type: 'string' } }, steps: { type: 'array', items: { type: 'string' } }, createdAt: { type: 'string', format: 'date-time' } }, required: ['id','title'] },
      RecipeList: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Recipe' } }, total: { type: 'integer' } } },

      // Collections
      Collection: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, productIds: { type: 'array', items: { type: 'string' } }, createdAt: { type: 'string', format: 'date-time' } }, required: ['id','title'] },
      CollectionList: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Collection' } }, total: { type: 'integer' } } },

      // Sales / promotions
      Sale: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, startAt: { type: 'string', format: 'date-time' }, endAt: { type: 'string', format: 'date-time' }, discountPercent: { type: 'number' } }, required: ['id','name','startAt','endAt'] },
      SaleList: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Sale' } } } },

      // Dashboard summaries
      DashboardSummary: { type: 'object', properties: { totalProducts: { type: 'integer' }, totalUsers: { type: 'integer' }, recentOrders: { type: 'integer' } } }
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
