import { NextResponse } from "next/server"
import supabaseAdmin from "@/lib/supabase"
import { getOwnerUserId } from '@/lib/owner'
import { getPublicImageUrl } from '@/lib/image-url'

export async function GET(req: Request, { params }: { params: any }) {
  try {
    // In Next 16 App Router, `params` may be a Promise. Await to get resolved value.
    const resolvedParams = await params
    const id = resolvedParams?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    // Fetch product
    const { data: product, error: prodError } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", id)
      .single()
    
    if (prodError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Fetch images
    const { data: images } = await supabaseAdmin
      .from("product_images")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: true })

    // Fetch affiliate links
    const { data: links } = await supabaseAdmin
      .from("affiliate_links")
      .select("*")
      .eq("product_id", id)

    // Combine and transform to camelCase
    const result = {
      id: product.id,
      userId: product.user_id,
      title: product.title,
      slug: product.slug,
      shortDescription: product.short_description,
      body: product.body,
      tags: product.tags,
      price: product.price,
      published: product.published,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      showPrice: product.show_price,
      notes: product.notes,
      relatedLinks: product.related_links,
      images: images || [],
      affiliateLinks: links || [],
    }

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: any }) {
  try {
    // Resolve owner early so we can restrict updates to owner's resources
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.error('[admin/products] failed to resolve owner', oe)
      return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
    }
    const body = await req.json()
    const resolvedParams = await params
    const id = resolvedParams?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    // Verify the product belongs to the configured owner
    try {
      const { data: existingProduct, error: prodSelErr } = await supabaseAdmin.from('products').select('id, user_id').eq('id', id).eq('user_id', ownerUserId).maybeSingle()
      if (prodSelErr) {
        console.error('[admin/products] failed to validate product ownership', prodSelErr)
        return NextResponse.json({ error: 'failed to validate product' }, { status: 500 })
      }
      if (!existingProduct || existingProduct.user_id !== ownerUserId) {
        return NextResponse.json({ error: 'product not found or not owned by configured profile' }, { status: 403 })
      }
    } catch (e) {
      console.error('[admin/products] product ownership check exception', e)
      return NextResponse.json({ error: 'failed to validate product' }, { status: 500 })
    }
    
    // Server-side validation: images must be provided and non-empty
    const incomingImages = Array.isArray(body.images) ? body.images : []
    if (incomingImages.length === 0) {
      return NextResponse.json({ error: '商品画像は必須です。少なくとも1枚の画像をアップロードしてください。' }, { status: 400 })
    }

    // Extract relations
    const { images, affiliateLinks, ...payload } = body

    // Map to DB columns
    const productUpdate = {
      title: payload.title,
      slug: payload.slug,
      short_description: payload.shortDescription,
      body: payload.body,
      tags: payload.tags,
      price: payload.price,
      published: payload.published,
      show_price: payload.showPrice,
      notes: payload.notes,
      related_links: payload.relatedLinks,
      updated_at: new Date().toISOString(),
    }

    // 1. Update Product
    let { error: updateError } = await supabaseAdmin
      .from("products")
      .update(productUpdate)
      .eq("id", id)
      .eq('user_id', ownerUserId)

    // If the update failed due to missing columns in the target schema (common during migration gaps),
    // retry with a minimal subset of columns so the update doesn't hard-fail.
    if (updateError) {
      console.warn('[admin/products] update error, attempting minimal update', updateError)
      const msg = String(updateError?.message || '')
      const code = (updateError as any)?.code || ''
      // heuristics: PostgREST returns PGRST204 when a column is missing
      const missingColumnError = code === 'PGRST204' || /Could not find the '.*' column/.test(msg)
      if (missingColumnError) {
        const minimalUpdate: any = {
          title: productUpdate.title,
          slug: productUpdate.slug,
          short_description: productUpdate.short_description,
          body: productUpdate.body,
          price: productUpdate.price,
          published: productUpdate.published,
          tags: productUpdate.tags, // ensure tags are preserved even when falling back to minimal update
          updated_at: productUpdate.updated_at,
        }
        const { error: retryError } = await supabaseAdmin.from('products').update(minimalUpdate).eq('id', id).eq('user_id', ownerUserId)
        if (retryError) {
          console.error('[admin/products] minimal retry failed', retryError)
          throw retryError
        }

        // After a successful minimal retry, attempt to update optional fields (like related_links)
        // separately so older schemas that lack them don't block the entire update.
        if (productUpdate.related_links !== undefined) {
            try {
            const { error: rlErr } = await supabaseAdmin.from('products').update({ related_links: productUpdate.related_links }).eq('id', id).eq('user_id', ownerUserId)
            if (rlErr) {
              const msg2 = String((rlErr as any)?.message || '')
              const code2 = (rlErr as any)?.code || ''
              const missing2 = code2 === 'PGRST204' || /Could not find the '.*' column/.test(msg2)
              if (missing2) {
                console.warn('[admin/products] related_links column missing, skipping related_links update')
              } else {
                console.error('[admin/products] related_links update failed', rlErr)
              }
            }
          } catch (e) {
            console.warn('[admin/products] related_links update exception (ignored)', e)
          }
        }

        updateError = null
      } else {
        throw updateError
      }
    }

    // 2. Update Images (Delete all and re-insert)
    if (Array.isArray(images)) {
      await supabaseAdmin.from("product_images").delete().eq("product_id", id)
      
      if (images.length > 0) {
        const generateId = () => (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') ? (crypto as any).randomUUID() : 'img-' + Math.random().toString(36).slice(2, 9)
        const imagesToInsert = images.map((img: any) => ({
          id: img.id || generateId(),
          product_id: id,
          url: img.url,
          role: img.role || "attachment",
          width: img.width || 400,
          height: img.height || 400,
          aspect: img.aspect || "1:1",
          cf_id: img.cf_id || null, // If available
        }))
        let { error: imgError } = await supabaseAdmin.from("product_images").insert(imagesToInsert)
        if (imgError) {
          console.warn('[admin/products] insert product_images error, checking for missing columns', imgError)
          const msg = String(imgError?.message || '')
          const code = (imgError as any)?.code || ''
          const missingColumnError = code === 'PGRST204' || /Could not find the '.*' column/.test(msg)
          if (missingColumnError) {
            // Retry without cf_id in case the column doesn't exist in older schemas
            const imagesToInsert2 = imagesToInsert.map(({ cf_id, ...rest }) => rest)
            // ensure id present on retry as well
            const imagesToInsert2WithId = imagesToInsert2.map((r: any) => ({ id: r.id || generateId(), ...r }))
            const { error: imgError2 } = await supabaseAdmin.from('product_images').insert(imagesToInsert2WithId)
            if (imgError2) console.error('[admin/products] retry insert product_images failed', imgError2)
          } else {
            console.error("Failed to update images", imgError)
          }
        }
      }
    }

    // 3. Update Affiliate Links (Delete all and re-insert)
    if (Array.isArray(affiliateLinks)) {
      await supabaseAdmin.from("affiliate_links").delete().eq("product_id", id)
      
      if (affiliateLinks.length > 0) {
        const linksToInsert = affiliateLinks.map((link: any) => ({
          product_id: id,
          provider: link.provider,
          url: link.url,
          label: link.label,
        }))
        const { error: linkError } = await supabaseAdmin.from("affiliate_links").insert(linksToInsert)
        if (linkError) console.error("Failed to update links", linkError)
      }
    }

    // Return the updated product so the client can verify saved fields (images, links, relatedLinks etc.)
    try {
      const { data: updatedProduct, error: fetchErr } = await supabaseAdmin
        .from('products')
        .select(`*, images:product_images(*), affiliateLinks:affiliate_links(*)`)
        .eq('id', id)
        .eq('user_id', ownerUserId)
        .single()

      if (fetchErr) {
        console.warn('[admin/products] failed to fetch updated product', fetchErr)
        return NextResponse.json({ ok: true })
      }

      const resp = {
        ok: true,
          product: {
          id: updatedProduct.id,
          userId: updatedProduct.user_id,
          title: updatedProduct.title,
          slug: updatedProduct.slug,
          shortDescription: updatedProduct.short_description,
          body: updatedProduct.body,
          tags: updatedProduct.tags,
          price: updatedProduct.price,
          published: updatedProduct.published,
          createdAt: updatedProduct.created_at,
          updatedAt: updatedProduct.updated_at,
          showPrice: updatedProduct.show_price,
          notes: updatedProduct.notes,
          relatedLinks: updatedProduct.related_links,
          images: Array.isArray(updatedProduct.images)
            ? updatedProduct.images.map((img: any) => ({ ...img, url: (typeof getPublicImageUrl === 'function') ? (getPublicImageUrl(img.url) || img.url) : img.url }))
            : updatedProduct.images || [],
          affiliateLinks: updatedProduct.affiliateLinks || [],
        }
      }
      return NextResponse.json(resp)
    } catch (e) {
      console.warn('[admin/products] unable to return updated product, returning ok', e)
      return NextResponse.json({ ok: true })
    }
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: any }) {
  try {
    const resolvedParams = await params
    const id = resolvedParams?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Resolve owner so we only remove owner's collections/items/products
    let ownerUserId: string | null = null
    try {
      ownerUserId = await getOwnerUserId()
    } catch (oe) {
      console.error('[admin/products] failed to resolve owner', oe)
      return NextResponse.json({ error: 'owner resolution failed' }, { status: 500 })
    }

    // Remove product id from any collections owned by the owner that reference it
    let cols: any[] = []
    try {
      const sel = await supabaseAdmin
        .from('collections')
        .select('id, product_ids')
        .contains('product_ids', [id])
        .eq('user_id', ownerUserId)

      cols = (sel.data as any[]) || []
      if (sel.error) console.warn('[admin/products] collections fetch warning', sel.error)

      if (Array.isArray(cols) && cols.length > 0) {
        for (const col of cols) {
          try {
            const nextIds = (col.product_ids || []).filter((pid: any) => pid !== id)
            await supabaseAdmin.from('collections').update({ product_ids: nextIds }).eq('id', col.id).eq('user_id', ownerUserId)
          } catch (e) {
            console.warn('[admin/products] failed to remove product from collection', col.id, e)
          }
        }
      }
    } catch (e) {
      console.warn('[admin/products] error while cleaning up collections for deleted product', e)
    }

    // Also remove any collection_items entries that reference this product for collections owned by owner
    try {
      const collectionIds = (cols || []).map((c: any) => c.id).filter(Boolean)
      if (collectionIds.length > 0) {
        const { error: ciErr } = await supabaseAdmin.from('collection_items').delete().eq('product_id', id).in('collection_id', collectionIds)
        if (ciErr) console.warn('[admin/products] failed to delete collection_items for product', id, ciErr)
      }
    } catch (e) {
      console.warn('[admin/products] exception deleting collection_items for product', id, e)
    }

    const { error } = await supabaseAdmin.from("products").delete().eq("id", id).eq('user_id', ownerUserId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
