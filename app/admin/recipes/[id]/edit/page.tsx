"use client"

// ===========================
// インポート: 必要なライブラリとコンポーネント
// ===========================
import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from 'next/navigation'
import { db } from "@/lib/db/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Check, Upload, X, Package } from 'lucide-react'
import { ImageCropper } from "@/components/image-cropper"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "@/components/product-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { WEB_FONTS, getFontsByCategory } from "@/lib/fonts/web-fonts"
import { getCurrentUser } from "@/lib/auth"

const DEFAULT_STAGE_ASPECT_RATIO = 3 / 2 // 画像がまだ無いときのフォールバック比率
const LAYOUT_RATIOS = {
  mobile: { imageRow: 3, panelRow: 2, panelMinPercent: 40 },
  desktop: { imageFlex: 3, panelFlex: 2, panelMinPercent: 32 },
} as const

// ===========================
// 型定義: Pinオブジェクトの構造
// ===========================
// ピンは「点」「タグ」「線」の3つの要素で構成されています
type Pin = {
  id: string                      // 一意のID
  productId: string               // 紐づいている商品のID
  
  // 位置（画像サイズに対するパーセント、0-100）
  dotXPercent: number             // 点のX座標（%）
  dotYPercent: number             // 点のY座標（%）
  tagXPercent: number             // タグのX座標（%）
  tagYPercent: number             // タグのY座標（%）
  
  // サイズ（画像幅に対するパーセント）
  dotSizePercent: number          // 点のサイズ（画像幅の%）default: 1.2
  tagFontSizePercent: number      // フォントサイズ（画像幅の%）default: 1.4
  lineWidthPercent: number        // 線の太さ（画像幅の%）default: 0.2
  tagPaddingXPercent: number      // 横パディング（画像幅の%）default: 1.2
  tagPaddingYPercent: number      // 縦パディング（画像幅の%）default: 0.6
  tagBorderRadiusPercent: number  // 角丸（画像幅の%）default: 0.4
  tagBorderWidthPercent: number   // 枠線（画像幅の%）default: 0
  
  // スタイル
  dotColor: string                // 点の色（HEX形式）
  dotShape: 'circle' | 'square' | 'triangle' | 'diamond' // 点の形状
  tagText: string                 // タグに表示するテキスト
  tagFontFamily: string           // フォントファミリー
  tagFontWeight: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700' // フォントの太さ
  tagTextColor: string            // テキストカラー（HEX形式）
  tagTextShadow: string           // テキストシャドウ（CSS形式）
  tagBackgroundColor: string      // 背景色（HEX形式）
  tagBackgroundOpacity: number    // 背景の不透明度（0-1）
  tagBorderColor: string          // 枠線の色（HEX形式）
  tagShadow: string               // ボックスシャドウ（CSS形式）
  lineType: 'solid' | 'dashed' | 'dotted' | 'wavy' | 'hand-drawn' // 線のスタイル
  lineColor: string               // 線の色（HEX形式）
}

// ===========================
// ドラッグ対象の型定義
// ===========================
// ドラッグ中の要素（点 or タグ）を追跡するための型
type DragTarget = { type: 'dot' | 'tag', pinId: string } | null

// ===========================
// メインコンポーネント
// ===========================
export default function RecipeEditPage() {

  const { toast } = useToast()

  // ===========================
  // ルーティング関連のフック
  // ===========================
  const router = useRouter()          // ページ遷移用
  const params = useParams()          // URLパラメータ取得用
  const recipeId = params.id as string // レシピID

  // ===========================
  // ステート変数: レシピの基本情報
  // ===========================
  const [title, setTitle] = useState("")                     // レシピタイトル
  const [imageDataUrl, setImageDataUrl] = useState("")       // 画像のBase64 DataURL
  const [imageWidth, setImageWidth] = useState(1920)         // 画像の元の幅
  const [imageHeight, setImageHeight] = useState(1080)       // 画像の元の高さ
  const [pins, setPins] = useState<Pin[]>([])                // ピンの配列
  
  // ===========================
  // ステート変数: 商品選択関連
  // ===========================
  const [products, setProducts] = useState<any[]>([])                // すべての商品リスト
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]) // 選択中の商品ID配列
  
  // ===========================
  // ステート変数: UI制御
  // ===========================
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null) // 選択中のピンID
  const [dragTarget, setDragTarget] = useState<DragTarget>(null)          // ドラッグ中の要素
  const [showCropper, setShowCropper] = useState(false)                   // トリミングモーダル表示フラグ
  const [tempImageUrl, setTempImageUrl] = useState("")                    // トリミング前の一時画像URL
  const [showProductModal, setShowProductModal] = useState(false)         // 商品選択モーダル表示フラグ
  const [activeTab, setActiveTab] = useState("style")                     // プロパティパネルのアクティブタブ
  const [showTitleModal, setShowTitleModal] = useState(false)              // タイトル入力モーダル用のステート追加
  const [tempTitle, setTempTitle] = useState("")                          // タイトル入力モーダル用のステート追加
  const [scale, setScale] = useState(1)                                   // スケールをstateで管理

  const [customFonts, setCustomFonts] = useState<any[]>([])
  const [favoriteFonts, setFavoriteFonts] = useState<string[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [isUploadingFont, setIsUploadingFont] = useState(false)

  const [fontCategory, setFontCategory] = useState<'japanese' | 'english' | 'all' | 'favorite' | 'custom'>('all')
  const [fontSearch, setFontSearch] = useState('')

  // ===========================
  // Ref: DOM要素への参照
  // ===========================
  const imageRef = useRef<HTMLDivElement>(null)        // 画像コンテナへの参照
  const pinAreaRef = useRef<HTMLDivElement>(null)      // ピン配置エリアへの参照（画像と完全に一致）
  const imageElRef = useRef<HTMLImageElement | null>(null) // 実際に表示される img 要素の参照
  const [imageDisplayWidth, setImageDisplayWidth] = useState<number | null>(null)
  const [imageDisplayHeight, setImageDisplayHeight] = useState<number | null>(null)
  const [pinAreaOffsetLeft, setPinAreaOffsetLeft] = useState<number>(0)
  const [pinAreaOffsetTop, setPinAreaOffsetTop] = useState<number>(0)
  const [isMobileView, setIsMobileView] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)  // ファイル入力への参照

  // ===========================
  // 初回ロード時にデータを読み込む
  // ===========================
  useEffect(() => {
    loadData()
    loadUserFonts()
  }, [recipeId])

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
  // ===========================
  function loadData() {
    console.log("[v0] Loading recipe data:", recipeId)
    
    // レシピ本体を取得
    const recipe = db.recipes.getById(recipeId)
    if (recipe) {
      setTitle(recipe.title || "")
      setImageDataUrl(recipe.imageDataUrl || "")
      setImageWidth(recipe.imageWidth || 1920)
      setImageHeight(recipe.imageHeight || 1080)
      
      // ピンデータを取得（新スキーマ優先、古いスキーマもフォールバック）
      const recipePins = db.recipePins.getByRecipeId(recipeId)
      if (recipePins && recipePins.length > 0) {
        setPins(recipePins as Pin[])
        setSelectedProductIds(recipePins.map((p: any) => p.productId))
      } else if (recipe.pins && recipe.pins.length > 0) {
        const convertedPins = recipe.pins.map((oldPin: any) => ({
          id: oldPin.id || `pin-${Date.now()}-${oldPin.productId}`,
          productId: oldPin.productId,
          // 位置（パーセント）
          dotXPercent: oldPin.dotXPercent || 20,
          dotYPercent: oldPin.dotYPercent || 50,
          tagXPercent: oldPin.tagXPercent || 80,
          tagYPercent: oldPin.tagYPercent || 50,
          // サイズ（画像幅に対するパーセント）
          dotSizePercent: oldPin.dotSize ? (oldPin.dotSize / (recipe.imageWidth || 1920) * 100) : 1.2,
          tagFontSizePercent: oldPin.tagFontSize ? (oldPin.tagFontSize / (recipe.imageWidth || 1920) * 100) : 1.4,
          lineWidthPercent: oldPin.lineWidth ? (oldPin.lineWidth / (recipe.imageWidth || 1920) * 100) : 0.2,
          tagPaddingXPercent: oldPin.tagPaddingX ? (oldPin.tagPaddingX / (recipe.imageWidth || 1920) * 100) : 1.2,
          tagPaddingYPercent: oldPin.tagPaddingY ? (oldPin.tagPaddingY / (recipe.imageWidth || 1920) * 100) : 0.6,
          tagBorderRadiusPercent: oldPin.tagBorderRadius ? (oldPin.tagBorderRadius / (recipe.imageWidth || 1920) * 100) : 0.4,
          tagBorderWidthPercent: oldPin.tagBorderWidth ? (oldPin.tagBorderWidth / (recipe.imageWidth || 1920) * 100) : 0,
          // スタイル
          dotColor: oldPin.dotColor || '#ffffff',
          dotShape: oldPin.dotShape || 'circle',
          tagText: oldPin.tagText || oldPin.text || '',
          tagFontFamily: oldPin.tagFontFamily || 'system-ui',
          tagFontWeight: oldPin.tagFontWeight || 'normal',
          tagTextColor: oldPin.tagTextColor || '#ffffff',
          tagTextShadow: oldPin.tagTextShadow || '0 2px 4px rgba(0,0,0,0.3)',
          tagBackgroundColor: oldPin.tagBackgroundColor || '#000000',
          tagBackgroundOpacity: oldPin.tagBackgroundOpacity ?? 0.8,
          tagBorderColor: oldPin.tagBorderColor || '#ffffff',
          tagShadow: oldPin.tagShadow || '0 2px 8px rgba(0,0,0,0.2)',
          lineType: oldPin.lineType || 'solid',
          lineColor: oldPin.lineColor || '#ffffff',
        }))
        setPins(convertedPins)
        setSelectedProductIds(convertedPins.map((p: any) => p.productId))
      }
    }

    // すべての商品を取得
    const productsData = db.products.getAll()
    setProducts(productsData)
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
    
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        setPins(currentPins => currentPins.filter(p => p.productId !== productId))
        return prev.filter(id => id !== productId)
      } else {
        const product = products.find(p => p.id === productId)
        if (product) {
          const newPin: Pin = {
            id: `pin-${Date.now()}-${productId}`,
            productId,
            // 位置（パーセント値）
            dotXPercent: 20,
            dotYPercent: 50 + (Math.random() - 0.5) * 40,
            tagXPercent: 80,
            tagYPercent: 50 + (Math.random() - 0.5) * 40,
            // サイズ（画像幅に対するパーセント値）
            dotSizePercent: 1.2,        // 画像幅の1.2%
            tagFontSizePercent: 1.4,    // 画像幅の1.4%
            lineWidthPercent: 0.2,      // 画像幅の0.2%
            tagPaddingXPercent: 1.2,    // 画像幅の1.2%
            tagPaddingYPercent: 0.6,    // 画像幅の0.6%
            tagBorderRadiusPercent: 0.4, // 画像幅の0.4%
            tagBorderWidthPercent: 0,    // 画像幅の0%
            // スタイル
            dotColor: '#ffffff',
            dotShape: 'circle',
            tagText: product.title,
            tagFontFamily: 'system-ui',
            tagFontWeight: 'normal',
            tagTextColor: '#ffffff',
            tagTextShadow: '0 2px 4px rgba(0,0,0,0.3)',
            tagBackgroundColor: '#000000',
            tagBackgroundOpacity: 0.8,
            tagBorderColor: '#ffffff',
            tagShadow: '0 2px 8px rgba(0,0,0,0.2)',
            lineType: 'solid',
            lineColor: '#ffffff',
          }
          setPins(currentPins => [...currentPins, newPin])
          console.log("[v0] Added new pin:", newPin.id)
        }
        return [...prev, productId]
      }
    })
  }

  // ===========================
  // 関数: ドラッグ開始時の処理
  // ===========================
  // ドラッグする要素（点 or タグ）とピンIDを記録
  function handleDragStart(type: 'dot' | 'tag', pinId: string, e: React.MouseEvent) {
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

    setPins(pins.map(pin => {
      if (pin.id !== dragTarget.pinId) return pin
    
      if (dragTarget.type === 'dot') {
        return { ...pin, dotXPercent: x, dotYPercent: y }
      } else {
        return { ...pin, tagXPercent: x, tagYPercent: y }
      }
    }))
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
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null)

  // ===========================
  // 関数: タッチ開始時の処理を追加
  // ===========================
  function handleTouchStart(type: 'dot' | 'tag', pinId: string, e: React.TouchEvent) {
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

    setPins(pins.map(pin => {
      if (pin.id !== dragTarget.pinId) return pin
      
      if (dragTarget.type === 'dot') {
        return { ...pin, dotXPercent: x, dotYPercent: y }
      } else {
        return { ...pin, tagXPercent: x, tagYPercent: y }
      }
    }))
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
    setPins(pins.map(pin => pin.id === pinId ? { ...pin, ...updates } : pin))
  }

  function toggleFavoriteFont(fontFamily: string) {
    if (!currentUserId) return
    
    if (favoriteFonts.includes(fontFamily)) {
      db.user.removeFavoriteFont(currentUserId, fontFamily)
      setFavoriteFonts(favoriteFonts.filter(f => f !== fontFamily))
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
    const validExtensions = ['.ttf', '.otf', '.woff', '.woff2']
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    
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
        const fontName = file.name.replace(fileExtension, '')
        const fontFamily = `custom-${fontName.replace(/[^a-zA-Z0-9]/g, '-')}`

        // カスタムフォントをデータベースに保存
        const newFont = db.customFonts.create({
          userId: currentUserId,
          name: fontName,
          family: fontFamily,
          fontDataUrl,
        })

        setCustomFonts([...customFonts, newFont])
        
        // フォントをページに動的にロード
        if (typeof document !== 'undefined') {
          const styleId = `custom-font-${fontFamily}`
          if (!document.getElementById(styleId)) {
            const style = document.createElement('style')
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
      console.error('[v0] Font upload error:', error)
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
    setCustomFonts(customFonts.filter(f => f.id !== fontId))
    
    toast({
      title: "削除完了",
      description: "カスタムフォントを削除しました",
    })
  }

  useEffect(() => {
    if (typeof document === 'undefined') return
    
    customFonts.forEach(font => {
      const styleId = `custom-font-${font.family}`
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style')
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
  function applyToAllPins() {
    if (!selectedPin) return
    
    const confirmed = window.confirm("選択中のピンのプロパティをすべてのピンに適用しますか？")
    if (!confirmed) return
    
    setPins(pins.map(pin => ({
      ...pin,
      dotSizePercent: selectedPin.dotSizePercent,
      dotColor: selectedPin.dotColor,
      dotShape: selectedPin.dotShape,
      tagFontSizePercent: selectedPin.tagFontSizePercent,
      tagFontFamily: selectedPin.tagFontFamily,
      tagFontWeight: selectedPin.tagFontWeight,
      tagTextColor: selectedPin.tagTextColor,
      tagTextShadow: selectedPin.tagTextShadow,
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
    })))
    
    toast({
      title: "適用完了",
      description: "すべてのピンに適用しました",
    })
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
    
    const recipe = db.recipes.getById(recipeId)
    if (recipe) {
      db.recipes.update(recipeId, {
        title: recipeTitle,
        imageDataUrl,
        imageWidth,
        imageHeight,
      })
    } else {
      db.recipes.create({
        id: recipeId,
        userId: "user-shirasame",
        title: recipeTitle,
        imageDataUrl,
        imageWidth,
        imageHeight,
        published: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    // パーセント値をそのまま保存（スケール計算不要）
    const pinsToSave = pins.map(pin => ({
      ...pin,
      recipeId,
      createdAt: new Date().toISOString(),
    }))

    console.log('[v0] [編集ページ] 保存:', {
      例: {
        値: { 
          点のサイズ: `${pins[0]?.dotSizePercent}%`, 
          フォント: `${pins[0]?.tagFontSizePercent}%`, 
          位置: `${pins[0]?.dotXPercent}%, ${pins[0]?.dotYPercent}%`
        }
      }
    })

    db.recipePins.updateAll(recipeId, pinsToSave)

    toast({
      title: "保存完了",
      description: "レシピを保存しました",
    })
    
    setTimeout(() => {
      router.push("/admin/recipes")
    }, 500)
  }

  // ===========================
  // 関数: タグの接続点（8方向）を計算
  // ===========================
  // タグの4隅と上下左右の中点の座標を返す（線の接続用）
  function getConnectionPoints(tagXPercent: number, tagYPercent: number, tagWidth: number, tagHeight: number) {
    if (!pinAreaRef.current) return []
    
    const rect = pinAreaRef.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return []
    
    const offsetX = (tagWidth / rect.width) * 100
    const offsetY = (tagHeight / rect.height) * 100
    
    return [
      { x: tagXPercent, y: tagYPercent - offsetY / 2 },               // 上中
      { x: tagXPercent + offsetX / 2, y: tagYPercent - offsetY / 2 }, // 右上
      { x: tagXPercent + offsetX / 2, y: tagYPercent },               // 右中
      { x: tagXPercent + offsetX / 2, y: tagYPercent + offsetY / 2 }, // 右下
      { x: tagXPercent, y: tagYPercent + offsetY / 2 },               // 下中
      { x: tagXPercent - offsetX / 2, y: tagYPercent + offsetY / 2 }, // 左下
      { x: tagXPercent - offsetX / 2, y: tagYPercent },               // 左中
      { x: tagXPercent - offsetX / 2, y: tagYPercent - offsetY / 2 }, // 左上
    ]
  }

  // ===========================
  // 関数: 点に最も近い接続点を見つける
  // ===========================
  // 点とタグの接続点の距離を計算し、最も近い点を返す
  function findNearestConnectionPoint(dotX: number, dotY: number, points: { x: number, y: number }[]) {
    if (!points || points.length === 0) {
      return { x: dotX, y: dotY }
    }
    
    let nearest = points[0]
    let minDist = Infinity
    
    points.forEach(point => {
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
  const selectedPin = pins.find(p => p.id === selectedPinId)
  const imageAspectRatio = imageWidth > 0 && imageHeight > 0 ? imageWidth / imageHeight : null

  const filteredFonts = (() => {
    if (fontCategory === 'favorite') {
      const allFonts = WEB_FONTS
      const favoriteList = allFonts.filter(font => favoriteFonts.includes(font.family))
      return fontSearch 
        ? favoriteList.filter(font => font.name.toLowerCase().includes(fontSearch.toLowerCase()))
        : favoriteList
    } else if (fontCategory === 'custom') {
      return fontSearch
        ? customFonts.filter(font => font.name.toLowerCase().includes(fontSearch.toLowerCase()))
        : customFonts
    } else {
      const fonts = getFontsByCategory(fontCategory as any)
      return fontSearch 
        ? fonts.filter(font => font.name.toLowerCase().includes(fontSearch.toLowerCase()))
        : fonts
    }
  })()

  // ===========================
  // カラープリセット（プロパティパネル用）
  // ===========================
  const colorPresets = [
    '#ffffff', '#000000', '#808080', '#fbbf24', '#f59e0b', '#fb923c', 
    '#ef4444', '#f472b6', '#a855f7', '#3b82f6'
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
          console.log('[v0] [編集ページ] スケール更新:', {
            scale: calculatedScale,
            表示サイズ: `${imgRect.width}x${imgRect.height}`,
            基準サイズ: `${imageWidth}x${imageHeight}`,
            scaleX,
            scaleY
          })
        }
      }
    }

    updateScaleAndSize()
    window.addEventListener('resize', updateScaleAndSize)

    return () => {
      window.removeEventListener('resize', updateScaleAndSize)
    }
  }, [imageDataUrl, imageWidth, imageHeight])

  // モバイル判定: PC以外はスマホ表示フラグを立てる
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === 'undefined') return
      setIsMobileView(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => {
        handleImageElementLoad()
      })
      ro.observe(el)
    } else {
      // フォールバック
      window.addEventListener('resize', handleImageElementLoad)
    }

    return () => {
      if (ro) ro.disconnect()
      else window.removeEventListener('resize', handleImageElementLoad)
    }
  }, [imageDataUrl, imageWidth, imageHeight])
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-zinc-950">
      {/* ===========================
          ヘッダー: 戻る・商品選択・完了ボタン
          ========================== */}
      <div className="border-b border-zinc-800 bg-zinc-900 flex-shrink-0">
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
          
          {/* 商品選択・完了ボタン */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowProductModal(true)}
              className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all duration-200"
            >
              <Package className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">商品選択</span>
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              className="bg-cyan-500 hover:bg-cyan-600 text-white transition-all duration-200"
            >
              <Check className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">完了</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ===========================
          メインコンテンツエリア
          PC: 左右2分割（画像 | プロパティパネル）
          スマホ: 縦分割（画像 | プロパティ）、プロパティパネルは下部固定ではなく並列配置
          ========================== */}
      <div
        className="flex-1 grid sm:flex sm:flex-row overflow-hidden"
        style={{
          gridTemplateRows: `${LAYOUT_RATIOS.mobile.imageRow}fr ${LAYOUT_RATIOS.mobile.panelRow}fr`,
        }}
      >
        {/* ===========================
          画像エリア
        ========================== */}
        <div
          className="flex items-center justify-center p-2 sm:p-4 bg-zinc-900/50"
          style={{
            flexGrow: LAYOUT_RATIOS.desktop.imageFlex,
            flexShrink: 1,
            flexBasis: 0,
            minWidth: 0,
          }}
        >
  

          {!imageDataUrl ? (
            /* 画像未選択時: アップロードボタン表示 */
            <div className="flex flex-col items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
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
              ref={imageRef}
              className="relative flex w-full h-full px-3 sm:px-6 items-center justify-center"
            >
              <div
                className="relative bg-zinc-800 rounded-lg overflow-hidden shadow-2xl mx-auto"
                style={{
                  aspectRatio: imageAspectRatio ?? DEFAULT_STAGE_ASPECT_RATIO,
                  maxWidth: '100%',
                  maxHeight: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {/* レシピ画像 (フロー内に配置してコンテナサイズを決定させる) */}
                <img
                  ref={imageElRef}
                  onLoad={handleImageElementLoad}
                  src={imageDataUrl || "/placeholder.svg"}
                  alt={title}
                  className="pointer-events-none select-none block"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
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
                    touchAction: 'none',
                    width: '100%',
                    height: '100%',
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

              console.log('[v0] [編集ページ] ピン描画:', {
                pinId: pin.id,
                画像幅: imageWidthPx,
                位置: { x: `${pin.dotXPercent}%`, y: `${pin.dotYPercent}%` },
                パーセント値: {
                  点: `${pin.dotSizePercent}%`,
                  フォント: `${pin.tagFontSizePercent}%`,
                  線: `${pin.lineWidthPercent}%`
                },
                ピクセル値: {
                  点: dotSizePx,
                  フォント: fontSizePx,
                  線: lineWidthPx
                }
              })

              const tagText = pin.tagText || ''
              const charCount = tagText.length || 1
              const estimatedTagWidth = Math.max(100, charCount * fontSizePx * 0.6 + paddingXPx * 2)
              const estimatedTagHeight = fontSizePx + paddingYPx * 2
              
              const connectionPoints = getConnectionPoints(
                pin.tagXPercent, 
                pin.tagYPercent, 
                estimatedTagWidth, 
                estimatedTagHeight
              )
              
              const nearestPoint = connectionPoints.length > 0 
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
                        stroke={pin.lineColor || '#ffffff'}
                        strokeWidth={lineWidthPx}
                        strokeDasharray={pin.lineType === 'dashed' ? '5,5' : pin.lineType === 'dotted' ? '2,2' : '0'}
                      />
                    </svg>
                  )}

                  {/* 点 */}
                  <div
                    className="absolute z-10"
                    style={{
                      left: `${pin.dotXPercent}%`,
                      top: `${pin.dotYPercent}%`,
                      transform: 'translate(-50%, -50%)',
                      // ヒット領域は視覚要素より大きくとる（モバイルで掴みやすく）
                      width: isMobileView ? Math.max(dotSizePx * 3, 40) : Math.max(dotSizePx * 1.6, 24),
                      height: isMobileView ? Math.max(dotSizePx * 3, 40) : Math.max(dotSizePx * 1.6, 24),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'move',
                      // タッチイベントを確実に受け取る
                      touchAction: 'none'
                    }}
                    onMouseDown={(e) => handleDragStart('dot', pin.id, e)}
                    onTouchStart={(e) => handleTouchStart('dot', pin.id, e)}
                  >
                    <div
                      // 視覚的なドットは中央に固定し、元のサイズを維持
                      className={`${pin.dotShape === 'circle' ? 'rounded-full' : ''}`}
                      style={{
                        width: dotSizePx,
                        height: dotSizePx,
                        backgroundColor: pin.dotColor || '#ffffff',
                        border: selectedPinId === pin.id ? '2px solid #3b82f6' : 'none',
                        boxSizing: 'content-box',
                      }}
                    />
                  </div>

                  {/* タグ */}
                  <div
                    className="absolute cursor-move z-10"
                    style={{
                      left: `${pin.tagXPercent}%`,
                      top: `${pin.tagYPercent}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseDown={(e) => handleDragStart('tag', pin.id, e)}
                    onTouchStart={(e) => handleTouchStart('tag', pin.id, e)}
                  >
                    <div
                      style={{
                        fontSize: fontSizePx,
                        fontFamily: pin.tagFontFamily || 'system-ui',
                        fontWeight: pin.tagFontWeight || 'normal',
                        color: pin.tagTextColor || '#ffffff',
                        textShadow: pin.tagTextShadow || '0 2px 4px rgba(0,0,0,0.3)',
                        backgroundColor: pin.tagBackgroundColor || '#000000',
                        opacity: isFinite(pin.tagBackgroundOpacity) ? pin.tagBackgroundOpacity : 0.8,
                        borderRadius: borderRadiusPx,
                        boxShadow: pin.tagShadow || '0 2px 8px rgba(0,0,0,0.2)',
                        paddingLeft: paddingXPx,
                        paddingRight: paddingXPx,
                        paddingTop: paddingYPx,
                        paddingBottom: paddingYPx,
                        border: selectedPinId === pin.id 
                          ? '2px solid #3b82f6' 
                          : borderWidthPx > 0 ? `${borderWidthPx}px solid ${pin.tagBorderColor || '#ffffff'}` : 'none',
                        whiteSpace: 'nowrap',
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
            style={{
              flexGrow: LAYOUT_RATIOS.desktop.panelFlex,
              flexShrink: 1,
              flexBasis: 0,
              minWidth: isMobileView ? '100%' : `${LAYOUT_RATIOS.desktop.panelMinPercent}%`,
              minHeight: isMobileView ? `${LAYOUT_RATIOS.mobile.panelMinPercent}%` : undefined,
            }}
          >
            {selectedPin ? (
              <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
                <div className="flex-shrink-0 p-2 border-b border-zinc-800 bg-zinc-900">
                  <Button
                    onClick={applyToAllPins}
                    size="sm"
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-xs transition-all duration-200"
                  >
                    すべてのピンに適用
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                  {/* タブヘッダー: より小さく洗練されたデザイン */}
                  <TabsList className="w-full justify-start bg-zinc-900 border-b border-zinc-800 rounded-none h-10 flex-shrink-0 px-2">
                    <TabsTrigger 
                      value="style" 
                      className="text-xs text-zinc-400 data-[state=active]:text-cyan-400 data-[state=active]:bg-zinc-800 rounded-md px-3 py-1.5 transition-all duration-200"
                    >
                      スタイル
                    </TabsTrigger>
                    <TabsTrigger 
                      value="font" 
                      className="text-xs text-zinc-400 data-[state=active]:text-cyan-400 data-[state=active]:bg-zinc-800 rounded-md px-3 py-1.5 transition-all duration-200"
                    >
                      フォント
                    </TabsTrigger>
                    <TabsTrigger 
                      value="effect" 
                      className="text-xs text-zinc-400 data-[state=active]:text-cyan-400 data-[state=active]:bg-zinc-800 rounded-md px-3 py-1.5 transition-all duration-200"
                    >
                      エフェクト
                    </TabsTrigger>
                  </TabsList>

                  {/* スタイルタブ: コンパクト化とアニメーション追加 */}
                  <TabsContent value="style" className="flex-1 overflow-y-auto p-3 space-y-3 mt-0 animate-in slide-in-from-bottom-2 duration-200">
                    {/* カラー選択 */}
                    <div className="space-y-2">
                      <p className="text-white text-xs font-medium">カラー</p>
                      <div className="flex gap-1.5 items-center flex-wrap">
                        {colorPresets.map(color => (
                          <button
                            key={color}
                            onClick={() => updatePin(selectedPin.id, { tagBackgroundColor: color })}
                            className="w-8 h-8 rounded-full border-2 border-zinc-700 hover:border-cyan-400 hover:scale-110 transition-all duration-200"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <input
                          type="color"
                          value={selectedPin.tagBackgroundColor}
                          onChange={(e) => updatePin(selectedPin.id, { tagBackgroundColor: e.target.value })}
                          className="w-8 h-8 rounded-full border-2 border-zinc-700 cursor-pointer hover:scale-110 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* サイズスライダー: パーセント値で管理 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <p className="text-white text-xs font-medium">サイズ</p>
                        <span className="text-cyan-400 text-xs font-mono">{selectedPin.tagFontSizePercent.toFixed(1)}%</span>
                      </div>
                      <Slider
                        value={[selectedPin.tagFontSizePercent]}
                        onValueChange={([value]) => updatePin(selectedPin.id, { tagFontSizePercent: value })}
                        min={1.0}
                        max={5.0}
                        step={0.1}
                        className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400 [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200"
                      />
                    </div>

                    {/* 不透明度スライダー */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <p className="text-white text-xs font-medium">不透明度</p>
                        <span className="text-cyan-400 text-xs font-mono">{Math.round(selectedPin.tagBackgroundOpacity * 100)}%</span>
                      </div>
                      <Slider
                        value={[selectedPin.tagBackgroundOpacity * 100]}
                        onValueChange={([value]) => updatePin(selectedPin.id, { tagBackgroundOpacity: value / 100 })}
                        min={0}
                        max={100}
                        step={1}
                        className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400 [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200"
                      />
                    </div>

                    {/* 角丸スライダー: パーセント値で管理 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <p className="text-white text-xs font-medium">角丸</p>
                        <span className="text-cyan-400 text-xs font-mono">{selectedPin.tagBorderRadiusPercent.toFixed(1)}%</span>
                      </div>
                      <Slider
                        value={[selectedPin.tagBorderRadiusPercent]}
                        onValueChange={([value]) => updatePin(selectedPin.id, { tagBorderRadiusPercent: value })}
                        min={0}
                        max={2.0}
                        step={0.1}
                        className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400 [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200"
                      />
                    </div>

                    {/* 点のサイズ: パーセント値で管理 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <p className="text-white text-xs font-medium">点のサイズ</p>
                        <span className="text-cyan-400 text-xs font-mono">{selectedPin.dotSizePercent.toFixed(1)}%</span>
                      </div>
                      <Slider
                        value={[selectedPin.dotSizePercent]}
                        onValueChange={([value]) => updatePin(selectedPin.id, { dotSizePercent: value })}
                        min={0.5}
                        max={3.0}
                        step={0.1}
                        className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400 [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200"
                      />
                    </div>

                    {/* 線の太さ: パーセント値で管理 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <p className="text-white text-xs font-medium">線の太さ</p>
                        <span className="text-cyan-400 text-xs font-mono">{selectedPin.lineWidthPercent.toFixed(1)}%</span>
                      </div>
                      <Slider
                        value={[selectedPin.lineWidthPercent]}
                        onValueChange={([value]) => updatePin(selectedPin.id, { lineWidthPercent: value })}
                        min={0.1}
                        max={1.0}
                        step={0.1}
                        className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400 [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="font" className="flex-1 overflow-hidden p-3 mt-0 animate-in slide-in-from-bottom-2 duration-200 flex flex-col">
                    {/* フィルターUI */}
                    <div className="space-y-2 mb-3 flex-shrink-0">
                      <div className="grid grid-cols-5 gap-1">
                        <button
                          onClick={() => setFontCategory('all')}
                          className={`px-2 py-1.5 rounded text-xs transition-all duration-200 ${
                            fontCategory === 'all'
                              ? 'bg-cyan-400 text-white'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          すべて
                        </button>
                        <button
                          onClick={() => setFontCategory('japanese')}
                          className={`px-2 py-1.5 rounded text-xs transition-all duration-200 ${
                            fontCategory === 'japanese'
                              ? 'bg-cyan-400 text-white'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          日本語
                        </button>
                        <button
                          onClick={() => setFontCategory('english')}
                          className={`px-2 py-1.5 rounded text-xs transition-all duration-200 ${
                            fontCategory === 'english'
                              ? 'bg-cyan-400 text-white'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          英語
                        </button>
                        <button
                          onClick={() => setFontCategory('favorite')}
                          className={`px-2 py-1.5 rounded text-xs transition-all duration-200 ${
                            fontCategory === 'favorite'
                              ? 'bg-cyan-400 text-white'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          お気に入り
                        </button>
                        <button
                          onClick={() => setFontCategory('custom')}
                          className={`px-2 py-1.5 rounded text-xs transition-all duration-200 ${
                            fontCategory === 'custom'
                              ? 'bg-cyan-400 text-white'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          カスタム
                        </button>
                      </div>

                      {/* 検索ボックス */}
                      <Input
                        placeholder="フォント名で検索..."
                        value={fontSearch}
                        onChange={(e) => setFontSearch(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white text-xs h-8"
                      />

                      {fontCategory === 'custom' && (
                        <div>
                          <input
                            type="file"
                            accept=".ttf,.otf,.woff,.woff2"
                            onChange={handleFontUpload}
                            className="hidden"
                            id="font-upload"
                          />
                          <Button
                            onClick={() => document.getElementById('font-upload')?.click()}
                            disabled={isUploadingFont}
                            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-xs h-8"
                          >
                            {isUploadingFont ? 'アップロード中...' : 'フォントをアップロード'}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* フォントリスト */}
                    <ScrollArea className="flex-1">
                      <div className="grid grid-cols-3 gap-1">
                        {fontCategory === 'custom' ? (
                          filteredFonts.length === 0 ? (
                            <div className="col-span-3 text-center text-zinc-500 text-xs py-8">
                              カスタムフォントがありません。<br/>
                              フォントファイルをアップロードしてください。
                            </div>
                          ) : (
                            filteredFonts.map((font: any) => (
                              <div
                                key={font.id}
                                className={`p-2 rounded-lg border text-left text-xs transition-all duration-200 ${
                                  selectedPin.tagFontFamily === font.family
                                    ? 'border-cyan-400 bg-cyan-400/10 text-white shadow-lg shadow-cyan-400/20'
                                    : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                                }`}
                              >
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => updatePin(selectedPin.id, { tagFontFamily: font.family })}
                                    className="text-left truncate"
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
                        ) : fontCategory === 'favorite' ? (
                          filteredFonts.length === 0 ? (
                            <div className="col-span-3 text-center text-zinc-500 text-xs py-8">
                              お気に入りフォントがありません。<br/>
                              フォント横のハートアイコンをクリックして追加してください。
                            </div>
                          ) : (
                            filteredFonts.map((font: any) => (
                              <button
                                key={font.family}
                                onClick={() => {
                                  updatePin(selectedPin.id, { tagFontFamily: font.family })
                                  if (typeof document !== 'undefined') {
                                    const linkId = `font-${font.family.replace(/[^a-zA-Z0-9]/g, '-')}`
                                    if (!document.getElementById(linkId)) {
                                      const link = document.createElement('link')
                                      link.id = linkId
                                      link.rel = 'stylesheet'
                                      link.href = font.googleFontUrl
                                      document.head.appendChild(link)
                                    }
                                  }
                                }}
                                className={`p-2 rounded-lg border text-left text-xs transition-all duration-200 truncate ${
                                  selectedPin.tagFontFamily === font.family
                                    ? 'border-cyan-400 bg-cyan-400/10 text-white shadow-lg shadow-cyan-400/20'
                                    : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
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
                                  ? 'border-cyan-400 bg-cyan-400/10 text-white shadow-lg shadow-cyan-400/20'
                                  : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    updatePin(selectedPin.id, { tagFontFamily: font.family })
                                    if (typeof document !== 'undefined') {
                                      const linkId = `font-${font.family.replace(/[^a-zA-Z0-9]/g, '-')}`
                                      if (!document.getElementById(linkId)) {
                                        const link = document.createElement('link')
                                        link.id = linkId
                                        link.rel = 'stylesheet'
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
                                  className={`text-xs transition-colors flex-shrink-0 ${
                                    favoriteFonts.includes(font.family)
                                      ? 'text-red-400 hover:text-red-500'
                                      : 'text-zinc-500 hover:text-red-400'
                                  }`}
                                  aria-label={favoriteFonts.includes(font.family) ? 'お気に入りを外す' : 'お気に入りに追加'}
                                  title={favoriteFonts.includes(font.family) ? 'お気に入り解除' : 'お気に入り追加'}
                                >
                                  {favoriteFonts.includes(font.family) ? '★' : '☆'}
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="effect" className="flex-1 overflow-y-auto p-3 mt-0 animate-in slide-in-from-bottom-2 duration-200">
                    <p className="text-zinc-500 text-xs text-center py-4">エフェクト機能は開発中です</p>
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
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>商品を選択</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProductModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="relative cursor-pointer"
                  onClick={() => toggleProductSelection(product.id)}
                >
                  {/* 選択チェックマーク */}
                  {selectedProductIds.includes(product.id) && (
                    <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <ProductCard
                    product={product}
                    size="sm"
                    isAdminMode={true}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedProductIds.length}個の商品が選択されています
            </p>
            <Button onClick={() => setShowProductModal(false)}>
              完了
            </Button>
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
                  if (e.key === 'Enter') {
                    handleSaveWithTitle()
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowTitleModal(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSaveWithTitle}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
