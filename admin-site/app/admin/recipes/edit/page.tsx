"use client"

import type React from "react"

// ===========================
// インポート: 必要なライブラリとコンポーネント
// ===========================
import { useEffect, useState, useRef } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { db } from "@/lib/db/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Check,
  Upload,
  X,
  Package,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Search,
  CheckCircle2,
  Trash,
} from "lucide-react"
import { ImageCropper } from "@/components/image-cropper"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "@/components/product-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { WEB_FONTS, getFontsByCategory } from "@/lib/fonts/web-fonts"
import { getCurrentUser } from "@/lib/auth"
import { getPublicImageUrl } from "@/lib/image-url"
import apiFetch from '@/lib/api-client'
import { ImageUpload } from '@/components/image-upload'
import { RecipesService } from '@/lib/services/recipes.service'
// Helper: ensure we can obtain an image key from an image object or URL
function ensureImageKey(imgOrUrl: any): string | null {
  try {
    if (!imgOrUrl) return null
    if (typeof imgOrUrl === 'string') {
      const raw = imgOrUrl
      try {
        if (raw.startsWith('http')) {
          const u = new URL(raw)
          return (u.pathname || '').split('/').pop()?.split('?')[0] || null
        }
      } catch (e) {
        // fallback to naive split
        return String(raw).split('/').pop()?.split('?')[0] || null
      }
      return String(raw).split('/').pop()?.split('?')[0] || null
    }
    if (typeof imgOrUrl === 'object') {
      if (imgOrUrl.key) return imgOrUrl.key
      const u = imgOrUrl.url || imgOrUrl.imageUrl || imgOrUrl.src || null
      if (!u) return null
      try {
        if (typeof u === 'string' && u.startsWith('http')) {
          const uu = new URL(u)
          return (uu.pathname || '').split('/').pop()?.split('?')[0] || null
        }
      } catch (e) {
        return String(u).split('/').pop()?.split('?')[0] || null
      }
      return String(u).split('/').pop()?.split('?')[0] || null
    }
  } catch (e) {
    return null
  }
}
// ===========================
// 型定義: Pinオブジェクトの構造
// ===========================
// ピンは「点」「タグ」「線」の3つの要素で構成されています
type Pin = {
  id: string // 一意のID
  productId: string // 紐づいている商品のID
  userId?: string
  tagDisplayText?: string // タグに表示するカスタムテキスト

  // 位置（画像サイズに対するパーセント、0-100）
  dotXPercent: number // 点のX座標（%）
  dotYPercent: number // 点のY座標（%）
  tagXPercent: number // タグのX座標（%）
  tagYPercent: number // タグのY座標（%）

  // サイズ（画像幅に対するパーセント）
  dotSizePercent: number // 点のサイズ（画像幅の%）default: 1.2
  tagFontSizePercent: number // フォントサイズ（画像幅の%）default: 1.4
  lineWidthPercent: number // 線の太さ（画像幅の%）default: 0.2
  tagPaddingXPercent: number // 横パディング（画像幅の%）default: 1.2
  tagPaddingYPercent: number // 縦パディング（画像幅の%）default: 0.6
  tagBorderRadiusPercent: number // 角丸（画像幅の%）default: 0.4
  tagBorderWidthPercent: number // 枠線（画像幅の%）default: 0

  // スタイル
  dotColor: string // 点の色（HEX形式）
  dotShape: "circle" | "square" | "triangle" | "diamond" // 点の形状
  tagText: string // タグに表示するテキスト (product title)
  tagFontFamily: string // フォントファミリー
  tagFontWeight: "normal" | "bold" | "300" | "400" | "500" | "600" | "700" // フォントの太さ
  tagTextColor: string // テキストカラー（HEX形式）
  tagTextShadow: string // テキストシャドウ（CSS形式）
  tagBackgroundColor: string // 背景色（HEX形式）
  tagBackgroundOpacity: number // 背景の不透明度（0-1）
  tagBorderColor: string // 枠線の色（HEX形式）
  tagShadow: string // ボックスシャドウ（CSS形式）
  lineType: "solid" | "dashed" | "dotted" | "wavy" | "hand-drawn" // 線のスタイル
  lineColor: string // 線の色（HEX形式）

  tagTextStrokeColor: string
  tagTextStrokeWidth: number
  tagBackgroundWidthPercent: number
  tagBackgroundHeightPercent: number
  tagBackgroundOffsetXPercent: number
  tagBackgroundOffsetYPercent: number
  tagShadowColor: string
  tagShadowOpacity: number
  tagShadowBlur: number
  tagShadowDistance: number
  tagShadowAngle: number
  tagTextAlign: "left" | "center" | "right"
  tagVerticalWriting: boolean
  tagLetterSpacing: number
  tagLineHeight: number
  tagBold: boolean
  tagItalic: boolean
  tagUnderline: boolean
  tagTextTransform: "uppercase" | "lowercase" | "none"
}

// ===========================
// ドラッグ対象の型定義
// ===========================
// ドラッグ中の要素（点 or タグ）を追跡するための型
type DragTarget = { type: "dot" | "tag"; pinId: string } | null

// ===========================
// メインコンポーネント
// ===========================
export default function RecipeEditPage() {
  const { toast } = useToast()
  const DEBUG_PINS = false

  // ===========================
  // ルーティング関連のフック
  // ===========================
  const router = useRouter() // ページ遷移用
  const params = useParams() // URLパラメータ取得用
  const searchParams = useSearchParams && useSearchParams()
  // recipeId may be passed as a path param or as ?id=<id> query param depending on navigation
  const recipeId = (params && (params as any).id) || (searchParams ? searchParams.get('id') : null) || ''

  // ===========================
  // ステート変数: レシピの基本情報
  // ===========================
  const [title, setTitle] = useState("") // レシピタイトル
  const [imageDataUrl, setImageDataUrl] = useState("") // 画像のBase64 DataURL or public URL
  const [imageWidth, setImageWidth] = useState(1920) // 画像の元の幅
  const [imageHeight, setImageHeight] = useState(1080) // 画像の元の高さ
  const [pins, setPins] = useState<Pin[]>([]) // ピンの配列

  // ===========================
  // ステート変数: 商品選択関連
  // ===========================
  const [products, setProducts] = useState<any[]>([]) // すべての商品リスト
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]) // 選択中の商品ID配列

  // ===========================
  // ステート変数: UI制御
  // ===========================
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null) // 選択中のピンID
  const [dragTarget, setDragTarget] = useState<DragTarget>(null) // ドラッグ中の要素
  const [showCropper, setShowCropper] = useState(false) // トリミングモーダル表示フラグ
  const [tempImageUrl, setTempImageUrl] = useState("") // トリミング前の一時画像URL
  const [showProductModal, setShowProductModal] = useState(false) // 商品選択モーダル表示フラグ
  const [parentTab, setParentTab] = useState("style") // プロパティパネルのアクティブタブ
  const [styleTab, setStyleTab] = useState("theme") // スタイルタブのデフォルト値をstateで管理

  const [tagDisplayText, setTagDisplayText] = useState("")

  // 選択中のピンが変わったら表示テキストも更新
  useEffect(() => {
    if (selectedPinId) {
      const pin = pins.find((p) => p.id === selectedPinId)
      if (pin) {
        setTagDisplayText(pin.tagDisplayText || "")
      }
    } else {
      setTagDisplayText("")
    }
  }, [selectedPinId, pins])

  // 表示テキストを適用する関数
  const applyTagDisplayText = () => {
    if (!selectedPinId) return
    updatePin(selectedPinId, { tagDisplayText })
    toast({
      title: "更新完了",
      description: "タグの表示テキストを更新しました",
    })
  }
  const [showTitleModal, setShowTitleModal] = useState(false) // タイトル入力モーダル用のステート追加
  const [tempTitle, setTempTitle] = useState("") // タイトル入力モーダル用のステート追加
  const [scale, setScale] = useState(1) // スケールをstateで管理
  const [recipeImageKeys, setRecipeImageKeys] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)

  const [customFonts, setCustomFonts] = useState<any[]>([])
  const [favoriteFonts, setFavoriteFonts] = useState<string[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [published, setPublished] = useState<boolean>(false)
  const [isUploadingFont, setIsUploadingFont] = useState(false)

  const [fontCategory, setFontCategory] = useState<"japanese" | "english" | "all" | "favorite" | "custom">("all")
  const [fontSearch, setFontSearch] = useState("")

  // ===========================
  // Ref: DOM要素への参照
  // ===========================
  const imageRef = useRef<HTMLDivElement>(null) // 画像コンテナへの参照
  const pinAreaRef = useRef<HTMLDivElement>(null) // ピン配置エリアへの参照（画像と完全に一致）
  const imageElRef = useRef<HTMLImageElement | null>(null) // 実際に表示される img 要素の参照
  const [imageDisplayWidth, setImageDisplayWidth] = useState<number | null>(null)
  const [imageDisplayHeight, setImageDisplayHeight] = useState<number | null>(null)
  const [pinAreaOffsetLeft, setPinAreaOffsetLeft] = useState<number>(0)
  const [pinAreaOffsetTop, setPinAreaOffsetTop] = useState<number>(0)
  const [isMobileView, setIsMobileView] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null) // ファイル入力への参照
  // モバイル用パネル表示モード: 'minimized' (下部にアイコンのみ) | 'focus' (下から50%まで展開)
  const [mobilePanelMode, setMobilePanelMode] = useState<"minimized" | "focus">("minimized")

  // ===========================
  // 初回ロード時にデータを読み込む
  // ===========================
  useEffect(() => {
    loadData()
    loadUserFonts()
  }, [recipeId])

  // Handle upload completion from ImageUpload dialog: append key to recipes.recipe_image_keys
  async function handleUploadCompleteKey(key?: string, uploadedAspectRatio?: number) {
    if (!key) return
    try {
      const existing = Array.isArray(recipeImageKeys) ? recipeImageKeys : []
      const alreadyHad = existing.includes(key)
      const merged = Array.from(new Set([...existing, key]))
      // Update local state with the new key; do not persist recipe meta until image natural size is known
      setRecipeImageKeys(merged)

      try {
        const cdn = getPublicImageUrl(key)
        if (cdn) {
          setImageDataUrl(cdn)
          // Measure natural image size using Image() and only then persist meta+keys+pins
          try {
            await new Promise<void>((resolve) => {
              try {
                const img = new Image()
                img.onload = async () => {
                  try {
                    const w = img.naturalWidth || null
                    const h = img.naturalHeight || null

                    // Prepare patch payload
                    const toPatch: any = { recipe_image_keys: merged }
                    if (w && h) {
                      setImageWidth(w)
                      setImageHeight(h)
                      toPatch.image_width = w
                      toPatch.image_height = h
                    }

                    // Prefer explicit uploadedAspectRatio when provided
                    if (typeof uploadedAspectRatio === 'number' && !Number.isNaN(uploadedAspectRatio)) {
                      toPatch.aspect_ratio = Number(uploadedAspectRatio)
                    } else if (h && w) {
                      toPatch.aspect_ratio = w / h
                    } else {
                      // Fallback default to avoid null
                      try {
                        toPatch.aspect_ratio = DEFAULT_STAGE_ASPECT_RATIO
                      } catch (e) {
                        // If DEFAULT_STAGE_ASPECT_RATIO is not available for any reason,
                        // avoid throwing and leave aspect_ratio unset so server won't overwrite.
                      }
                    }

                    // Ensure pins is always an array
                    const pinsPayload = Array.isArray(pins) ? pins : []

                    // Persist only when:
                    // - this is a new key (not alreadyHad) OR
                    // - we already had the key but now received an explicit numeric aspect to update
                    const shouldPersist = !alreadyHad || (alreadyHad && typeof uploadedAspectRatio === 'number' && !Number.isNaN(uploadedAspectRatio))
                    if (shouldPersist) {
                      try {
                        await RecipesService.update(recipeId, { ...toPatch, pins: pinsPayload })
                      } catch (e) {
                        try {
                          await apiFetch(`/api/admin/recipes/${encodeURIComponent(recipeId)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...toPatch, pins: pinsPayload }) })
                        } catch (e2) {}
                      }
                    }
                  } catch (e) {}
                  resolve()
                }
                img.onerror = () => resolve()
                img.src = cdn
              } catch (e) { resolve() }
            })
          } catch (e) {}
        }
      } catch (e) {}
    } finally {
      // keep modal open for multiple uploads, but allow parent to close
    }
  }


  function loadUserFonts() {
    const user = getCurrentUser()
    if (user) {
      setCurrentUserId(user.id)
      const favorites = db.user.getFavoriteFonts(user.id)
      setFavoriteFonts(favorites)
      const customs = db.customFonts.getAll(user.id)
      setCustomFonts(customs)
    }
  }

  // ===========================
  // 関数: データベースからレシピデータを読み込む
  // - 非同期化して、キャッシュに存在しない場合はサーバからリフレッシュする
  // ===========================
  async function loadData() {
    console.log("[v0] Loading recipe data:", recipeId)
    // Resolve current user id early so refreshes can be scoped
    const currentUser = getCurrentUser && getCurrentUser()
    const uid = currentUser?.id || currentUserId || undefined
    // Always attempt to fetch authoritative recipe from API first
    try {
      // Prefer admin endpoint for authoritative draft/admin-scoped records.
      // If admin fetch fails (unauthenticated or not found), fall back to public getById.
      let fresh: any = null
      if (recipeId) {
        fresh = await RecipesService.getAdminById(recipeId)
      }
      if (!fresh && recipeId) {
        fresh = await RecipesService.getById(recipeId)
      }
      if (fresh) {
        const keysFromRecipe = Array.isArray(fresh.recipe_image_keys) ? fresh.recipe_image_keys : (Array.isArray(fresh.recipeImageKeys) ? fresh.recipeImageKeys : [])
        setRecipeImageKeys(keysFromRecipe || [])
        if ((!keysFromRecipe || keysFromRecipe.length === 0) && (fresh.title || '').trim()) {
          setTimeout(() => setShowUploadModal(true), 160)
        }
        setTitle(fresh.title || "")
        setPublished(Boolean(fresh.published))
        const fallbackImageUrl = (fresh.images && fresh.images.length > 0 && fresh.images[0].url) || null
        // If canonical recipe_image_keys exist, prefer building a public CDN URL from the first key
        if (Array.isArray(keysFromRecipe) && keysFromRecipe.length > 0) {
          try {
            const cdn = getPublicImageUrl(keysFromRecipe[0])
            if (cdn) setImageDataUrl(cdn)
            else setImageDataUrl(fresh.imageDataUrl || fresh.imageUrl || fallbackImageUrl || "")
          } catch (e) {
            setImageDataUrl(fresh.imageDataUrl || fresh.imageUrl || fallbackImageUrl || "")
          }
        } else {
          setImageDataUrl(fresh.imageDataUrl || fresh.imageUrl || fallbackImageUrl || "")
        }
        setImageWidth(fresh.imageWidth || 1920)
        setImageHeight(fresh.imageHeight || 1080)

        // Ensure recipe pins cache for this recipe is fresh (avoid warmCache race)
        try { await db.recipePins.refresh(recipeId) } catch (e) { /* best-effort */ }
        const recipePinsFresh = db.recipePins.getByRecipeId(recipeId)
        // Prefer normalized pins returned directly from the admin endpoint when available
        const pinsFromNormalized = Array.isArray((fresh as any).pinsNormalized) ? (fresh as any).pinsNormalized : null
        if (Array.isArray(pinsFromNormalized) && pinsFromNormalized.length > 0) {
          setPins(pinsFromNormalized.map((p: any) => ({
            id: p.id || `pin-${Date.now()}-${p.productId}`,
            productId: p.productId,
            userId: p.userId || currentUser?.id || currentUserId || undefined,
            dotXPercent: p.dotXPercent || p.dot_x_percent || 20,
            dotYPercent: p.dotYPercent || p.dot_y_percent || 50,
            tagXPercent: p.tagXPercent || p.tag_x_percent || 80,
            tagYPercent: p.tagYPercent || p.tag_y_percent || 50,
            dotSizePercent: p.dotSizePercent || p.dot_size_percent || 1.2,
            tagFontSizePercent: p.tagFontSizePercent || p.tag_font_size_percent || 1.4,
            lineWidthPercent: p.lineWidthPercent || p.line_width_percent || 0.2,
            tagPaddingXPercent: p.tagPaddingXPercent || p.tag_padding_x_percent || 1.2,
            tagPaddingYPercent: p.tagPaddingYPercent || p.tag_padding_y_percent || 0.6,
            tagBorderRadiusPercent: p.tagBorderRadiusPercent || p.tag_border_radius_percent || 0.4,
            tagBorderWidthPercent: p.tagBorderWidthPercent || p.tag_border_width_percent || 0,
            dotColor: p.dotColor || p.dot_color || '#ffffff',
            dotShape: p.dotShape || p.dot_shape || 'circle',
            tagText: p.tagText || p.tag_text || '',
            tagFontFamily: p.tagFontFamily || p.tag_font_family || 'system-ui',
            tagFontWeight: p.tagFontWeight || p.tag_font_weight || 'normal',
            tagTextColor: p.tagTextColor || p.tag_text_color || '#ffffff',
            tagTextShadow: p.tagTextShadow || p.tag_text_shadow || '0 2px 4px rgba(0,0,0,0.3)',
            tagBackgroundColor: p.tagBackgroundColor || p.tag_background_color || '#000000',
            tagBackgroundOpacity: p.tagBackgroundOpacity ?? (typeof p.tag_background_opacity !== 'undefined' ? p.tag_background_opacity : 0.8),
            tagBorderColor: p.tagBorderColor || p.tag_border_color || '#ffffff',
            tagShadow: p.tagShadow || p.tag_shadow || '0 2px 8px rgba(0,0,0,0.2)',
            lineType: p.lineType || p.line_type || 'solid',
            tagTextStrokeColor: p.tagTextStrokeColor || 'transparent',
            tagTextStrokeWidth: p.tagTextStrokeWidth || 0,
            tagBackgroundWidthPercent: p.tagBackgroundWidthPercent || 0,
            tagBackgroundHeightPercent: p.tagBackgroundHeightPercent || 0,
            tagBackgroundOffsetXPercent: p.tagBackgroundOffsetXPercent || 0,
            tagBackgroundOffsetYPercent: p.tagBackgroundOffsetYPercent || 0,
            tagShadowColor: p.tagShadowColor || '#000000',
            tagShadowOpacity: p.tagShadowOpacity ?? 0.5,
            tagShadowBlur: p.tagShadowBlur ?? 2,
            tagShadowDistance: p.tagShadowDistance ?? 2,
            tagShadowAngle: p.tagShadowAngle ?? 45,
            tagTextAlign: p.tagTextAlign || 'left',
            tagVerticalWriting: p.tagVerticalWriting || false,
            tagLetterSpacing: p.tagLetterSpacing || 0,
            tagLineHeight: p.tagLineHeight || 1.5,
            tagBold: p.tagBold || false,
            tagItalic: p.tagItalic || false,
            tagUnderline: p.tagUnderline || false,
            tagTextTransform: p.tagTextTransform || 'none',
            tagDisplayText: p.tagDisplayText || '',
          })) as Pin[])
        } else if (recipePinsFresh && recipePinsFresh.length > 0) {
          setPins(recipePinsFresh.map((p: any) => ({
            ...p,
            tagTextStrokeColor: p.tagTextStrokeColor || "transparent",
            tagTextStrokeWidth: p.tagTextStrokeWidth || 0,
            tagBackgroundWidthPercent: p.tagBackgroundWidthPercent || 0,
            tagBackgroundHeightPercent: p.tagBackgroundHeightPercent || 0,
            tagBackgroundOffsetXPercent: p.tagBackgroundOffsetXPercent || 0,
            tagBackgroundOffsetYPercent: p.tagBackgroundOffsetYPercent || 0,
            tagShadowColor: p.tagShadowColor || "#000000",
            tagShadowOpacity: p.tagShadowOpacity ?? 0.5,
            tagShadowBlur: p.tagShadowBlur ?? 2,
            tagShadowDistance: p.tagShadowDistance ?? 2,
            tagShadowAngle: p.tagShadowAngle ?? 45,
            tagTextAlign: p.tagTextAlign || "left",
            tagVerticalWriting: p.tagVerticalWriting || false,
            tagLetterSpacing: p.tagLetterSpacing || 0,
            tagLineHeight: p.tagLineHeight || 1.5,
            tagBold: p.tagBold || false,
            tagItalic: p.tagItalic || false,
            tagUnderline: p.tagUnderline || false,
            tagTextTransform: p.tagTextTransform || "none",
            tagDisplayText: p.tagDisplayText || "",
          })) as Pin[])
          setSelectedProductIds(recipePinsFresh.map((p: any) => p.productId))
        } else if (fresh.pins && fresh.pins.length > 0) {
          const convertedPins = fresh.pins.map((oldPin: any) => ({
            id: oldPin.id || `pin-${Date.now()}-${oldPin.productId}`,
            productId: oldPin.productId,
            dotXPercent: oldPin.dotXPercent || 20,
            dotYPercent: oldPin.dotYPercent || 50,
            tagXPercent: oldPin.tagXPercent || 80,
            tagYPercent: oldPin.tagYPercent || 50,
            dotSizePercent: oldPin.dotSize ? (oldPin.dotSize / (fresh.imageWidth || 1920)) * 100 : 1.2,
            tagFontSizePercent: oldPin.tagFontSize ? (oldPin.tagFontSize / (fresh.imageWidth || 1920)) * 100 : 1.4,
            lineWidthPercent: oldPin.lineWidth ? (oldPin.lineWidth / (fresh.imageWidth || 1920)) * 100 : 0.2,
            tagPaddingXPercent: oldPin.tagPaddingX ? (oldPin.tagPaddingX / (fresh.imageWidth || 1920)) * 100 : 1.2,
            tagPaddingYPercent: oldPin.tagPaddingY ? (oldPin.tagPaddingY / (fresh.imageWidth || 1920)) * 100 : 0.6,
            tagBorderRadiusPercent: oldPin.tagBorderRadius ? (oldPin.tagBorderRadius / (fresh.imageWidth || 1920)) * 100 : 0.4,
            tagBorderWidthPercent: oldPin.tagBorderWidth ? (oldPin.tagBorderWidth / (fresh.imageWidth || 1920)) * 100 : 0,
            dotColor: oldPin.dotColor || "#ffffff",
            dotShape: oldPin.dotShape || "circle",
            tagText: oldPin.tagText || oldPin.text || "",
            tagFontFamily: oldPin.tagFontFamily || "system-ui",
            tagFontWeight: oldPin.tagFontWeight || "normal",
            tagTextColor: oldPin.tagTextColor || "#ffffff",
            tagTextShadow: oldPin.tagTextShadow || "0 2px 4px rgba(0,0,0,0.3)",
            tagBackgroundColor: oldPin.tagBackgroundColor || "#000000",
            tagBackgroundOpacity: oldPin.tagBackgroundOpacity ?? 0.8,
            tagBorderColor: oldPin.tagBorderColor || "#ffffff",
            tagShadow: oldPin.tagShadow || "0 2px 8px rgba(0,0,0,0.2)",
            lineType: oldPin.lineType || "solid",
            lineColor: oldPin.lineColor || "#ffffff",
            tagTextStrokeColor: "transparent",
            tagTextStrokeWidth: 0,
            tagBackgroundWidthPercent: 0,
            tagBackgroundHeightPercent: 0,
            tagBackgroundOffsetXPercent: 0,
            tagBackgroundOffsetYPercent: 0,
            tagShadowColor: "#000000",
            tagShadowOpacity: 0.5,
            tagShadowBlur: 2,
            tagShadowDistance: 2,
            tagShadowAngle: 45,
            tagTextAlign: "left",
            tagVerticalWriting: false,
            tagLetterSpacing: 0,
            tagLineHeight: 1.5,
            tagBold: false,
            tagItalic: false,
            tagUnderline: false,
            tagTextTransform: "none",
            tagDisplayText: "",
          }))
          setPins(convertedPins as Pin[])
          setSelectedProductIds(convertedPins.map((p: any) => p.productId))
        }
        
        // we've initialized from API, skip fallback cache path
        // continue to load products below
      }
    } catch (e) {
      // API fetch failed — fall back to local cache approach
      console.warn('[v0] RecipesService.getById failed in loadData, falling back to cache', e)
      let recipe: any = db.recipes.getById(recipeId)
      if (!recipe) {
        try {
          await db.recipes.refresh(uid)
          recipe = db.recipes.getById(recipeId)
        } catch (err) {
          console.warn('[v0] recipes.refresh failed in loadData', err)
        }
      }

      if (recipe) {
        const keysFromRecipe = Array.isArray(recipe.recipe_image_keys) ? recipe.recipe_image_keys : (Array.isArray(recipe.recipeImageKeys) ? recipe.recipeImageKeys : [])
        setRecipeImageKeys(keysFromRecipe || [])
        if ((!keysFromRecipe || keysFromRecipe.length === 0) && (recipe.title || '').trim()) {
          setTimeout(() => setShowUploadModal(true), 160)
        }
        setTitle(recipe.title || "")
        setPublished(Boolean(recipe.published))
        // Prefer canonical recipe_image_keys for preview
        if (Array.isArray(keysFromRecipe) && keysFromRecipe.length > 0) {
          try {
            const cdn = getPublicImageUrl(keysFromRecipe[0])
            if (cdn) setImageDataUrl(cdn)
            else setImageDataUrl(recipe.imageDataUrl || recipe.imageUrl || "")
          } catch (e) {
            const fallbackImageUrl = (recipe.images && recipe.images.length > 0 && recipe.images[0].url) || null
            setImageDataUrl(recipe.imageDataUrl || recipe.imageUrl || fallbackImageUrl || "")
          }
        } else {
          const fallbackImageUrl = (recipe.images && recipe.images.length > 0 && recipe.images[0].url) || null
          setImageDataUrl(recipe.imageDataUrl || recipe.imageUrl || fallbackImageUrl || "")
        }
        setImageWidth(recipe.imageWidth || 1920)
        setImageHeight(recipe.imageHeight || 1080)

        try { await db.recipePins.refresh(recipeId) } catch (err) {}
        const recipePins = db.recipePins.getByRecipeId(recipeId)
        if (recipePins && recipePins.length > 0) {
          setPins(recipePins.map((p: any) => ({
            ...p,
            tagTextStrokeColor: p.tagTextStrokeColor || "transparent",
            tagTextStrokeWidth: p.tagTextStrokeWidth || 0,
            tagBackgroundWidthPercent: p.tagBackgroundWidthPercent || 0,
            tagBackgroundHeightPercent: p.tagBackgroundHeightPercent || 0,
            tagBackgroundOffsetXPercent: p.tagBackgroundOffsetXPercent || 0,
            tagBackgroundOffsetYPercent: p.tagBackgroundOffsetYPercent || 0,
            tagShadowColor: p.tagShadowColor || "#000000",
            tagShadowOpacity: p.tagShadowOpacity ?? 0.5,
            tagShadowBlur: p.tagShadowBlur ?? 2,
            tagShadowDistance: p.tagShadowDistance ?? 2,
            tagShadowAngle: p.tagShadowAngle ?? 45,
            tagTextAlign: p.tagTextAlign || "left",
            tagVerticalWriting: p.tagVerticalWriting || false,
            tagLetterSpacing: p.tagLetterSpacing || 0,
            tagLineHeight: p.tagLineHeight || 1.5,
            tagBold: p.tagBold || false,
            tagItalic: p.tagItalic || false,
            tagUnderline: p.tagUnderline || false,
            tagTextTransform: p.tagTextTransform || "none",
            tagDisplayText: p.tagDisplayText || "",
          })) as Pin[])
          setSelectedProductIds(recipePins.map((p: any) => p.productId))
        } else if (recipe.pins && recipe.pins.length > 0) {
          const convertedPins = recipe.pins.map((oldPin: any) => ({
            id: oldPin.id || `pin-${Date.now()}-${oldPin.productId}`,
            productId: oldPin.productId,
            dotXPercent: oldPin.dotXPercent || 20,
            dotYPercent: oldPin.dotYPercent || 50,
            tagXPercent: oldPin.tagXPercent || 80,
            tagYPercent: oldPin.tagYPercent || 50,
            dotSizePercent: oldPin.dotSize ? (oldPin.dotSize / (recipe.imageWidth || 1920)) * 100 : 1.2,
            tagFontSizePercent: oldPin.tagFontSize ? (oldPin.tagFontSize / (recipe.imageWidth || 1920)) * 100 : 1.4,
            lineWidthPercent: oldPin.lineWidth ? (oldPin.lineWidth / (recipe.imageWidth || 1920)) * 100 : 0.2,
            tagPaddingXPercent: oldPin.tagPaddingX ? (oldPin.tagPaddingX / (recipe.imageWidth || 1920)) * 100 : 1.2,
            tagPaddingYPercent: oldPin.tagPaddingY ? (oldPin.tagPaddingY / (recipe.imageWidth || 1920)) * 100 : 0.6,
            tagBorderRadiusPercent: oldPin.tagBorderRadius ? (oldPin.tagBorderRadius / (recipe.imageWidth || 1920)) * 100 : 0.4,
            tagBorderWidthPercent: oldPin.tagBorderWidth ? (oldPin.tagBorderWidth / (recipe.imageWidth || 1920)) * 100 : 0,
            dotColor: oldPin.dotColor || "#ffffff",
            dotShape: oldPin.dotShape || "circle",
            tagText: oldPin.tagText || oldPin.text || "",
            tagFontFamily: oldPin.tagFontFamily || "system-ui",
            tagFontWeight: oldPin.tagFontWeight || "normal",
            tagTextColor: oldPin.tagTextColor || "#ffffff",
            tagTextShadow: oldPin.tagTextShadow || "0 2px 4px rgba(0,0,0,0.3)",
            tagBackgroundColor: oldPin.tagBackgroundColor || "#000000",
            tagBackgroundOpacity: oldPin.tagBackgroundOpacity ?? 0.8,
            tagBorderColor: oldPin.tagBorderColor || "#ffffff",
            tagShadow: oldPin.tagShadow || "0 2px 8px rgba(0,0,0,0.2)",
            lineType: oldPin.lineType || "solid",
            lineColor: oldPin.lineColor || "#ffffff",
            tagTextStrokeColor: "transparent",
            tagTextStrokeWidth: 0,
            tagBackgroundWidthPercent: 0,
            tagBackgroundHeightPercent: 0,
            tagBackgroundOffsetXPercent: 0,
            tagBackgroundOffsetYPercent: 0,
            tagShadowColor: "#000000",
            tagShadowOpacity: 0.5,
            tagShadowBlur: 2,
            tagShadowDistance: 2,
            tagShadowAngle: 45,
            tagTextAlign: "left",
            tagVerticalWriting: false,
            tagLetterSpacing: 0,
            tagLineHeight: 1.5,
            tagBold: false,
            tagItalic: false,
            tagUnderline: false,
            tagTextTransform: "none",
            tagDisplayText: "",
          }))
          setPins(convertedPins as Pin[])
          setSelectedProductIds(convertedPins.map((p: any) => p.productId))
        }
      }
    }

      

    // すべての商品を取得（現在のユーザーにスコープ）
    const productsData = db.products.getAll(uid)
    setProducts(productsData)
    // If cached products are empty (warmCache may still be in-flight), try a direct refresh
    if (!productsData || productsData.length === 0) {
      ;(async () => {
        try {
          const fresh = await db.products.refreshAdmin(uid)
          if (fresh && fresh.length > 0) setProducts(fresh)
        } catch (e) {
          console.warn('[v0] products refresh failed in loadData', e)
        }
      })()
    }
  }

  // ===========================
  // 関数: 画像アップロード処理
  // ===========================
  // ファイル選択後、Base64に変換してトリミングモーダルを表示
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setTempImageUrl(dataUrl)
      setShowCropper(true) // トリミングモーダルを表示
    }
    reader.readAsDataURL(file)
  }

  // ===========================
  // 関数: トリミング完了時の処理
  // ===========================
  // トリミングされた画像をBase64に変換して保存
  function handleCropComplete(croppedFile: File) {
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setImageDataUrl(dataUrl)

      const img = new Image()
      img.onload = () => {
        setImageWidth(img.width)
        setImageHeight(img.height)
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(croppedFile)
    setShowCropper(false)
  }

  // ===========================
  // 関数: 商品の選択/解除を切り替え
  // ===========================
  // 商品を選択するとピンが自動生成され、解除するとピンが削除されます
  function toggleProductSelection(productId: string) {
    console.log("[v0] Toggle product:", productId, "Currently selected:", selectedProductIds.includes(productId))

    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        setPins((currentPins) => currentPins.filter((p) => p.productId !== productId))
        return prev.filter((id) => id !== productId)
      } else {
        const product = products.find((p) => p.id === productId)
        if (product) {
          const uid = currentUserId || (getCurrentUser && getCurrentUser()?.id) || "user-shirasame"
          const generatedId =
            typeof crypto !== "undefined" && (crypto as any).randomUUID
              ? `pin-${(crypto as any).randomUUID()}`
              : `pin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
          const newPin: Pin = {
            id: generatedId,
            productId,
            userId: uid,
            // 位置（パーセント値）
            dotXPercent: 20,
            dotYPercent: 50 + (Math.random() - 0.5) * 40,
            tagXPercent: 80,
            tagYPercent: 50 + (Math.random() - 0.5) * 40,
            // サイズ（画像幅に対するパーセント値）
            dotSizePercent: 1.2, // 画像幅の1.2%
            tagFontSizePercent: 1.4, // 画像幅の1.4%
            lineWidthPercent: 0.2, // 画像幅の0.2%
            tagPaddingXPercent: 1.2, // 画像幅の1.2%
            tagPaddingYPercent: 0.6, // 画像幅の0.6%
            tagBorderRadiusPercent: 0.4, // 画像幅の0.4%
            tagBorderWidthPercent: 0, // 画像幅の0%
            // スタイル
            dotColor: "#ffffff",
            dotShape: "circle",
            tagText: product.title,
            tagFontFamily: "system-ui",
            tagFontWeight: "normal",
            tagTextColor: "#ffffff",
            tagTextShadow: "0 2px 4px rgba(0,0,0,0.3)",
            tagBackgroundColor: "#000000",
            tagBackgroundOpacity: 0.8,
            tagBorderColor: "#ffffff",
            tagShadow: "0 2px 8px rgba(0,0,0,0.2)",
            lineType: "solid",
            lineColor: "#ffffff",
            tagTextStrokeColor: "transparent",
            tagTextStrokeWidth: 0,
            tagBackgroundWidthPercent: 0,
            tagBackgroundHeightPercent: 0,
            tagBackgroundOffsetXPercent: 0,
            tagBackgroundOffsetYPercent: 0,
            tagShadowColor: "#000000",
            tagShadowOpacity: 0.5,
            tagShadowBlur: 2,
            tagShadowDistance: 2,
            tagShadowAngle: 45,
            tagTextAlign: "left",
            tagVerticalWriting: false,
            tagLetterSpacing: 0,
            tagLineHeight: 1.5,
            tagBold: false,
            tagItalic: false,
            tagUnderline: false,
            tagTextTransform: "none",
            tagDisplayText: "",
          }
          setPins((currentPins) => {
            // Prevent duplicate pins for the same productId
            if (currentPins.some((p) => p.productId === productId)) return currentPins
            return [...currentPins, newPin]
          })
          console.log("[v0] Added new pin:", newPin.id)
        }
        return [...prev, productId]
      }
    })
  }

  // Open the product-selection modal and load authoritative product list
  async function openProductModal() {
    try {
      // fetch authoritative product list for admin
      const res = await apiFetch('/api/admin/products')
      const json = await res.json().catch(() => ({ data: [] }))
      const prods = Array.isArray(json) ? json : json.data || []
      if (prods && prods.length > 0) setProducts(prods)
    } catch (e) {
      // fallback to in-memory cache
      const currentUser = getCurrentUser && getCurrentUser()
      const uid = currentUser?.id || undefined
      setProducts(db.products.getAll(uid))
    }

    // initialize selected ids from current pins
    setSelectedProductIds(pins.map((p) => p.productId))
    setShowProductModal(true)
  }

  // Persist current pins to server when modal is closed
  async function persistPins() {
    if (!recipeId) return
    try {
      // Use RecipesService.update to persist pins (server expects 'pins' array)
      const updated = await RecipesService.update(recipeId, { pins })
      if (updated) {
        try {
          // Update local cache for immediate UI consistency
          db.recipes.update(recipeId, { pins })
        } catch (e) {
          // ignore cache update errors
        }
        toast({ title: '保存完了', description: '選択した商品を保存しました' })
      } else {
        throw new Error('update failed')
      }
    } catch (e) {
      console.error('failed to persist recipe pins', e)
      toast({ variant: 'destructive', title: '保存失敗', description: '商品の保存に失敗しました' })
    }
  }

  // ===========================
  // 関数: ドラッグ開始時の処理
  // ===========================
  // ドラッグする要素（点 or タグ）とピンIDを記録
  function handleDragStart(type: "dot" | "tag", pinId: string, e: React.MouseEvent) {
    e.stopPropagation() // イベントバブリングを停止
    setDragTarget({ type, pinId })
    setSelectedPinId(pinId) // ピンを選択状態にする
    console.log("[v0] Drag start:", type, pinId)
  }

  // ===========================
  // 関数: ドラッグ中のマウス移動処理
  // ===========================
  // マウスの位置から相対座標（%）を計算してピンを移動
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!pinAreaRef.current || !dragTarget) return

    const rect = pinAreaRef.current.getBoundingClientRect()

    const rawX = ((e.clientX - rect.left) / rect.width) * 100
    const rawY = ((e.clientY - rect.top) / rect.height) * 100

    const padding = 3
    const x = Math.max(padding, Math.min(100 - padding, rawX))
    const y = Math.max(padding, Math.min(100 - padding, rawY))

    setPins(
      pins.map((pin) => {
        if (pin.id !== dragTarget.pinId) return pin

        if (dragTarget.type === "dot") {
          return { ...pin, dotXPercent: x, dotYPercent: y }
        } else {
          return { ...pin, tagXPercent: x, tagYPercent: y }
        }
      }),
    )
  }

  // ===========================
  // 関数: ドラッグ終了時の処理
  // ===========================
  // ドラッグ状態をクリア
  function handleMouseUp() {
    if (dragTarget) {
      setDragTarget(null)
      console.log("[v0] Drag end")
    }
  }

  // ===========================
  // ===========================
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  // ===========================
  // 関数: タッチ開始時の処理を追加
  // ===========================
  function handleTouchStart(type: "dot" | "tag", pinId: string, e: React.TouchEvent) {
    e.stopPropagation()
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    setDragTarget({ type, pinId })
    setSelectedPinId(pinId)
    console.log("[v0] Touch start:", type, pinId)
  }

  // ===========================
  // 関数: タッチ移動時の処理を追加
  // ===========================
  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (!pinAreaRef.current || !dragTarget || !touchStart) return

    const touch = e.touches[0]
    const rect = pinAreaRef.current.getBoundingClientRect()

    const rawX = ((touch.clientX - rect.left) / rect.width) * 100
    const rawY = ((touch.clientY - rect.top) / rect.height) * 100

    const padding = 3
    const x = Math.max(padding, Math.min(100 - padding, rawX))
    const y = Math.max(padding, Math.min(100 - padding, rawY))

    setPins(
      pins.map((pin) => {
        if (pin.id !== dragTarget.pinId) return pin

        if (dragTarget.type === "dot") {
          return { ...pin, dotXPercent: x, dotYPercent: y }
        } else {
          return { ...pin, tagXPercent: x, tagYPercent: y }
        }
      }),
    )
  }

  // ===========================
  // 関数: タッチ終了時の処理を追加
  // ===========================
  function handleTouchEnd() {
    if (dragTarget) {
      setDragTarget(null)
      setTouchStart(null)
      console.log("[v0] Touch end")
    }
  }

  // ===========================
  // 関数: ピンのプロパティを更新
  // ===========================
  // 指定したピンIDのプロパティを部分的に更新
  function updatePin(pinId: string, updates: Partial<Pin>) {
    setPins(pins.map((pin) => (pin.id === pinId ? { ...pin, ...updates } : pin)))
  }

  function toggleFavoriteFont(fontFamily: string) {
    if (!currentUserId) return

    if (favoriteFonts.includes(fontFamily)) {
      db.user.removeFavoriteFont(currentUserId, fontFamily)
      setFavoriteFonts(favoriteFonts.filter((f) => f !== fontFamily))
      toast({
        title: "お気に入りから削除",
        description: "フォントをお気に入りから削除しました",
      })
    } else {
      db.user.addFavoriteFont(currentUserId, fontFamily)
      setFavoriteFonts([...favoriteFonts, fontFamily])
      toast({
        title: "お気に入りに追加",
        description: "フォントをお気に入りに追加しました",
      })
    }
  }

  async function handleFontUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // フォントファイルの検証
    const validExtensions = [".ttf", ".otf", ".woff", ".woff2"]
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()

    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "エラー",
        description: "サポートされているフォント形式：TTF, OTF, WOFF, WOFF2",
        variant: "destructive",
      })
      return
    }

    setIsUploadingFont(true)

    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        const fontDataUrl = event.target?.result as string
        const fontName = file.name.replace(fileExtension, "")
        const fontFamily = `custom-${fontName.replace(/[^a-zA-Z0-9]/g, "-")}`

        // カスタムフォントをデータベースに保存
        const newFont = db.customFonts.create({
          userId: currentUserId,
          name: fontName,
          family: fontFamily,
          fontDataUrl,
        })

        setCustomFonts([...customFonts, newFont])

        // フォントをページに動的にロード
        if (typeof document !== "undefined") {
          const styleId = `custom-font-${fontFamily}`
          if (!document.getElementById(styleId)) {
            const style = document.createElement("style")
            style.id = styleId
            style.textContent = `
              @font-face {
                font-family: '${fontFamily}';
                src: url('${fontDataUrl}');
              }
            `
            document.head.appendChild(style)
          }
        }

        toast({
          title: "アップロード完了",
          description: `${fontName}を追加しました`,
        })

        setIsUploadingFont(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("[v0] Font upload error:", error)
      toast({
        title: "エラー",
        description: "フォントのアップロードに失敗しました",
        variant: "destructive",
      })
      setIsUploadingFont(false)
    }
  }

  function handleDeleteCustomFont(fontId: string) {
    const confirmed = window.confirm("このカスタムフォントを削除しますか？")
    if (!confirmed) return

    db.customFonts.delete(fontId)
    setCustomFonts(customFonts.filter((f) => f.id !== fontId))

    toast({
      title: "削除完了",
      description: "カスタムフォントを削除しました",
    })
  }

  useEffect(() => {
    if (typeof document === "undefined") return

    customFonts.forEach((font) => {
      const styleId = `custom-font-${font.family}`
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style")
        style.id = styleId
        style.textContent = `
          @font-face {
            font-family: '${font.family}';
            src: url('${font.fontDataUrl}');
          }
        `
        document.head.appendChild(style)
      }
    })
  }, [customFonts])

  // ===========================
  // 関数: 選択中のピンのプロパティをすべてのピンに適用
  // ===========================
  function applyToAllPins(scope?: "style" | "font" | "effect") {
    if (!selectedPin) return

    // scope: 'style' | 'font' | undefined (undefined => full)
    const applyScoped = (scope?: "style" | "font" | "effect") => {
      const confirmed = window.confirm(
        scope
          ? `選択中のピンの ${scope === "font" ? "フォント" : scope === "style" ? "スタイル" : "プロパティ"} をすべてのピンに適用しますか？`
          : "選択中のピンのプロパティをすべてのピンに適用しますか？",
      )
      if (!confirmed) return

      setPins(
        pins.map((pin) => {
          if (!scope) {
            return { ...pin, ...selectedPin }
          }

          if (scope === "font") {
            return {
              ...pin,
              tagFontFamily: selectedPin.tagFontFamily,
              tagFontWeight: selectedPin.tagFontWeight,
              tagBold: selectedPin.tagBold,
              tagItalic: selectedPin.tagItalic,
              tagUnderline: selectedPin.tagUnderline,
              tagTextTransform: selectedPin.tagTextTransform,
              tagLetterSpacing: selectedPin.tagLetterSpacing,
              tagLineHeight: selectedPin.tagLineHeight,
              tagVerticalWriting: selectedPin.tagVerticalWriting,
              tagTextAlign: selectedPin.tagTextAlign,
            }
          }

          if (scope === "style") {
            return {
              ...pin,
              dotSizePercent: selectedPin.dotSizePercent,
              dotColor: selectedPin.dotColor,
              dotShape: selectedPin.dotShape,
              tagFontSizePercent: selectedPin.tagFontSizePercent,
              tagBackgroundColor: selectedPin.tagBackgroundColor,
              tagBackgroundOpacity: selectedPin.tagBackgroundOpacity,
              tagBorderWidthPercent: selectedPin.tagBorderWidthPercent,
              tagBorderColor: selectedPin.tagBorderColor,
              tagBorderRadiusPercent: selectedPin.tagBorderRadiusPercent,
              tagShadow: selectedPin.tagShadow,
              tagPaddingXPercent: selectedPin.tagPaddingXPercent,
              tagPaddingYPercent: selectedPin.tagPaddingYPercent,
              lineType: selectedPin.lineType,
              lineWidthPercent: selectedPin.lineWidthPercent,
              lineColor: selectedPin.lineColor,
              tagTextStrokeColor: selectedPin.tagTextStrokeColor,
              tagTextStrokeWidth: selectedPin.tagTextStrokeWidth,
              tagBackgroundWidthPercent: selectedPin.tagBackgroundWidthPercent,
              tagBackgroundHeightPercent: selectedPin.tagBackgroundHeightPercent,
              tagBackgroundOffsetXPercent: selectedPin.tagBackgroundOffsetXPercent,
              tagBackgroundOffsetYPercent: selectedPin.tagBackgroundOffsetYPercent,
              tagShadowColor: selectedPin.tagShadowColor,
              tagShadowOpacity: selectedPin.tagShadowOpacity,
              tagShadowBlur: selectedPin.tagShadowBlur,
              tagShadowDistance: selectedPin.tagShadowDistance,
              tagShadowAngle: selectedPin.tagShadowAngle,
            }
          }

          return pin
        }),
      )

      toast({
        title: "適用完了",
        description: scope
          ? `${scope === "font" ? "フォント" : scope === "style" ? "スタイル" : "プロパティ"}をすべてのピンに適用しました`
          : "すべてのピンに適用しました",
      })
    }

    // 指定されたスコープで適用
    applyScoped(scope)
  }

  // ===========================
  // 関数: レシピを保存してデータベースに書き込む
  // ===========================
  function handleSave() {
    if (!title.trim()) {
      setTempTitle("")
      setShowTitleModal(true)
      return
    }
    if (!imageDataUrl) {
      toast({
        title: "エラー",
        description: "画像をアップロードしてください",
        variant: "destructive",
      })
      return
    }

    saveRecipe(title)
  }

  // ===========================
  // 関数: タイトルモーダルからの保存処理
  // ===========================
  function handleSaveWithTitle() {
    if (!tempTitle.trim()) {
      toast({
        title: "エラー",
        description: "タイトルを入力してください",
        variant: "destructive",
      })
      return
    }
    if (!imageDataUrl) {
      toast({
        title: "エラー",
        description: "画像をアップロードしてください",
        variant: "destructive",
      })
      return
    }

    setTitle(tempTitle)
    setShowTitleModal(false)
    saveRecipe(tempTitle)
  }

  // ===========================
  // 関数: 実際の保存処理を分離
  // ===========================
  function saveRecipe(recipeTitle: string) {
    console.log("[v0] Saving recipe:", recipeId)

    ;(async () => {
      // If imageDataUrl is a data URL, upload it to the server so we can store a public R2 URL
      let finalImageUrl: string | undefined = undefined
      let finalImageKey: string | null = null

      try {
        if (imageDataUrl && imageDataUrl.startsWith("data:")) {
          // Convert data URL to blob and upload via existing upload endpoint
          const res = await fetch(imageDataUrl)
          const blob = await res.blob()
          const fileName = `recipe-${Date.now()}.png`
          const form = new FormData()
          form.append("file", new File([blob], fileName, { type: blob.type || "image/png" }))
          form.append("target", "recipe")

          const uploadResp = await apiFetch('/api/images/upload', { method: 'POST', body: form })
          const uploadJson = await uploadResp.json().catch(() => null)
          if (uploadJson && uploadJson.ok && uploadJson.result) {
            // R2 path returns result: { url: publicUrl, key }
            if (typeof uploadJson.result === "object") {
              finalImageKey = uploadJson.result.key || null
              finalImageUrl = finalImageKey ? (getPublicImageUrl(finalImageKey) || uploadJson.result.url) : (uploadJson.result.url || (Array.isArray(uploadJson.result.variants) ? uploadJson.result.variants[0] : undefined))
            } else if (typeof uploadJson.result === "string") {
              finalImageUrl = uploadJson.result
            }
          }
        }
      } catch (e) {
        console.warn("[v0] recipe image upload failed, falling back to inline data url", e)
      }

      const recipe = db.recipes.getById(recipeId)
      const currentUser = (getCurrentUser && getCurrentUser()) || null
      const uid = currentUser?.id || currentUserId || "user-shirasame"
      const payload: any = {
        title: recipeTitle,
        imageWidth,
        imageHeight,
        updatedAt: new Date().toISOString(),
        published,
      }
      // Ensure pins are included (always an array)
      payload.pins = Array.isArray(pins) ? pins : []

      // Prefer persisting canonical keys only. If we obtained a key from upload,
      // persist `imageKey`. Do NOT include full public URLs or inline data URLs in payloads.
      if (finalImageKey) {
        payload.imageKey = finalImageKey
      } else if (imageDataUrl && imageDataUrl.startsWith("data:")) {
        // We attempted to upload an inline data URL but did not obtain a key.
        // Do not persist raw data URLs to the DB — require an upload (key) first.
        toast({ title: "エラー", description: "画像のアップロードに失敗しました。もう一度アップロードしてください。", variant: "destructive" })
        return
      } else {
        // No upload key available and not an inline data URL. Do not persist public URLs here.
        payload.imageDataUrl = undefined
      }

      // Ensure images[] jsonb is populated on the recipe. Prefer normalized public URL, else inline data URL.
      try {
        const existingImages = (recipe && Array.isArray((recipe as any).images) ? [...(recipe as any).images] : [])
        const primaryKey = payload.imageKey || undefined
        if (primaryKey) {
          const exists = existingImages.find((img: any) => {
            const k = img?.key || img?.id || null
            return k === primaryKey
          })
          if (!exists) {
            const newImg: any = { id: `image-${Date.now()}`, key: primaryKey, uploadedAt: new Date().toISOString() }
            existingImages.unshift(newImg)
          }
        }
        // assign images array to payload
        // Sanitize images to a minimal, key-first representation so we never
        // persist full public URLs (url/publicUrl/variants/basePath) to the DB.
        const sanitizeImagesForServer = (imgs: any[] = []) =>
          (imgs || []).map((img: any) => {
            if (!img) return { id: `image-${Date.now()}` }
            const key = img.key || img.id || ensureImageKey(img) || null
            const sanitized: any = { id: img.id || `image-${Date.now()}` }
            if (key) sanitized.key = key
            if (img.width != null) sanitized.width = img.width
            if (img.height != null) sanitized.height = img.height
            if (img.uploadedAt) sanitized.uploadedAt = img.uploadedAt
            if (img.role) sanitized.role = img.role
            if (img.aspect) sanitized.aspect = img.aspect
            return sanitized
          })
        payload.images = sanitizeImagesForServer(existingImages)
        // Build canonical recipe_image_keys from existing state and newly sanitized images
        try {
          const keysFromPayload = (payload.images || []).map((img: any) => img.key).filter(Boolean)
          const existingKeys = Array.isArray(recipeImageKeys) ? recipeImageKeys : (recipe && Array.isArray((recipe as any).recipe_image_keys) ? (recipe as any).recipe_image_keys : [])
          const mergedKeys = Array.from(new Set([...(existingKeys || []), ...(keysFromPayload || [])]))
          payload.recipe_image_keys = mergedKeys
          setRecipeImageKeys(mergedKeys)
        } catch (e) {
          // ignore
        }
      } catch (e) {
        // ignore errors and continue
      }

      // Persist update to server: editing an existing recipe MUST use UPDATE.
      if (!recipeId) {
        toast({ variant: 'destructive', title: 'エラー', description: '編集対象のレシピIDが見つかりません。新規作成画面から作成してください。' })
        return
      }

      try {
        // Ensure recipe_image_keys exists on payload (canonical single-key or empty array)
        if (!payload.recipe_image_keys) payload.recipe_image_keys = Array.isArray(recipeImageKeys) && recipeImageKeys.length > 0 ? recipeImageKeys : []

        const updated = await RecipesService.update(recipeId, payload)
        if (updated) {
          try { db.recipes.update(recipeId, payload) } catch (e) {}
        } else {
          // fallback to direct PUT if service helper fails
          try {
            await apiFetch(`/api/admin/recipes/${encodeURIComponent(recipeId)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          } catch (e2) {
            throw e2
          }
        }
      } catch (e) {
        console.error('[v0] failed to persist recipe to server', e)
        toast({ variant: 'destructive', title: '保存失敗', description: 'レシピの保存に失敗しました（サーバー）。' })
        return
      }

      // Persist images to server-side recipes.images via admin upsert endpoint.
      // Ensure that uploaded R2 URLs are saved in the DB (best-effort, non-blocking).
      try {
        const imgsToPersist = Array.isArray(payload.images) ? payload.images : []
        for (const img of imgsToPersist) {
          try {
            const body: any = { recipeId, id: img.id, width: img.width || null, height: img.height || null }
            const key = ensureImageKey(img)
            if (key) {
              body.key = key
            } else {
              // If no key found, skip to avoid persisting full URLs in DB
              console.warn('[v0] no image key available for persistence, skipping image', img)
              continue
            }
            await apiFetch('/api/admin/recipe-images/upsert', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            })
          } catch (innerErr) {
            console.warn('[v0] failed to persist recipe image to server', innerErr)
          }
        }
        // Persist canonical recipe_image_keys to server (best-effort)
        try {
          const keysToPersist = Array.isArray(payload.recipe_image_keys) ? payload.recipe_image_keys : []
          if (keysToPersist.length > 0) {
            await RecipesService.update(recipeId, { recipe_image_keys: keysToPersist })
          }
        } catch (e) {
          try {
            await apiFetch(`/api/admin/recipes/${encodeURIComponent(recipeId)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipe_image_keys: payload.recipe_image_keys }) })
          } catch (e2) {
            // swallow
          }
        }
      } catch (e) {
        console.warn('[v0] failed to persist images list', e)
      }

      // save pins (ensure pins are linked to current user)
      const pinsToSave = pins.map((pin) => ({ ...pin, recipeId, userId: (pin as any).userId || uid, createdAt: new Date().toISOString() }))
      try {
        // Await persistence so navigation doesn't happen before DB write completes
        await db.recipePins.updateAll(recipeId, pinsToSave)
      } catch (e) {
        console.warn('[v0] failed to persist recipe pins to server', e)
      }

      toast({ title: "保存完了", description: "レシピを保存しました" })
      setTimeout(() => router.push("/admin/recipes"), 500)
    })()
  }

  // 公開/非公開トグルを即時適用する
  async function handleTogglePublished() {
    const next = !published
    setPublished(next)
    // Immediately update local cache so other UI (lists, caches) reflect the change
    try {
      try { db.recipes.update(recipeId, { published: next }) } catch (err) { /* best-effort */ }
      const res = await apiFetch('/api/admin/recipes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recipeId, published: next }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok) throw new Error(j?.error || 'update failed')
      toast({ title: '更新完了', description: next ? '公開にしました' : '非公開にしました' })
      try { window.dispatchEvent(new Event('recipes:changed')) } catch (e) {}
    } catch (e) {
      // rollback UI + cache on failure
      setPublished(!next)
      try { db.recipes.update(recipeId, { published: !next }) } catch (err) {}
      console.error('[v0] toggle publish failed', e)
      toast({ title: 'エラー', description: '公開状態の更新に失敗しました', variant: 'destructive' })
    }
  }

  // レシピ削除
  async function handleDelete() {
    const confirmed = window.confirm('このレシピを完全に削除しますか？この操作は取り消せません。')
    if (!confirmed) return
    try {
      const res = await apiFetch('/api/admin/recipes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recipeId }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok) throw new Error(j?.error || 'delete failed')
      toast({ title: '削除しました', description: 'レシピを削除しました' })
      router.push('/admin/recipes')
    } catch (e) {
      console.error('[v0] delete recipe failed', e)
      toast({ title: 'エラー', description: 'レシピの削除に失敗しました', variant: 'destructive' })
    }
  }

  // ===========================
  // 関数: タグの接続点（8方向）を計算
  // ===========================
  // タグの4隅と上下左右の中点の座標を返す（線の接続用）
  // Compute connection points for a pin by measuring the actual DOM tag element when available.
  function getConnectionPointsForPin(
    pinId: string,
    tagXPercent: number,
    tagYPercent: number,
    fallbackTagWidthPx: number,
    fallbackTagHeightPx: number,
  ) {
    if (!pinAreaRef.current) return []

    const rect = pinAreaRef.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return []

    const INSET_FACTOR = 0.75

    // Default center based on percent
    let tagCenterPx = { x: (tagXPercent / 100) * rect.width, y: (tagYPercent / 100) * rect.height }
    let halfWidthPx = fallbackTagWidthPx / 2
    let halfHeightPx = fallbackTagHeightPx / 2

    try {
      // Find the actual tag text element inside the pin area and measure it
      const tagEl = pinAreaRef.current.querySelector(`[data-pin-id="${pinId}"] .__pin-tag-text`) as HTMLElement | null
      if (tagEl) {
        const tagRect = tagEl.getBoundingClientRect()
        tagCenterPx = { x: (tagRect.left - rect.left) + tagRect.width / 2, y: (tagRect.top - rect.top) + tagRect.height / 2 }
        halfWidthPx = tagRect.width / 2
        halfHeightPx = tagRect.height / 2
      }
    } catch (e) {
      // ignore and fall back to computed values
    }

    const insetHalfWidthPx = halfWidthPx * INSET_FACTOR
    const insetHalfHeightPx = halfHeightPx * INSET_FACTOR

    const pointsPx = [
      { x: tagCenterPx.x, y: tagCenterPx.y - insetHalfHeightPx }, // 上中
      { x: tagCenterPx.x + insetHalfWidthPx, y: tagCenterPx.y - insetHalfHeightPx }, // 右上
      { x: tagCenterPx.x + insetHalfWidthPx, y: tagCenterPx.y }, // 右中
      { x: tagCenterPx.x + insetHalfWidthPx, y: tagCenterPx.y + insetHalfHeightPx }, // 右下
      { x: tagCenterPx.x, y: tagCenterPx.y + insetHalfHeightPx }, // 下中
      { x: tagCenterPx.x - insetHalfWidthPx, y: tagCenterPx.y + insetHalfHeightPx }, // 左下
      { x: tagCenterPx.x - insetHalfWidthPx, y: tagCenterPx.y }, // 左中
      { x: tagCenterPx.x - insetHalfWidthPx, y: tagCenterPx.y - insetHalfHeightPx }, // 左上
    ]

    return pointsPx.map((p) => ({ x: (p.x / rect.width) * 100, y: (p.y / rect.height) * 100 }))
  }

  // ===========================
  // 関数: 点に最も近い接続点を見つける
  // ===========================
  // 点とタグの接続点の距離を計算し、最も近い点を返す
  function findNearestConnectionPoint(dotX: number, dotY: number, points: { x: number; y: number }[]) {
    if (!points || points.length === 0) {
      return { x: dotX, y: dotY }
    }

    let nearest = points[0]
    let minDist = Number.POSITIVE_INFINITY

    points.forEach((point) => {
      const dist = Math.sqrt(Math.pow(point.x - dotX, 2) + Math.pow(point.y - dotY, 2))
      if (dist < minDist) {
        minDist = dist
        nearest = point
      }
    })

    return nearest
  }

  // ===========================
  // 選択中のピンを取得
  // ===========================
  const selectedPin = pins.find((p) => p.id === selectedPinId)
  const imageAspectRatio = imageWidth > 0 && imageHeight > 0 ? imageWidth / imageHeight : null

  // デスクトップで確実に比率を反映させるため、flex-basis を%で計算して使う
  const desktopTotalFlex = LAYOUT_RATIOS.desktop.imageFlex + LAYOUT_RATIOS.desktop.panelFlex
  const desktopPanelPercent = Math.round((LAYOUT_RATIOS.desktop.panelFlex / desktopTotalFlex) * 100)
  const desktopImagePercent = 100 - desktopPanelPercent

  const filteredFonts = (() => {
    if (fontCategory === "favorite") {
      const allFonts = WEB_FONTS
      const favoriteList = allFonts.filter((font) => favoriteFonts.includes(font.family))
      return fontSearch
        ? favoriteList.filter((font) => font.name.toLowerCase().includes(fontSearch.toLowerCase()))
        : favoriteList
    } else if (fontCategory === "custom") {
      return fontSearch
        ? customFonts.filter((font) => font.name.toLowerCase().includes(fontSearch.toLowerCase()))
        : customFonts
    } else {
      const fonts = getFontsByCategory(fontCategory as any)
      return fontSearch ? fonts.filter((font) => font.name.toLowerCase().includes(fontSearch.toLowerCase())) : fonts
    }
  })()

  // ===========================
  // カラープリセット（プロパティパネル用）
  // ===========================
  const colorPresets = [
    "#ffffff",
    "#000000",
    "#808080",
    "#fbbf24",
    "#f59e0b",
    "#fb923c",
    "#ef4444",
    "#f472b6",
    "#a855f7",
    "#3b82f6",
  ]

  // ===========================
  // ===========================
  useEffect(() => {
    const updateScaleAndSize = () => {
      if (!imageElRef.current || !imageRef.current) return

      const imgRect = imageElRef.current.getBoundingClientRect()
      const wrapperRect = imageRef.current.getBoundingClientRect()

      if (imgRect.width > 0 && imgRect.height > 0) {
        setImageDisplayWidth(Math.round(imgRect.width))
        setImageDisplayHeight(Math.round(imgRect.height))

        // ピンエリアの左上オフセット（wrapper 相対）
        setPinAreaOffsetLeft(Math.round(imgRect.left - wrapperRect.left))
        setPinAreaOffsetTop(Math.round(imgRect.top - wrapperRect.top))

        const scaleX = imgRect.width / imageWidth
        const scaleY = imgRect.height / imageHeight
        const calculatedScale = Math.min(scaleX, scaleY)

        if (isFinite(calculatedScale) && calculatedScale > 0) {
          setScale(calculatedScale)
          console.log("[v0] [編集ページ] スケール更新:", {
            scale: calculatedScale,
            表示サイズ: `${imgRect.width}x${imgRect.height}`,
            基準サイズ: `${imageWidth}x${imageHeight}`,
            scaleX,
            scaleY,
          })
        }
      }
    }

    updateScaleAndSize()
    window.addEventListener("resize", updateScaleAndSize)

    return () => {
      window.removeEventListener("resize", updateScaleAndSize)
    }
  }, [imageDataUrl, imageWidth, imageHeight])

  // モバイル判定: PC以外はスマホ表示フラグを立てる
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === "undefined") return
      setIsMobileView(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // ===========================
  // JSX: UI構造
  // ===========================
  // 画像要素がロードされたときに表示サイズを計測して pinArea に反映
  function handleImageElementLoad() {
    if (!imageElRef.current || !pinAreaRef.current) return
    const imgRect = imageElRef.current.getBoundingClientRect()
    setImageDisplayWidth(Math.round(imgRect.width))
    setImageDisplayHeight(Math.round(imgRect.height))
    // scale は既存の useEffect で再計算されますが、ここでも念の為更新
    const scaleX = imgRect.width / imageWidth
    const scaleY = imgRect.height / imageHeight
    const calculatedScale = Math.min(scaleX, scaleY)
    if (isFinite(calculatedScale) && calculatedScale > 0) setScale(calculatedScale)
  }

  // ResizeObserver で画像の表示サイズ変化を監視（レスポンシブ対応）
  useEffect(() => {
    const el = imageElRef.current
    if (!el) return

    let ro: ResizeObserver | null = null
    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => {
        handleImageElementLoad()
      })
      ro.observe(el)
    } else if (typeof window !== "undefined") {
      // フォールバック
      (globalThis as any).addEventListener("resize", handleImageElementLoad)
    }

    return () => {
      if (ro) ro.disconnect()
      else window.removeEventListener("resize", handleImageElementLoad)
    }
  }, [imageDataUrl, imageWidth, imageHeight])
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-zinc-950">
      {/* ===========================
          ヘッダー: 戻る・商品選択・完了ボタン
          ========================== */}
      <div className="border-b border-zinc-800 bg-zinc-900 shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          {/* 戻るボタン */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/recipes")}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">戻る</span>
          </Button>

          <span className="text-white text-sm font-medium">{title || "レシピ編集"}</span>

          {/* 商品選択・公開切替・完了・削除 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
                onClick={() => openProductModal()}
              className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all duration-200"
            >
              <Package className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">商品選択</span>
            </Button>

            <Button
              size="sm"
              onClick={handleTogglePublished}
              className={`text-white transition-all duration-200 ${published ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-zinc-700 hover:bg-zinc-600'}`}
            >
              <span className="hidden sm:inline">{published ? '公開中' : '非公開'}</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              className="bg-cyan-500 hover:bg-cyan-600 text-white transition-all duration-200"
            >
              <Check className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">完了</span>
            </Button>

            <Button
              size="sm"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
            >
              <Trash className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">削除</span>
            </Button>
          </div>
        </div>
      </div>
        {/* Auto-open upload modal for newly created drafts without images */}
        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>レシピ画像を追加</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <p className="text-sm text-muted-foreground mb-3">このレシピにはまだ画像が登録されていません。ここで画像をアップロードしてください。</p>
              <ImageUpload open={showUploadModal} onOpenChange={setShowUploadModal} aspectRatioType="recipe" onUploadComplete={(k, aspect) => handleUploadCompleteKey(k, aspect)} onChange={() => { }} />
            </div>
            <div className="flex justify-end mt-3">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>閉じる</Button>
              <Button className="ml-2" onClick={() => { setShowUploadModal(false); router.push(`/admin/recipes/edit?id=${recipeId}`) }}>編集画面へ</Button>
            </div>
          </DialogContent>
        </Dialog>

      {/* ===========================
          メインコンテンツエリア
          PC: 左右2分割（画像 | プロパティパネル）
          スマホ: 縦分割（画像 | プロパティ）、プロパティパネルは下部固定ではなく並列配置
          ========================== */}
      <div
        className={isMobileView ? "flex-1 grid overflow-hidden" : "flex-1 flex flex-row overflow-hidden"}
        style={isMobileView ? { gridTemplateRows: `${LAYOUT_RATIOS.mobile.imageRow}fr 0fr` } : undefined}
      >
        {/* ===========================
          画像エリア
        ========================== */}
        <div
          className="flex items-center justify-center p-2 sm:p-4 bg-zinc-900/50"
          style={
            isMobileView
              ? {
                  flexGrow: LAYOUT_RATIOS.desktop.imageFlex,
                  flexShrink: 1,
                  flexBasis: 0,
                  minWidth: 0,
                }
              : {
                  flex: `0 0 ${desktopImagePercent}%`,
                  maxWidth: `${desktopImagePercent}%`,
                  minWidth: 0,
                }
          }
        >
          {!imageDataUrl ? (
            /* 画像未選択時: アップロードボタン表示 */
            <div className="flex flex-col items-center gap-4">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="lg"
                className="bg-cyan-500 hover:bg-cyan-600 text-white transition-all duration-200"
              >
                <Upload className="w-5 h-5 mr-2" />
                画像をアップロード
              </Button>
            </div>
          ) : (
            /* 画像選択済み: キャンバスとピン表示 */
            <div
              className={`relative flex w-full h-full px-3 sm:px-6 ${isMobileView ? "items-start" : "items-center"} justify-center`}
              ref={imageRef}
                style={
                  isMobileView
                    ? {
                        flexGrow: LAYOUT_RATIOS.desktop.imageFlex,
                        flexShrink: 1,
                        flexBasis: 0,
                        minWidth: 0,
                      }
                    : {
                        /* Desktop: allow the image area to grow when space is available
                           (use flex-grow so it doesn't get squeezed to a tiny fixed width). */
                        flex: `1 1 ${desktopImagePercent}%`,
                        minWidth: 0,
                      }
                }
            >
              <div
                className="relative bg-zinc-800 rounded-lg overflow-hidden shadow-2xl mx-auto"
                style={{
                    width: "100%",
                    // Desktop: allow the container to expand, but cap to a reasonable max width
                    // so the image doesn't become excessively large on very wide screens.
                    maxWidth: "1200px",
                  maxHeight: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* レシピ画像 (フロー内に配置してコンテナサイズを決定させる) */}
                <img
                  ref={imageElRef}
                  onLoad={handleImageElementLoad}
                  // If imageDataUrl is an http URL, normalize to public R2 pub domain when possible
                  src={
                    imageDataUrl
                      ? imageDataUrl.startsWith("http")
                        ? getPublicImageUrl(imageDataUrl) || imageDataUrl
                        : imageDataUrl
                      : "/placeholder.svg"
                  }
                  alt={title}
                  className="pointer-events-none select-none block w-full h-full"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />

                <div
                  ref={pinAreaRef}
                  className="absolute inset-0"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    touchAction: "none",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {/* ===========================
                      ピン描画ループ
                      ========================== */}
                  {pins.map((pin) => {
                    const pinAreaRect = pinAreaRef.current?.getBoundingClientRect()
                    if (!pinAreaRect || pinAreaRect.width === 0) return null

                    const imageWidthPx = pinAreaRect.width

                    // パーセント値をピクセルに変換
                    const dotSizePx = (pin.dotSizePercent / 100) * imageWidthPx
                    const fontSizePx = (pin.tagFontSizePercent / 100) * imageWidthPx
                    const lineWidthPx = (pin.lineWidthPercent / 100) * imageWidthPx
                    const paddingXPx = (pin.tagPaddingXPercent / 100) * imageWidthPx
                    const paddingYPx = (pin.tagPaddingYPercent / 100) * imageWidthPx
                    const borderRadiusPx = (pin.tagBorderRadiusPercent / 100) * imageWidthPx
                    const borderWidthPx = (pin.tagBorderWidthPercent / 100) * imageWidthPx

                    const strokeWidthPx = (pin.tagTextStrokeWidth / 100) * imageWidthPx
                    const bgWidthPx =
                      pin.tagBackgroundWidthPercent > 0
                        ? (pin.tagBackgroundWidthPercent / 100) * imageWidthPx
                        : undefined
                    const bgHeightPx =
                      pin.tagBackgroundHeightPercent > 0
                        ? (pin.tagBackgroundHeightPercent / 100) * imageWidthPx
                        : undefined
                    const bgOffsetXPx = (pin.tagBackgroundOffsetXPercent / 100) * imageWidthPx
                    const bgOffsetYPx = (pin.tagBackgroundOffsetYPercent / 100) * imageWidthPx

                    // シャドウの計算
                    const shadowX = Math.cos((pin.tagShadowAngle * Math.PI) / 180) * pin.tagShadowDistance
                    const shadowY = Math.sin((pin.tagShadowAngle * Math.PI) / 180) * pin.tagShadowDistance
                    const shadowColor = pin.tagShadowColor
                    const shadowOpacity = pin.tagShadowOpacity
                    // HEX to RGBA conversion for shadow
                    const r = Number.parseInt(shadowColor.slice(1, 3), 16)
                    const g = Number.parseInt(shadowColor.slice(3, 5), 16)
                    const b = Number.parseInt(shadowColor.slice(5, 7), 16)
                    const shadowRgba = `rgba(${r}, ${g}, ${b}, ${shadowOpacity})`
                    const textShadow = `${shadowX}px ${shadowY}px ${pin.tagShadowBlur}px ${shadowRgba}`

                    if (DEBUG_PINS) {
                      console.log("[v0] [編集ページ] ピン描画:", {
                        pinId: pin.id,
                        画像幅: imageWidthPx,
                        位置: { x: `${pin.dotXPercent}%`, y: `${pin.dotYPercent}%` },
                        パーセント値: {
                          点: `${pin.dotSizePercent}%`,
                          フォント: `${pin.tagFontSizePercent}%`,
                          線: `${pin.lineWidthPercent}%`,
                        },
                        ピクセル値: {
                          点: dotSizePx,
                          フォント: fontSizePx,
                          線: lineWidthPx,
                        },
                      })
                    }

                    const tagText = pin.tagDisplayText || pin.tagText || ""
                    const charCount = tagText.length || 1
                    const estimatedTagWidth = Math.max(100, charCount * fontSizePx * 0.6 + paddingXPx * 2)
                    const estimatedTagHeight = fontSizePx + paddingYPx * 2

                    // Prefer explicit background size when available, otherwise use estimated text width/height
                    const actualTagWidth = bgWidthPx ?? estimatedTagWidth
                    const actualTagHeight = bgHeightPx ?? estimatedTagHeight

                    const connectionPoints = getConnectionPointsForPin(
                      pin.id,
                      pin.tagXPercent,
                      pin.tagYPercent,
                      actualTagWidth,
                      actualTagHeight,
                    )

                    const nearestPoint =
                      connectionPoints.length > 0
                        ? findNearestConnectionPoint(pin.dotXPercent, pin.dotYPercent, connectionPoints)
                        : { x: pin.tagXPercent, y: pin.tagYPercent }

                    return (
                      <div key={pin.id}>
                        {/* 線 */}
                        {nearestPoint && (
                          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                            <line
                              x1={`${pin.dotXPercent}%`}
                              y1={`${pin.dotYPercent}%`}
                              x2={`${nearestPoint.x}%`}
                              y2={`${nearestPoint.y}%`}
                              stroke={pin.lineColor || "#ffffff"}
                              strokeWidth={lineWidthPx}
                              strokeDasharray={
                                pin.lineType === "dashed" ? "5,5" : pin.lineType === "dotted" ? "2,2" : "0"
                              }
                            />
                          </svg>
                        )}

                        {/* 点 */}
                        <div
                          className="absolute z-10"
                          style={{
                            left: `${pin.dotXPercent}%`,
                            top: `${pin.dotYPercent}%`,
                            transform: "translate(-50%, -50%)",
                            // ヒット領域は視覚要素より大きくとる（モバイルで掴みやすく）
                            width: isMobileView ? Math.max(dotSizePx * 3, 40) : Math.max(dotSizePx * 1.6, 24),
                            height: isMobileView ? Math.max(dotSizePx * 3, 40) : Math.max(dotSizePx * 1.6, 24),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "move",
                            // タッチイベントを確実に受け取る
                            touchAction: "none",
                          }}
                          onMouseDown={(e) => handleDragStart("dot", pin.id, e)}
                          onTouchStart={(e) => handleTouchStart("dot", pin.id, e)}
                        >
                          <div
                            // 視覚的なドットは中央に固定し、元のサイズを維持
                            className={`${pin.dotShape === "circle" ? "rounded-full" : ""}`}
                            style={{
                              width: dotSizePx,
                              height: dotSizePx,
                              backgroundColor: pin.dotColor || "#ffffff",
                              border: selectedPinId === pin.id ? "2px solid #3b82f6" : "none",
                              boxSizing: "content-box",
                            }}
                          />
                        </div>

                        {/* タグ */}
                        <div
                          data-pin-id={pin.id}
                          className="absolute cursor-move z-10"
                          style={{
                            left: `${pin.tagXPercent}%`,
                            top: `${pin.tagYPercent}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                          onMouseDown={(e) => handleDragStart("tag", pin.id, e)}
                          onTouchStart={(e) => handleTouchStart("tag", pin.id, e)}
                        >
                          {/* 背景レイヤー（独立制御） */}
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: "50%",
                              transform: `translate(calc(-50% + ${bgOffsetXPx}px), calc(-50% + ${bgOffsetYPx}px))`,
                              width: bgWidthPx ? bgWidthPx : "100%",
                              height: bgHeightPx ? bgHeightPx : "100%",
                              backgroundColor: pin.tagBackgroundColor || "#000000",
                              opacity: isFinite(pin.tagBackgroundOpacity) ? pin.tagBackgroundOpacity : 0.8,
                              borderRadius: borderRadiusPx,
                              border:
                                selectedPinId === pin.id
                                  ? "2px solid #3b82f6"
                                  : borderWidthPx > 0
                                    ? `${borderWidthPx}px solid ${pin.tagBorderColor || "#ffffff"}`
                                    : "none",
                              boxShadow: pin.tagShadow || "0 2px 8px rgba(0,0,0,0.2)",
                              zIndex: -1,
                            }}
                          />

                          {/* テキストレイヤー */}
                          <div
                            className="__pin-tag-text"
                            style={{
                              fontSize: fontSizePx,
                              fontFamily: pin.tagFontFamily || "system-ui",
                              fontWeight: pin.tagBold ? "bold" : pin.tagFontWeight || "normal",
                              fontStyle: pin.tagItalic ? "italic" : "normal",
                              textDecoration: pin.tagUnderline ? "underline" : "none",
                              textTransform: pin.tagTextTransform,
                              color: pin.tagTextColor || "#ffffff",
                              textShadow: textShadow,
                              WebkitTextStroke:
                                strokeWidthPx > 0 ? `${strokeWidthPx}px ${pin.tagTextStrokeColor}` : "none",
                              textAlign: pin.tagTextAlign,
                              writingMode: pin.tagVerticalWriting ? "vertical-rl" : "horizontal-tb",
                              letterSpacing: `${pin.tagLetterSpacing}em`,
                              lineHeight: pin.tagLineHeight,
                              paddingLeft: paddingXPx,
                              paddingRight: paddingXPx,
                              paddingTop: paddingYPx,
                              paddingBottom: paddingYPx,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {tagText}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===========================
            プロパティパネル: 改善されたデザインとアニメーション
            ========================== */}
        {imageDataUrl && (
          <div
            className="flex flex-col border-t sm:border-t-0 sm:border-l border-zinc-800 overflow-hidden bg-zinc-900"
            style={
              isMobileView
                ? {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: mobilePanelMode === "minimized" ? "56px" : "50vh",
                    transition: "height 220ms ease",
                    zIndex: 40,
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                  }
                : {
                    flex: `0 0 ${desktopPanelPercent}%`,
                    maxWidth: `${desktopPanelPercent}%`,
                    minWidth: `${LAYOUT_RATIOS.desktop.panelMinPercent}%`,
                  }
            }
          >
            {/* モバイル用のハンドル: いつでも下部パネルの開閉ができる */}
            {isMobileView && (
              <div className="absolute top-2 left-0 right-0 flex justify-center pointer-events-auto sm:hidden">
                <button
                  onClick={() => setMobilePanelMode((m) => (m === "minimized" ? "focus" : "minimized"))}
                  aria-label="Toggle panel"
                  className="w-10 h-2 rounded-full bg-zinc-700/70"
                />
              </div>
            )}

            {selectedPin ? (
              <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
                <div className="shrink-0 p-2 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between gap-2">
                  {isMobileView && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => setMobilePanelMode((m) => (m === "minimized" ? "focus" : "minimized"))}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                      >
                        {mobilePanelMode === "minimized" ? "編集を開く" : "最小化"}
                      </Button>
                    </div>
                  )}
                </div>

                <Tabs value={parentTab} onValueChange={setParentTab} className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-3 pt-3 pb-0 border-b border-zinc-800 bg-zinc-900/50">
                    <TabsList className="w-full bg-zinc-950/50 p-1 h-9 grid grid-cols-3 gap-1">
                      <TabsTrigger
                        value="style"
                        className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-cyan-400 text-zinc-400 h-7"
                      >
                        スタイル
                      </TabsTrigger>
                      <TabsTrigger
                        value="font"
                        className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-cyan-400 text-zinc-400 h-7"
                      >
                        フォント
                      </TabsTrigger>
                      <TabsTrigger
                        value="pin"
                        className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-cyan-400 text-zinc-400 h-7"
                      >
                        ピン設定
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent
                    value="style"
                    className="flex-1 overflow-hidden flex flex-col mt-0 data-[state=inactive]:hidden"
                  >
                    <Tabs
                      defaultValue={styleTab}
                      onValueChange={setStyleTab}
                      className="flex-1 flex flex-col overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900/30">
                        <TabsList className="w-full bg-transparent p-0 h-auto flex gap-4 overflow-x-auto no-scrollbar">
                          <TabsTrigger
                            value="theme"
                            className="text-[10px] px-0 pb-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none text-zinc-500 h-auto shrink-0"
                          >
                            テーマ
                          </TabsTrigger>
                          <TabsTrigger
                            value="stroke"
                            className="text-[10px] px-0 pb-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none text-zinc-500 h-auto shrink-0"
                          >
                            ストローク
                          </TabsTrigger>
                          <TabsTrigger
                            value="background"
                            className="text-[10px] px-0 pb-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none text-zinc-500 h-auto shrink-0"
                          >
                            背景
                          </TabsTrigger>
                          <TabsTrigger
                            value="shadow"
                            className="text-[10px] px-0 pb-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none text-zinc-500 h-auto shrink-0"
                          >
                            シャドウ
                          </TabsTrigger>
                          <TabsTrigger
                            value="space"
                            className="text-[10px] px-0 pb-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none text-zinc-500 h-auto shrink-0"
                          >
                            スペース
                          </TabsTrigger>
                          <TabsTrigger
                            value="typography"
                            className="text-[10px] px-0 pb-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none text-zinc-500 h-auto shrink-0"
                          >
                            書体
                          </TabsTrigger>
                          <TabsTrigger
                            value="case"
                            className="text-[10px] px-0 pb-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none text-zinc-500 h-auto shrink-0"
                          >
                            大/小文字
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      {/* テーマタブ */}
                      <TabsContent value="theme" className="flex-1 overflow-y-auto p-3 space-y-4 mt-0">
                        <div className="space-y-2">
                          <p className="text-white text-xs font-medium">テキストカラー</p>
                          <div className="flex gap-1.5 items-center flex-wrap">
                            {colorPresets.map((color) => (
                              <button
                                key={color}
                                onClick={() => updatePin(selectedPin.id, { tagTextColor: color })}
                                className="w-6 h-6 rounded-full border border-zinc-700"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            <input
                              type="color"
                              value={selectedPin.tagTextColor}
                              onChange={(e) => updatePin(selectedPin.id, { tagTextColor: e.target.value })}
                              className="w-6 h-6 rounded-full border border-zinc-700 cursor-pointer"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <p className="text-white text-xs font-medium">フォントサイズ</p>
                            <span className="text-cyan-400 text-xs">{selectedPin.tagFontSizePercent.toFixed(1)}%</span>
                          </div>
                          <Slider
                            value={[selectedPin.tagFontSizePercent]}
                            onValueChange={([v]) => updatePin(selectedPin.id, { tagFontSizePercent: v })}
                            min={0.5}
                            max={5.0}
                            step={0.1}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <p className="text-white text-xs font-medium">不透明度</p>
                            <span className="text-cyan-400 text-xs">
                              {Math.round(selectedPin.tagBackgroundOpacity * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={[selectedPin.tagBackgroundOpacity * 100]}
                            onValueChange={([v]) => updatePin(selectedPin.id, { tagBackgroundOpacity: v / 100 })}
                            min={0}
                            max={100}
                            step={1}
                          />
                        </div>
                      </TabsContent>

                      {/* ストロークタブ */}
                      <TabsContent value="stroke" className="flex-1 overflow-y-auto p-3 space-y-4 mt-0">
                        <div className="space-y-2">
                          <p className="text-white text-xs font-medium">ストロークカラー</p>
                          <div className="flex gap-1.5 items-center flex-wrap">
                            <button
                              onClick={() => updatePin(selectedPin.id, { tagTextStrokeColor: "transparent" })}
                              className="w-6 h-6 rounded-full border border-zinc-700 bg-transparent relative overflow-hidden"
                              title="なし"
                            >
                              <div className="absolute inset-0 border-t border-red-500 rotate-45 transform origin-center top-1/2" />
                            </button>
                            {colorPresets.map((color) => (
                              <button
                                key={color}
                                onClick={() => updatePin(selectedPin.id, { tagTextStrokeColor: color })}
                                className="w-6 h-6 rounded-full border border-zinc-700"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            <input
                              type="color"
                              value={
                                selectedPin.tagTextStrokeColor === "transparent"
                                  ? "#000000"
                                  : selectedPin.tagTextStrokeColor
                              }
                              onChange={(e) => updatePin(selectedPin.id, { tagTextStrokeColor: e.target.value })}
                              className="w-6 h-6 rounded-full border border-zinc-700 cursor-pointer"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <p className="text-white text-xs font-medium">ストローク幅</p>
                            <span className="text-cyan-400 text-xs">{selectedPin.tagTextStrokeWidth.toFixed(1)}%</span>
                          </div>
                          <Slider
                            value={[selectedPin.tagTextStrokeWidth]}
                            onValueChange={([v]) => updatePin(selectedPin.id, { tagTextStrokeWidth: v })}
                            min={0}
                            max={1.0}
                            step={0.05}
                          />
                        </div>
                      </TabsContent>

                      {/* 背景タブ */}
                      <TabsContent value="background" className="flex-1 overflow-y-auto p-3 space-y-4 mt-0">
                        <div className="space-y-2">
                          <p className="text-white text-xs font-medium">背景色</p>
                          <div className="flex gap-1.5 items-center flex-wrap">
                            {colorPresets.map((color) => (
                              <button
                                key={color}
                                onClick={() => updatePin(selectedPin.id, { tagBackgroundColor: color })}
                                className="w-6 h-6 rounded-full border border-zinc-700"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            {/* Transparent button */}
                            <button
                              onClick={() => updatePin(selectedPin.id, { tagBackgroundColor: "transparent", tagBackgroundOpacity: 0 })}
                              title="透明"
                              className="w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center text-xs text-zinc-300"
                              style={{ background: "repeating-linear-gradient(45deg,#0000 0 6px,#00000010 6px 12px)" }}
                            >
                              透
                            </button>
                            <input
                              type="color"
                              value={selectedPin.tagBackgroundColor === "transparent" ? "#000000" : selectedPin.tagBackgroundColor}
                              onChange={(e) => updatePin(selectedPin.id, { tagBackgroundColor: e.target.value, tagBackgroundOpacity: selectedPin.tagBackgroundOpacity ?? 1 })}
                              className="w-6 h-6 rounded-full border border-zinc-700 cursor-pointer"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <p className="text-white text-xs font-medium">角丸</p>
                            <span className="text-cyan-400 text-xs">
                              {selectedPin.tagBorderRadiusPercent.toFixed(1)}%
                            </span>
                          </div>
                          <Slider
                            value={[selectedPin.tagBorderRadiusPercent]}
                            onValueChange={([v]) => updatePin(selectedPin.id, { tagBorderRadiusPercent: v })}
                            min={0}
                            max={5.0}
                            step={0.1}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <p className="text-white text-xs font-medium">幅 (0=自動)</p>
                            <span className="text-cyan-400 text-xs">
                              {selectedPin.tagBackgroundWidthPercent.toFixed(1)}%
                            </span>
                          </div>
                          <Slider
                            value={[selectedPin.tagBackgroundWidthPercent]}
                            onValueChange={([v]) => updatePin(selectedPin.id, { tagBackgroundWidthPercent: v })}
                            min={0}
                            max={50}
                            step={0.5}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <p className="text-white text-xs font-medium">高さ (0=自動)</p>
                            <span className="text-cyan-400 text-xs">
                              {selectedPin.tagBackgroundHeightPercent.toFixed(1)}%
                            </span>
                          </div>
                          <Slider
                            value={[selectedPin.tagBackgroundHeightPercent]}
                            onValueChange={([v]) => updatePin(selectedPin.id, { tagBackgroundHeightPercent: v })}
                            min={0}
                            max={20}
                            step={0.5}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <p className="text-white text-xs font-medium">Xオフセット</p>
                            <span className="text-cyan-400 text-xs">
                              {selectedPin.tagBackgroundOffsetXPercent.toFixed(1)}%
                            </span>
                          </div>
                          <Slider
                            value={[selectedPin.tagBackgroundOffsetXPercent]}
                            onValueChange={([v]) => updatePin(selectedPin.id, { tagBackgroundOffsetXPercent: v })}
                            min={-10}
                            max={10}
                            step={0.1}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <p className="text-white text-xs font-medium">Yオフセット</p>
                            <span className="text-cyan-400 text-xs">
                              {selectedPin.tagBackgroundOffsetYPercent.toFixed(1)}%
                            </span>
                          </div>
                          <Slider
                            value={[selectedPin.tagBackgroundOffsetYPercent]}
                            onValueChange={([v]) => updatePin(selectedPin.id, { tagBackgroundOffsetYPercent: v })}
                            min={-10}
                            max={10}
                            step={0.1}
                          />
                        </div>
                      </TabsContent>

                      {/* シャドウタブ */}
                      <TabsContent value="shadow" className="flex-1 overflow-y-auto p-3 space-y-4 mt-0">
                        <div className="space-y-2">
                          <p className="text-white text-xs font-medium">シャドウカラー</p>
                          <div className="flex gap-1.5 items-center flex-wrap">
                            {colorPresets.map((color) => (
                              <button
                                key={color}
                                onClick={() => updatePin(selectedPin.id, { tagShadowColor: color })}
                                className="w-6 h-6 rounded-full border border-zinc-700"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            <input
                              type="color"
                              value={selectedPin.tagShadowColor}
                              onChange={(e) => updatePin(selectedPin.id, { tagShadowColor: e.target.value })}
                              className="w-6 h-6 rounded-full border border-zinc-700 cursor-pointer"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <p className="text-white text-xs font-medium">不透明度</p>
                            <span className="text-cyan-400 text-xs">
                              {Math.round(selectedPin.tagShadowOpacity * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={[selectedPin.tagShadowOpacity * 100]}
                            onValueChange={([v]) => updatePin(selectedPin.id, { tagShadowOpacity: v / 100 })}
                            min={0}
                            max={100}
                            step={1}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <p className="text-white text-xs font-medium">ぼかし</p>
                            <span className="text-cyan-400 text-xs">{selectedPin.tagShadowBlur}px</span>
                          </div>
                          <Slider
                            value={[selectedPin.tagShadowBlur]}
                            onValueChange={([v]) => updatePin(selectedPin.id, { tagShadowBlur: v })}
                            min={0}
                            max={20}
                            step={1}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <p className="text-white text-xs font-medium">距離</p>
                            <span className="text-cyan-400 text-xs">{selectedPin.tagShadowDistance}px</span>
                          </div>
                          <Slider
                            value={[selectedPin.tagShadowDistance]}
                            onValueChange={([v]) => updatePin(selectedPin.id, { tagShadowDistance: v })}
                            min={0}
                            max={20}
                            step={1}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <p className="text-white text-xs font-medium">アングル</p>
                            <span className="text-cyan-400 text-xs">{selectedPin.tagShadowAngle}°</span>
                          </div>
                          <Slider
                            value={[selectedPin.tagShadowAngle]}
                            onValueChange={([v]) => updatePin(selectedPin.id, { tagShadowAngle: v })}
                            min={0}
                            max={360}
                            step={15}
                          />
                        </div>
                      </TabsContent>

                      {/* スペースタブ */}
                      <TabsContent value="space" className="flex-1 overflow-y-auto p-3 space-y-4 mt-0">
                        <div className="space-y-2">
                          <p className="text-white text-xs font-medium">配置</p>
                          <div className="flex gap-2 bg-zinc-800 p-1 rounded-md">
                            <button
                              onClick={() => updatePin(selectedPin.id, { tagTextAlign: "left" })}
                              className={`flex-1 py-1 rounded text-xs flex justify-center ${selectedPin.tagTextAlign === "left" ? "bg-cyan-500 text-white" : "text-zinc-400 hover:text-white"}`}
                            >
                              <AlignLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updatePin(selectedPin.id, { tagTextAlign: "center" })}
                              className={`flex-1 py-1 rounded text-xs flex justify-center ${selectedPin.tagTextAlign === "center" ? "bg-cyan-500 text-white" : "text-zinc-400 hover:text-white"}`}
                            >
                              <AlignCenter className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updatePin(selectedPin.id, { tagTextAlign: "right" })}
                              className={`flex-1 py-1 rounded text-xs flex justify-center ${selectedPin.tagTextAlign === "right" ? "bg-cyan-500 text-white" : "text-zinc-400 hover:text-white"}`}
                            >
                              <AlignRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-white text-xs font-medium">縦書き</p>
                          <button
                            onClick={() =>
                              updatePin(selectedPin.id, { tagVerticalWriting: !selectedPin.tagVerticalWriting })
                            }
                            className={`w-10 h-5 rounded-full relative transition-colors ${selectedPin.tagVerticalWriting ? "bg-cyan-500" : "bg-zinc-700"}`}
                          >
                            <div
                              className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${selectedPin.tagVerticalWriting ? "left-6" : "left-1"}`}
                            />
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <p className="text-white text-xs font-medium">文字間隔</p>
                            <span className="text-cyan-400 text-xs">{selectedPin.tagLetterSpacing.toFixed(2)}em</span>
                          </div>
                          <Slider
                            value={[selectedPin.tagLetterSpacing]}
                            onValueChange={([v]) => updatePin(selectedPin.id, { tagLetterSpacing: v })}
                            min={-0.1}
                            max={1.0}
                            step={0.05}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <p className="text-white text-xs font-medium">行間隔</p>
                            <span className="text-cyan-400 text-xs">{selectedPin.tagLineHeight.toFixed(1)}</span>
                          </div>
                          <Slider
                            value={[selectedPin.tagLineHeight]}
                            onValueChange={([v]) => updatePin(selectedPin.id, { tagLineHeight: v })}
                            min={0.8}
                            max={3.0}
                            step={0.1}
                          />
                        </div>
                      </TabsContent>

                      {/* 書体タブ (Typography) */}
                      <TabsContent value="typography" className="flex-1 overflow-y-auto p-3 space-y-4 mt-0">
                        <div className="space-y-2">
                          <p className="text-white text-xs font-medium">スタイル</p>
                          <div className="flex gap-2 bg-zinc-800 p-1 rounded-md">
                            <button
                              onClick={() => updatePin(selectedPin.id, { tagBold: !selectedPin.tagBold })}
                              className={`flex-1 py-1 rounded text-xs flex justify-center ${selectedPin.tagBold ? "bg-cyan-500 text-white" : "text-zinc-400 hover:text-white"}`}
                            >
                              <Bold className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updatePin(selectedPin.id, { tagItalic: !selectedPin.tagItalic })}
                              className={`flex-1 py-1 rounded text-xs flex justify-center ${selectedPin.tagItalic ? "bg-cyan-500 text-white" : "text-zinc-400 hover:text-white"}`}
                            >
                              <Italic className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updatePin(selectedPin.id, { tagUnderline: !selectedPin.tagUnderline })}
                              className={`flex-1 py-1 rounded text-xs flex justify-center ${selectedPin.tagUnderline ? "bg-cyan-500 text-white" : "text-zinc-400 hover:text-white"}`}
                            >
                              <Underline className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </TabsContent>

                      {/* 大/小文字タブ */}
                      <TabsContent value="case" className="flex-1 overflow-y-auto p-3 space-y-4 mt-0">
                        <div className="space-y-2">
                          <p className="text-white text-xs font-medium">変換</p>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => updatePin(selectedPin.id, { tagTextTransform: "none" })}
                              className={`px-3 py-2 rounded text-xs text-left ${selectedPin.tagTextTransform === "none" ? "bg-cyan-500 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
                            >
                              指定なし (None)
                            </button>
                            <button
                              onClick={() => updatePin(selectedPin.id, { tagTextTransform: "uppercase" })}
                              className={`px-3 py-2 rounded text-xs text-left ${selectedPin.tagTextTransform === "uppercase" ? "bg-cyan-500 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
                            >
                              大文字 (UPPERCASE)
                            </button>
                            <button
                              onClick={() => updatePin(selectedPin.id, { tagTextTransform: "lowercase" })}
                              className={`px-3 py-2 rounded text-xs text-left ${selectedPin.tagTextTransform === "lowercase" ? "bg-cyan-500 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
                            >
                              小文字 (lowercase)
                            </button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </TabsContent>

                  <TabsContent
                    value="font"
                    className="flex-1 overflow-hidden p-3 mt-0 flex flex-col data-[state=inactive]:hidden"
                  >
                    {/* フィルターUI */}
                    <div className="space-y-2 mb-3 shrink-0">
                      <div className="flex gap-1 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
                        <button
                          onClick={() => setFontCategory("all")}
                          className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 flex-none border ${
                            fontCategory === "all"
                              ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          すべて
                        </button>
                        <button
                          onClick={() => setFontCategory("japanese")}
                          className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 flex-none border ${
                            fontCategory === "japanese"
                              ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          日本語
                        </button>
                        <button
                          onClick={() => setFontCategory("english")}
                          className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 flex-none border ${
                            fontCategory === "english"
                              ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          英語
                        </button>
                        <button
                          onClick={() => setFontCategory("favorite")}
                          className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 flex-none border ${
                            fontCategory === "favorite"
                              ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          お気に入り
                        </button>
                        <button
                          onClick={() => setFontCategory("custom")}
                          className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 flex-none border ${
                            fontCategory === "custom"
                              ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          カスタム
                        </button>
                      </div>

                      {/* 検索ボックス */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-zinc-500" />
                        <Input
                          placeholder="フォント名で検索..."
                          value={fontSearch}
                          onChange={(e) => setFontSearch(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white text-xs h-8 pl-8"
                        />
                      </div>

                      {fontCategory === "custom" && (
                        <div>
                          <input
                            type="file"
                            accept=".ttf,.otf,.woff,.woff2"
                            onChange={handleFontUpload}
                            className="hidden"
                            id="font-upload"
                          />
                          <Button
                            onClick={() => document.getElementById("font-upload")?.click()}
                            disabled={isUploadingFont}
                            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-xs h-8"
                          >
                            {isUploadingFont ? "アップロード中..." : "フォントをアップロード"}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* フォントリスト */}
                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                      <div className="grid grid-cols-2 gap-2 pb-4">
                        {fontCategory === "custom" ? (
                          filteredFonts.length === 0 ? (
                            <div className="col-span-2 text-center text-zinc-500 text-xs py-8">
                              カスタムフォントがありません。
                              <br />
                              フォントファイルをアップロードしてください。
                            </div>
                          ) : (
                            filteredFonts.map((font: any) => (
                              <div
                                key={font.id}
                                className={`p-2 rounded-lg border text-left text-xs transition-all duration-200 ${
                                  selectedPin.tagFontFamily === font.family
                                    ? "border-cyan-400 bg-cyan-400/10 text-white shadow-lg shadow-cyan-400/20"
                                    : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
                                }`}
                              >
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => updatePin(selectedPin.id, { tagFontFamily: font.family })}
                                    className="text-left truncate w-full"
                                    style={{ fontFamily: font.family }}
                                    title={font.name}
                                  >
                                    {font.name}
                                  </button>
                                  <Button
                                    onClick={() => handleDeleteCustomFont(font.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-full text-zinc-500 hover:text-red-400 text-xs"
                                  >
                                    削除
                                  </Button>
                                </div>
                              </div>
                            ))
                          )
                        ) : fontCategory === "favorite" ? (
                          filteredFonts.length === 0 ? (
                            <div className="col-span-2 text-center text-zinc-500 text-xs py-8">
                              お気に入りフォントがありません。
                              <br />
                              フォント横のハートアイコンをクリックして追加してください。
                            </div>
                          ) : (
                            filteredFonts.map((font: any) => (
                              <button
                                key={font.family}
                                onClick={() => {
                                  updatePin(selectedPin.id, { tagFontFamily: font.family })
                                  if (typeof document !== "undefined") {
                                    const linkId = `font-${font.family.replace(/[^a-zA-Z0-9]/g, "-")}`
                                    if (!document.getElementById(linkId)) {
                                      const link = document.createElement("link")
                                      link.id = linkId
                                      link.rel = "stylesheet"
                                      link.href = font.googleFontUrl
                                      document.head.appendChild(link)
                                    }
                                  }
                                }}
                                className={`p-2 rounded-lg border text-left text-xs transition-all duration-200 truncate ${
                                  selectedPin.tagFontFamily === font.family
                                    ? "border-cyan-400 bg-cyan-400/10 text-white shadow-lg shadow-cyan-400/20"
                                    : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
                                }`}
                                style={{ fontFamily: font.family }}
                                title={font.name}
                              >
                                {font.name}
                              </button>
                            ))
                          )
                        ) : (
                          filteredFonts.map((font: any) => (
                            <div
                              key={font.family}
                              className={`p-2 rounded-lg border text-left text-xs transition-all duration-200 ${
                                selectedPin.tagFontFamily === font.family
                                  ? "border-cyan-400 bg-cyan-400/10 text-white shadow-lg shadow-cyan-400/20"
                                  : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    updatePin(selectedPin.id, { tagFontFamily: font.family })
                                    if (typeof document !== "undefined") {
                                      const linkId = `font-${font.family.replace(/[^a-zA-Z0-9]/g, "-")}`
                                      if (!document.getElementById(linkId)) {
                                        const link = document.createElement("link")
                                        link.id = linkId
                                        link.rel = "stylesheet"
                                        link.href = font.googleFontUrl
                                        document.head.appendChild(link)
                                      }
                                    }
                                  }}
                                  className="text-left truncate flex-1"
                                  style={{ fontFamily: font.family }}
                                  title={font.name}
                                >
                                  {font.name}
                                </button>
                                <button
                                  onClick={() => toggleFavoriteFont(font.family)}
                                  className={`text-xs transition-colors shrink-0 ${
                                    favoriteFonts.includes(font.family)
                                      ? "text-red-400 hover:text-red-500"
                                      : "text-zinc-500 hover:text-red-400"
                                  }`}
                                  aria-label={
                                    favoriteFonts.includes(font.family) ? "お気に入りを外す" : "お気に入りに追加"
                                  }
                                  title={favoriteFonts.includes(font.family) ? "お気に入り解除" : "お気に入り追加"}
                                >
                                  {favoriteFonts.includes(font.family) ? "★" : "☆"}
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="pin"
                    className="flex-1 overflow-y-auto p-3 space-y-4 mt-0 data-[state=inactive]:hidden"
                  >
                    <div className="space-y-4">
                      {selectedPinId ? (
                        <div className="mb-6 space-y-2">
                          <Label>タグ表示テキスト</Label>
                          <div className="flex gap-2">
                            <Input
                              value={tagDisplayText}
                              onChange={(e) => {
                                const v = e.target.value
                                setTagDisplayText(v)
                                if (selectedPinId) updatePin(selectedPinId, { tagDisplayText: v })
                              }}
                              placeholder="商品名の代わりに表示"
                            />
                            <Button size="icon" onClick={applyTagDisplayText} title="適用">
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">空欄の場合は商品名が表示されます</p>
                        </div>
                      ) : (
                        <div className="mb-6 p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
                          ピンを選択すると
                          <br />
                          テキストを変更できます
                        </div>
                      )}
                      <div className="space-y-2">
                        <p className="text-white text-xs font-medium">点の形状</p>
                        <div className="flex gap-2 bg-zinc-800 p-1 rounded-md">
                          <button
                            onClick={() => updatePin(selectedPin.id, { dotShape: "circle" })}
                            className={`flex-1 py-2 rounded text-xs flex justify-center items-center gap-2 ${selectedPin.dotShape === "circle" ? "bg-cyan-500 text-white" : "text-zinc-400 hover:text-white"}`}
                          >
                            <div className="w-3 h-3 rounded-full bg-current" />
                            円形
                          </button>
                          <button
                            onClick={() => updatePin(selectedPin.id, { dotShape: "square" })}
                            className={`flex-1 py-2 rounded text-xs flex justify-center items-center gap-2 ${selectedPin.dotShape === "square" ? "bg-cyan-500 text-white" : "text-zinc-400 hover:text-white"}`}
                          >
                            <div className="w-3 h-3 bg-current" />
                            四角
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-white text-xs font-medium">点の色</p>
                        <div className="flex gap-1.5 items-center flex-wrap">
                          {colorPresets.map((color) => (
                            <button
                              key={color}
                              onClick={() => updatePin(selectedPin.id, { dotColor: color })}
                              className="w-6 h-6 rounded-full border border-zinc-700"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                          <input
                            type="color"
                            value={selectedPin.dotColor}
                            onChange={(e) => updatePin(selectedPin.id, { dotColor: e.target.value })}
                            className="w-6 h-6 rounded-full border border-zinc-700 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <p className="text-white text-xs font-medium">点のサイズ</p>
                          <span className="text-cyan-400 text-xs">{selectedPin.dotSizePercent.toFixed(1)}%</span>
                        </div>
                        <Slider
                          value={[selectedPin.dotSizePercent]}
                          onValueChange={([v]) => updatePin(selectedPin.id, { dotSizePercent: v })}
                          min={0.5}
                          max={5.0}
                          step={0.1}
                        />
                      </div>

                      <div className="space-y-2 pt-4 border-t border-zinc-800">
                        <p className="text-zinc-500 text-xs">※ ピンの位置は画像上のドラッグで調整できます。</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500 p-4 text-sm animate-in fade-in duration-300">
                ピンを選択してプロパティを編集
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===========================
          商品選択モーダル
          ========================== */}
      <Dialog open={showProductModal} onOpenChange={(open) => { if (!open) persistPins(); setShowProductModal(open); }}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>商品を選択</span>
              <Button variant="ghost" size="sm" onClick={() => setShowProductModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh]">
            {/** Selected / Available two-column layout similar to collections manager */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">含まれている商品</h3>
                <div className="grid grid-cols-3 md:grid-cols-2 gap-4">
                  {selectedProductIds.length > 0 ? (
                    selectedProductIds.map((pid) => {
                      const product = products.find((p) => p.id === pid)
                      if (!product) return null
                      return (
                        <div key={product.id} className="relative">
                          <ProductCard product={product} isAdminMode={true} />
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2"
                            onClick={() => toggleProductSelection(product.id)}
                          >
                            解除
                          </Button>
                        </div>
                      )
                    })
                  ) : (
                    <p className="col-span-full text-center text-muted-foreground py-8">商品がありません</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">追加できる商品</h3>
                <div className="grid grid-cols-3 md:grid-cols-2 gap-4">
                  {products.filter((p) => !selectedProductIds.includes(p.id)).map((product) => (
                    <div key={product.id} className="relative">
                      <ProductCard product={product} isAdminMode={true} />
                      <Button
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => toggleProductSelection(product.id)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        追加
                      </Button>
                    </div>
                  ))}
                  {products.filter((p) => !selectedProductIds.includes(p.id)).length === 0 && (
                    <p className="col-span-full text-center text-muted-foreground py-8">すべての商品が追加されています</p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">{selectedProductIds.length}個の商品が選択されています</p>
            <Button onClick={() => setShowProductModal(false)}>完了</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===========================
          画像トリミングモーダル
          ========================== */}
      {showCropper && (
        <ImageCropper
          open={showCropper}
          onOpenChange={setShowCropper}
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          aspectRatioType="recipe"
        />
      )}

      {/* ===========================
          タイトル入力モーダル
          ========================== */}
      <Dialog open={showTitleModal} onOpenChange={setShowTitleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>レシピタイトルを入力</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">タイトル</label>
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="レシピのタイトルを入力してください"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveWithTitle()
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowTitleModal(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSaveWithTitle} className="bg-cyan-500 hover:bg-cyan-600">
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
