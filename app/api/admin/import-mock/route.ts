import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import supabaseAdmin from "@/lib/supabase"
import * as usersMock from "@/lib/mock-data/users"
import * as productsMock from "@/lib/mock-data/products"
import * as collectionsMock from "@/lib/mock-data/collections"
import * as recipesMock from "@/lib/mock-data/recipes"
import fs from "fs"
import path from "path"

async function tryUpsert(table: string, rows: any[], onConflict?: string) {
  if (!rows || rows.length === 0) return { inserted: 0 }
  try {
    // Use upsert to avoid duplicate-key failures; fall back to insert if upsert not supported
    const opts: any = {}
    if (onConflict) opts.onConflict = onConflict
    const { data, error } = await supabaseAdmin.from(table).upsert(rows, opts)
    if (error) return { inserted: 0, error: error.message, data: data || null }
    return { inserted: Array.isArray(data) ? data.length : (data ? 1 : rows.length), data }
  } catch (err: any) {
    return { inserted: 0, error: String(err?.message || err) }
  }
}

export async function POST(req: NextRequest) {
  // Only allow local/dev usage
  const host = req.headers.get("host") || ""
  if (!host.includes("localhost") && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 })
  }

  const report: Record<string, any> = {}

  // Profiles (from mockUser)
  try {
    const mu = usersMock.mockUser as any
    const profiles = [
      {
        username: mu.username,
        display_name: mu.displayName,
        bio: mu.bio,
        profile_image_url: mu.profileImage || null,
        header_image_urls: mu.headerImages || mu.headerImageUrl ? (mu.headerImages || [mu.headerImageUrl]).filter(Boolean) : [],
        created_at: mu.createdAt,
        updated_at: mu.updatedAt,
      },
    ]
    report.profiles = await tryUpsert("profiles", profiles, "username")
  } catch (err) {
    report.profiles = { inserted: 0, error: String(err) }
  }

  // Images: collect URLs from products, recipes, user headers/profile
  const imageRows: any[] = []
  try {
    const addImage = (obj: any) => {
      if (!obj) return
      const url = obj.url || obj || null
      if (!url) return
      imageRows.push({ cf_id: null, url, filename: path.basename(String(url)), metadata: {} })
    }

    // user
    const mu = usersMock.mockUser as any
    if (mu.profileImage) addImage(mu.profileImage)
    if (Array.isArray(mu.headerImages)) mu.headerImages.forEach((u: any) => addImage(u))

    // products
    ;(productsMock.mockProducts || []).forEach((p: any) => {
      if (Array.isArray(p.images)) p.images.forEach((img: any) => addImage(img.url))
    })

    // recipes
    ;(recipesMock.mockRecipeImages || []).forEach((ri: any) => addImage(ri.url))

    report.images = await tryUpsert("images", imageRows, "url")
  } catch (err) {
    report.images = { inserted: 0, error: String(err) }
  }

  // Try to insert products/collections/recipes if tables exist
  try {
    report.products = await tryUpsert("products", productsMock.mockProducts || [], "id")
  } catch (err) {
    report.products = { inserted: 0, error: String(err) }
  }

  try {
    report.collections = await tryUpsert("collections", collectionsMock.mockCollections || [], "id")
    report.collection_items = await tryUpsert("collection_items", collectionsMock.mockCollectionItems || [], "id")
  } catch (err) {
    report.collections = { inserted: 0, error: String(err) }
  }

  try {
    report.recipes = await tryUpsert("recipes", recipesMock.mockRecipes || [], "id")
    report.recipe_items = await tryUpsert("recipe_items", recipesMock.mockRecipeItems || [], "id")
    report.recipe_images = await tryUpsert("recipe_images", recipesMock.mockRecipeImages || [], "id")
    report.custom_fonts = await tryUpsert("custom_fonts", recipesMock.mockCustomFonts || [], "id")
  } catch (err) {
    report.recipes = { inserted: 0, error: String(err) }
  }

  // Backup and clear local mock files
  try {
    const repoRoot = process.cwd()
    const srcDir = path.join(repoRoot, "lib", "mock-data")
    const backupDir = path.join(repoRoot, "lib", "mock-data.backup")
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir)
    const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".ts"))
    files.forEach((f) => {
      const src = path.join(srcDir, f)
      const dst = path.join(backupDir, f)
      fs.copyFileSync(src, dst)

      // overwrite original with minimal exports to keep imports resolvable
      let minimal = "// Auto-cleared mock data\n"
      if (f.includes("users")) {
        minimal += "export const mockUser = { id: 'user-ghost', username: 'ghost', displayName: 'Ghost' }\nexport const mockAuthUser = { id: 'user-ghost' }\n"
      } else if (f.includes("products")) {
        minimal += "export const mockProducts = []\n"
      } else if (f.includes("collections")) {
        minimal += "export const mockCollections = []\nexport const mockCollectionItems = []\n"
      } else if (f.includes("recipes")) {
        minimal += "export const mockRecipes = []\nexport const mockRecipeItems = []\nexport const mockRecipeImages = []\nexport const mockCustomFonts = []\n"
      } else {
        minimal += "export default {}\n"
      }
      fs.writeFileSync(src, minimal, { encoding: "utf8" })
    })
    report.backup = { filesBackedUp: files.length }
  } catch (err) {
    report.backup = { error: String(err) }
  }

  return NextResponse.json({ success: true, report })
}

export const GET = () => NextResponse.json({ ok: true, info: "POST to run import" })
