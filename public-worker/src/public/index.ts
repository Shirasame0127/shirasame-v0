import { Hono } from 'hono'
import { registerHealth } from './health'
import { registerProducts } from './products'
import { registerCollections } from './collections'
import { registerRecipes } from './recipes'
import { registerSearch } from './search'
import { registerTags } from './tags'
import { registerImages } from './images'

export function registerPublicRoutes(app: Hono<any>) {
  registerHealth(app)
  registerProducts(app)
  registerCollections(app)
  registerRecipes(app)
  registerSearch(app)
  registerTags(app)
  registerImages(app)
}

export default registerPublicRoutes
