import { Hono } from 'hono'
import type { Env } from './lib/types'
import { handleProducts } from './routes/products'
import { handleProfile } from './routes/profile'
import { handleCollections } from './routes/collections'
import { handleRecipes } from './routes/recipes'
import { handleTagGroups } from './routes/tag-groups'
import { handleTags } from './routes/tags'

const app = new Hono<{ Bindings: Env }>()

app.get('/products', handleProducts)
app.get('/profile', handleProfile)
app.get('/collections', handleCollections)
app.get('/recipes', handleRecipes)
app.get('/tag-groups', handleTagGroups)
app.get('/tags', handleTags)

// Basic health
app.get('/health', (c) => c.json({ ok: true }))

export default app
