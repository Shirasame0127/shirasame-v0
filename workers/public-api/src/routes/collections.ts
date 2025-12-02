import { Context } from 'hono'
import { getSupabaseAdmin } from '../lib/supabase'
import { isPublicRequest, getOwnerUserId } from '../lib/publicMode'
import { getPublicImageUrl } from '../lib/images'
import type { Env } from '../lib/types'

export async function handleCollections(c: Context<{ Bindings: Env }>) {
  const env = c.env
  const req = c.req.raw
  const supabase = getSupabaseAdmin(env)
  try {
    const publicReq = isPublicRequest(req, env)
    const { data: collections, error: colErr } = await supabase
      .from('collections')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
    if (colErr) return c.json({ error: { code: 'db_error', message: colErr.message } }, 500)
    const collectionList = collections || []
    if (collectionList.length === 0) return c.json({ data: [] })
    const collectionIds = collectionList.map((c: any) => c.id)
    const { data: items, error: itemsErr } = await supabase
      .from('collection_items')
      .select('*')
      .in('collection_id', collectionIds)
    if (itemsErr) return c.json({ error: { code: 'db_error', message: itemsErr.message } }, 500)
    const itemList = items || []
    const productIds = Array.from(new Set(itemList.map((it: any) => it.product_id)))
    let products: any[] = []
    if (productIds.length > 0) {
      let prodQuery = supabase
        .from('products')
        .select('*, images:product_images(*), affiliateLinks:affiliate_links(*)')
        .in('id', productIds)
        .eq('published', true)
      if (publicReq) {
        const ownerId = await getOwnerUserId(env)
        if (ownerId) prodQuery = prodQuery.eq('user_id', ownerId)
      }
      const { data: prods, error: prodErr } = await prodQuery
      if (!prodErr) products = prods || []
    }
    const pmap = new Map<string, any>()
    for (const p of products) pmap.set(p.id, p)
    const transformed = collectionList.map((cobj: any) => {
      const thisItems = itemList.filter((it: any) => it.collection_id === cobj.id)
      const thisProducts = thisItems.map((it: any) => pmap.get(it.product_id)).filter(Boolean)
      return {
        id: cobj.id,
        userId: cobj.user_id,
        title: cobj.title,
        description: cobj.description,
        visibility: cobj.visibility,
        createdAt: cobj.created_at,
        updatedAt: cobj.updated_at,
        products: thisProducts.map((p: any) => ({
          id: p.id,
          userId: p.user_id,
          title: p.title,
          slug: p.slug,
          shortDescription: p.short_description,
          body: p.body,
          tags: p.tags,
          price: p.price,
          published: p.published,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          showPrice: p.show_price,
          notes: p.notes,
          relatedLinks: p.related_links,
          images: Array.isArray(p.images)
            ? p.images.map((img: any) => ({
                id: img.id,
                productId: img.product_id,
                url: getPublicImageUrl(img.url, env) || img.url,
                width: img.width,
                height: img.height,
                aspect: img.aspect,
                role: img.role,
              }))
            : [],
          affiliateLinks: Array.isArray(p.affiliateLinks)
            ? p.affiliateLinks.map((l: any) => ({ provider: l.provider, url: l.url, label: l.label }))
            : [],
        })),
      }
    })
    return c.json({ data: transformed })
  } catch (e: any) {
    return c.json({ error: { code: 'exception', message: String(e?.message || e) } }, 500)
  }
}
