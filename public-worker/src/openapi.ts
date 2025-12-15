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
    description: 'OpenAPI spec (scaffolded per-feature). Expand each file under public-worker/src/openapi/ with detailed schemas.'
  },
  paths: mergedPaths,
  components: {},
}

export default openapi
