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

// ===========================
// 型定義: Pinオブジェクトの構造
// ===========================
// ピンは「点」「タグ」「線」の3つの要素で構成されています
type Pin = {
  id: string                      // 一意のID
  productId: string               // 紐づいている商品のID
  
  // 点（Dot）のプロパティ
  dotXPercent: number             // 点のX座標（画像幅の%）
  dotYPercent: number             // 点のY座標（画像高さの%）
  dotSize: number                 // 点のサイズ（ピクセル）
  dotColor: string                // 点の色（HEX形式）
  dotShape: 'circle' | 'square' | 'triangle' | 'diamond' // 点の形状
  
  // タグ（Tag）のプロパティ
  tagXPercent: number             // タグのX座標（画像幅の%）
  tagYPercent: number             // タグのY座標（画像高さの%）
  tagText: string                 // タグに表示するテキスト
  tagFontSize: number             // フォントサイズ（ピクセル）
  tagFontFamily: string           // フォントファミリー
  tagFontWeight: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700' // フォントの太さ
  tagTextColor: string            // テキストカラー（HEX形式）
  tagTextShadow: string           // テキストシャドウ（CSS形式）
  tagBackgroundColor: string      // 背景色（HEX形式）
  tagBackgroundOpacity: number    // 背景の不透明度（0-1）
  tagBorderWidth: number          // 枠線の太さ（ピクセル）
  tagBorderColor: string          // 枠線の色（HEX形式）
  tagBorderRadius: number         // 角丸の半径（ピクセル）
  tagShadow: string               // ボックスシャドウ（CSS形式）
  tagPaddingX: number             // 左右のパディング（ピクセル）
  tagPaddingY: number             // 上下のパディング（ピクセル）
  
  // 線（Line）のプロパティ
  lineType: 'solid' | 'dashed' | 'dotted' | 'wavy' | 'hand-drawn' // 線のスタイル
  lineWidth: number               // 線の太さ（ピクセル）
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

  // ===========================
  // Ref: DOM要素への参照
  // ===========================
  const imageRef = useRef<HTMLDivElement>(null)        // 画像コンテナへの参照（ドラッグ座標計算用）
  const fileInputRef = useRef<HTMLInputElement>(null)  // ファイル入力への参照

  // ===========================
  // 初回ロード時にデータを読み込む
  // ===========================
  useEffect(() => {
    loadData()
  }, [recipeId])

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
          dotXPercent: oldPin.dotXPercent || 20,
          dotYPercent: oldPin.dotYPercent || 50,
          dotSize: oldPin.dotSize || 12,
          dotColor: oldPin.dotColor || '#ffffff',
          dotShape: oldPin.dotShape || 'circle',
          tagXPercent: oldPin.tagXPercent || 80,
          tagYPercent: oldPin.tagYPercent || 50,
          tagText: oldPin.tagText || oldPin.text || '',
          tagFontSize: oldPin.tagFontSize || oldPin.fontSize || 14,
          tagFontFamily: oldPin.tagFontFamily || 'system-ui',
          tagFontWeight: oldPin.tagFontWeight || 'normal',
          tagTextColor: oldPin.tagTextColor || '#ffffff',
          tagTextShadow: oldPin.tagTextShadow || '0 2px 4px rgba(0,0,0,0.3)',
          tagBackgroundColor: oldPin.tagBackgroundColor || '#000000',
          tagBackgroundOpacity: oldPin.tagBackgroundOpacity ?? 0.8,
          tagBorderWidth: oldPin.tagBorderWidth || 0,
          tagBorderColor: oldPin.tagBorderColor || '#ffffff',
          tagBorderRadius: oldPin.tagBorderRadius || 4,
          tagShadow: oldPin.tagShadow || '0 2px 8px rgba(0,0,0,0.2)',
          tagPaddingX: oldPin.tagPaddingX || 12,
          tagPaddingY: oldPin.tagPaddingY || 6,
          lineType: oldPin.lineType || 'solid',
          lineWidth: oldPin.lineWidth || 2,
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
            // 点の初期位置（左側20%、ランダムなY座標）
            dotXPercent: 20,
            dotYPercent: 50 + (Math.random() - 0.5) * 40,
            dotSize: 12,
            dotColor: '#ffffff',
            dotShape: 'circle',
            // タグの初期位置（右側80%、ランダムなY座標）
            tagXPercent: 80,
            tagYPercent: 50 + (Math.random() - 0.5) * 40,
            tagText: product.title,
            tagFontSize: 14,
            tagFontFamily: 'system-ui',
            tagFontWeight: 'normal',
            tagTextColor: '#ffffff',
            tagTextShadow: '0 2px 4px rgba(0,0,0,0.3)',
            tagBackgroundColor: '#000000',
            tagBackgroundOpacity: 0.8,
            tagBorderWidth: 0,
            tagBorderColor: '#ffffff',
            tagBorderRadius: 4,
            tagShadow: '0 2px 8px rgba(0,0,0,0.2)',
            tagPaddingX: 12,
            tagPaddingY: 6,
            lineType: 'solid',
            lineWidth: 2,
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
    if (!imageRef.current || !dragTarget) return

    const rect = imageRef.current.getBoundingClientRect()
    
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
    if (!imageRef.current || !dragTarget || !touchStart) return

    const touch = e.touches[0]
    const rect = imageRef.current.getBoundingClientRect()
    
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

  // ===========================
  // 関数: 選択中のピンのプロパティをすべてのピンに適用
  // ===========================
  function applyToAllPins() {
    if (!selectedPin) return
    
    const confirmed = window.confirm("選択中のピンのプロパティをすべてのピンに適用しますか？")
    if (!confirmed) return
    
    setPins(pins.map(pin => ({
      ...pin,
      dotSize: selectedPin.dotSize,
      dotColor: selectedPin.dotColor,
      dotShape: selectedPin.dotShape,
      tagFontSize: selectedPin.tagFontSize,
      tagFontFamily: selectedPin.tagFontFamily,
      tagFontWeight: selectedPin.tagFontWeight,
      tagTextColor: selectedPin.tagTextColor,
      tagTextShadow: selectedPin.tagTextShadow,
      tagBackgroundColor: selectedPin.tagBackgroundColor,
      tagBackgroundOpacity: selectedPin.tagBackgroundOpacity,
      tagBorderWidth: selectedPin.tagBorderWidth,
      tagBorderColor: selectedPin.tagBorderColor,
      tagBorderRadius: selectedPin.tagBorderRadius,
      tagShadow: selectedPin.tagShadow,
      tagPaddingX: selectedPin.tagPaddingX,
      tagPaddingY: selectedPin.tagPaddingY,
      lineType: selectedPin.lineType,
      lineWidth: selectedPin.lineWidth,
      lineColor: selectedPin.lineColor,
    })))
    
    alert("すべてのピンに適用しました")
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
      alert("画像をアップロードしてください")
      return
    }

    saveRecipe(title)
  }

  // ===========================
  // 関数: タイトルモーダルからの保存処理
  // ===========================
  function handleSaveWithTitle() {
    if (!tempTitle.trim()) {
      alert("タイトルを入力してください")
      return
    }
    if (!imageDataUrl) {
      alert("画像をアップロードしてください")
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

    db.recipePins.updateAll(recipeId, pins.map(pin => ({
      ...pin,
      recipeId,
      createdAt: new Date().toISOString(),
    })))

    alert("保存しました")
    router.push("/admin/recipes")
  }

  // ===========================
  // 関数: タグの接続点（8方向）を計算
  // ===========================
  // タグの4隅と上下左右の中点の座標を返す（線の接続用）
  function getConnectionPoints(tagXPercent: number, tagYPercent: number, tagWidth: number, tagHeight: number) {
    if (!imageRef.current) return []
    
    const rect = imageRef.current.getBoundingClientRect()
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
    const updateScale = () => {
      if (imageRef.current && imageDataUrl) {
        const containerRect = imageRef.current.getBoundingClientRect()
        const img = new Image()
        img.src = imageDataUrl
        img.onload = () => {
          const imageRect = imageRef.current?.getBoundingClientRect()
          if (imageRect && containerRect.width > 0 && containerRect.height > 0 &&
              imageRect.width > 0 && imageRect.height > 0) {
            const scaleX = imageRect.width / imageWidth
            const scaleY = imageRect.height / imageHeight
            const calculatedScale = Math.min(scaleX, scaleY)
            
            if (isFinite(calculatedScale) && calculatedScale > 0) {
              setScale(calculatedScale)
              console.log('[v0] [編集ページ] スケール更新:', {
                scale: calculatedScale,
                表示サイズ: `${imageRect.width}x${imageRect.height}`,
                基準サイズ: `${imageWidth}x${imageHeight}`,
                scaleX,
                scaleY
              })
            }
          }
        }
      }
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    
    return () => {
      window.removeEventListener('resize', updateScale)
    }
  }, [imageDataUrl, imageWidth, imageHeight])

  // ===========================
  // JSX: UI構造
  // ===========================
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
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* ===========================
            画像エリア
            ========================== */}
        <div className="flex-[6] sm:flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden bg-zinc-900/50">
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
              className="relative w-full max-w-full max-h-full bg-zinc-800 rounded-lg overflow-hidden shadow-2xl flex items-center justify-center"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ 
                touchAction: 'none',
                aspectRatio: '4 / 3'
              }}
            >
              {/* レシピ画像 */}
              <img
                src={imageDataUrl || "/placeholder.svg"}
                alt={title}
                className="w-full h-full object-contain pointer-events-none select-none"
              />

              {/* ===========================
                  ピン描画ループ
                  各ピンに対して点・線・タグを描画
                  ========================== */}
              {pins.map((pin) => {
                const currentScale = scale
                
                console.log('[v0] [編集ページ] ピン描画:', {
                  pinId: pin.id,
                  scale: currentScale,
                  位置: {
                    点: `${pin.dotXPercent}%, ${pin.dotYPercent}%`,
                    タグ: `${pin.tagXPercent}%, ${pin.tagYPercent}%`
                  },
                  元のサイズ: {
                    点: pin.dotSize,
                    フォント: pin.tagFontSize,
                    線: pin.lineWidth
                  },
                  スケール後: {
                    点: pin.dotSize * currentScale,
                    フォント: pin.tagFontSize * currentScale,
                    線: pin.lineWidth * currentScale
                  }
                })

                if (!isFinite(currentScale) || currentScale <= 0) {
                  return null // スケールが無効な場合は描画しない
                }

                const safeDotSize = isFinite(pin.dotSize) ? pin.dotSize : 12
                const safeFontSize = isFinite(pin.tagFontSize) ? pin.tagFontSize : 14
                const safeLineWidth = isFinite(pin.lineWidth) ? pin.lineWidth : 2
                const safePaddingX = isFinite(pin.tagPaddingX) ? pin.tagPaddingX : 12
                const safePaddingY = isFinite(pin.tagPaddingY) ? pin.tagPaddingY : 6
                const safeBorderRadius = isFinite(pin.tagBorderRadius) ? pin.tagBorderRadius : 4
                const safeBorderWidth = isFinite(pin.tagBorderWidth || 0) ? (pin.tagBorderWidth || 0) : 0
                
                const scaledDotSize = Math.max(1, safeDotSize * currentScale)
                const scaledFontSize = Math.max(8, safeFontSize * currentScale)
                const scaledLineWidth = Math.max(1, safeLineWidth * currentScale)
                const scaledPaddingX = Math.max(0, safePaddingX * currentScale)
                const scaledPaddingY = Math.max(0, safePaddingY * currentScale)
                const scaledBorderRadius = Math.max(0, safeBorderRadius * currentScale)
                const scaledBorderWidth = Math.max(0, safeBorderWidth * currentScale)
                
                const tagTextSafe = pin.tagText || ''
                const charCount = tagTextSafe.length || 1 // 0を避けるため最低1
                const estimatedTagWidth = Math.max(100, charCount * scaledFontSize * 0.6 + scaledPaddingX * 2)
                const estimatedTagHeight = scaledFontSize + scaledPaddingY * 2
                
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
                    {/* ===========================
                        線（Line）: 点とタグの最近点を結ぶSVG線
                        ========================== */}
                    {nearestPoint && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                        <line
                          x1={`${pin.dotXPercent}%`}
                          y1={`${pin.dotYPercent}%`}
                          x2={`${nearestPoint.x}%`}
                          y2={`${nearestPoint.y}%`}
                          stroke={pin.lineColor || '#ffffff'}
                          strokeWidth={scaledLineWidth}
                          strokeDasharray={pin.lineType === 'dashed' ? '5,5' : pin.lineType === 'dotted' ? '2,2' : '0'}
                        />
                      </svg>
                    )}

                    {/* ===========================
                        点（Dot）: ドラッグ可能な視覚的マーカー
                        ========================== */}
                    <div
                      className="absolute cursor-move z-10"
                      style={{
                        left: `${pin.dotXPercent}%`,
                        top: `${pin.dotYPercent}%`,
                        transform: 'translate(-50%, -50%)',
                        width: scaledDotSize,
                        height: scaledDotSize,
                      }}
                      onMouseDown={(e) => handleDragStart('dot', pin.id, e)}
                      onTouchStart={(e) => handleTouchStart('dot', pin.id, e)}
                    >
                      <div
                        className={`w-full h-full ${pin.dotShape === 'circle' ? 'rounded-full' : ''}`}
                        style={{
                          backgroundColor: pin.dotColor || '#ffffff',
                          border: selectedPinId === pin.id ? '2px solid #3b82f6' : 'none',
                        }}
                      />
                    </div>

                    {/* ===========================
                        タグ（Tag）: ドラッグ可能なテキストラベル
                        ========================== */}
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
                          fontSize: scaledFontSize,
                          fontFamily: pin.tagFontFamily || 'system-ui',
                          fontWeight: pin.tagFontWeight || 'normal',
                          color: pin.tagTextColor || '#ffffff',
                          textShadow: pin.tagTextShadow || '0 2px 4px rgba(0,0,0,0.3)',
                          backgroundColor: pin.tagBackgroundColor || '#000000',
                          opacity: isFinite(pin.tagBackgroundOpacity) ? pin.tagBackgroundOpacity : 0.8,
                          borderRadius: scaledBorderRadius,
                          boxShadow: pin.tagShadow || '0 2px 8px rgba(0,0,0,0.2)',
                          paddingLeft: scaledPaddingX,
                          paddingRight: scaledPaddingX,
                          paddingTop: scaledPaddingY,
                          paddingBottom: scaledPaddingY,
                          border: selectedPinId === pin.id 
                            ? '2px solid #3b82f6' 
                            : scaledBorderWidth > 0 ? `${scaledBorderWidth}px solid ${pin.tagBorderColor || '#ffffff'}` : 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tagTextSafe}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ===========================
            プロパティパネル: 改善されたデザインとアニメーション
            ========================== */}
        {imageDataUrl && (
          <div className="flex-[4] sm:flex-1 flex flex-col border-l border-zinc-800 overflow-hidden bg-zinc-900">
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

                    {/* サイズスライダー */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <p className="text-white text-xs font-medium">サイズ</p>
                        <span className="text-cyan-400 text-xs font-mono">{selectedPin.tagFontSize}</span>
                      </div>
                      <Slider
                        value={[selectedPin.tagFontSize]}
                        onValueChange={([value]) => updatePin(selectedPin.id, { tagFontSize: value })}
                        min={8}
                        max={48}
                        step={1}
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

                    {/* 角丸スライダー */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <p className="text-white text-xs font-medium">角丸</p>
                        <span className="text-cyan-400 text-xs font-mono">{selectedPin.tagBorderRadius}</span>
                      </div>
                      <Slider
                        value={[selectedPin.tagBorderRadius]}
                        onValueChange={([value]) => updatePin(selectedPin.id, { tagBorderRadius: value })}
                        min={0}
                        max={24}
                        step={1}
                        className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400 [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200"
                      />
                    </div>

                    {/* 点のサイズ */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <p className="text-white text-xs font-medium">点のサイズ</p>
                        <span className="text-cyan-400 text-xs font-mono">{selectedPin.dotSize}</span>
                      </div>
                      <Slider
                        value={[selectedPin.dotSize]}
                        onValueChange={([value]) => updatePin(selectedPin.id, { dotSize: value })}
                        min={4}
                        max={32}
                        step={1}
                        className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400 [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200"
                      />
                    </div>

                    {/* 線の太さ */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <p className="text-white text-xs font-medium">線の太さ</p>
                        <span className="text-cyan-400 text-xs font-mono">{selectedPin.lineWidth}</span>
                      </div>
                      <Slider
                        value={[selectedPin.lineWidth]}
                        onValueChange={([value]) => updatePin(selectedPin.id, { lineWidth: value })}
                        min={1}
                        max={8}
                        step={1}
                        className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400 [&_[role=slider]]:transition-all [&_[role=slider]]:duration-200"
                      />
                    </div>
                  </TabsContent>

                  {/* フォントタブ: コンパクト化 */}
                  <TabsContent value="font" className="flex-1 overflow-y-auto p-3 mt-0 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="grid grid-cols-2 gap-2">
                      {['system-ui', 'serif', 'monospace', 'cursive'].map(font => (
                        <button
                          key={font}
                          onClick={() => updatePin(selectedPin.id, { tagFontFamily: font })}
                          className={`p-2.5 rounded-lg border text-xs transition-all duration-200 hover:scale-105 ${
                            selectedPin.tagFontFamily === font
                              ? 'border-cyan-400 bg-cyan-400/10 text-white shadow-lg shadow-cyan-400/20'
                              : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                          }`}
                          style={{ fontFamily: font }}
                        >
                          {font === 'system-ui' ? 'システム' : font === 'serif' ? 'セリフ' : font === 'monospace' ? 'モノ' : '手書き'}
                        </button>
                      ))}
                    </div>
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
