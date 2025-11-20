export interface DBProduct {
  id: string
  user_id: string
  title: string
  slug: string
  short_description: string
  body: string
  tags: string[] // JSONBとして保存
  price: number | null
  published: boolean
  notes: string | null
  related_links: string[] // JSONB
  created_at: string
  updated_at: string
  show_price: boolean | null
}

export interface DBProductImage {
  id: string
  product_id: string
  url: string
  width: number
  height: number
  aspect: string
  role: "thumbnail" | "main" | "secondary" | "attachment"
  uploaded_at: string
}

export interface DBAffiliateLink {
  id: string
  product_id: string
  provider: string
  url: string
  label: string
  created_at: string
}

export interface DBRecipe {
  id: string
  user_id: string
  title: string
  image_data_url: string // Base64画像データ（ローカル保存）
  image_width: number
  image_height: number
  aspect_ratio: string // "4:3", "16:9", "1:1" など
  published: boolean
  created_at: string
  updated_at: string
}

export interface DBRecipePin {
  id: string
  recipe_id: string
  product_id: string

  // ========================================
  // 重要：すべての位置とサイズは相対値（パーセント）で保存
  // ========================================

  // 点（ドット）の位置とプロパティ
  dot_x_percent: number // 点のX位置 (0-100) ※画像幅に対する割合
  dot_y_percent: number // 点のY位置 (0-100) ※画像高さに対する割合
  dot_size_percent: number // 点のサイズ（画像幅に対する割合） default: 1.2 (画像幅の1.2%が12pxに相当)
  dot_color: string // 点の色 default: '#ffffff'
  dot_shape: "circle" | "square" | "triangle" | "diamond" // 点の形状

  // タグ（ラベル）の位置とプロパティ
  tag_x_percent: number // タグのX位置 (0-100) ※画像幅に対する割合
  tag_y_percent: number // タグのY位置 (0-100) ※画像高さに対する割合
  tag_text: string // タグのテキスト（商品名がデフォルト）
  tag_display_text?: string // 表示用テキスト（商品名とは別に設定可能）

  // タグのスタイル（すべて相対値）
  tag_font_size_percent: number // フォントサイズ（画像幅に対する割合） default: 1.4 (画像幅の1.4%が14pxに相当)
  tag_font_family: string // フォント default: 'system-ui'
  tag_font_weight: "normal" | "bold" | "300" | "400" | "500" | "600" | "700"
  tag_text_color: string // テキスト色 default: '#ffffff'
  tag_text_shadow: string // テキストシャドウ CSS値 default: '0 2px 4px rgba(0,0,0,0.3)'

  // タグの背景とボーダー
  tag_background_color: string // 背景色 default: '#000000'
  tag_background_opacity: number // 背景の不透明度 (0-1) default: 0.8
  tag_border_width_percent: number // 枠線の太さ（画像幅に対する割合） default: 0
  tag_border_color: string // 枠線の色 default: '#ffffff'
  tag_border_radius_percent: number // 角丸（画像幅に対する割合） default: 0.4 (画像幅の0.4%が4pxに相当)
  tag_shadow: string // タグのシャドウ CSS値 default: '0 2px 8px rgba(0,0,0,0.2)'

  tag_padding_x_percent: number // 横方向のパディング（画像幅に対する割合） default: 1.2 (画像幅の1.2%が12pxに相当)
  tag_padding_y_percent: number // 縦方向のパディング（画像幅に対する割合） default: 0.6 (画像幅の0.6%が6pxに相当)

  // 線のプロパティ
  line_type: "solid" | "dashed" | "dotted" | "wavy" | "hand-drawn" // 線のタイプ
  line_width_percent: number // 線の太さ（画像幅に対する割合） default: 0.2 (画像幅の0.2%が2pxに相対)
  line_color: string // 線の色 default: '#ffffff'

  tag_text_stroke_color?: string
  tag_text_stroke_width?: number
  tag_background_width_percent?: number
  tag_background_height_percent?: number
  tag_background_offset_x_percent?: number
  tag_background_offset_y_percent?: number
  tag_shadow_color?: string
  tag_shadow_opacity?: number
  tag_shadow_blur?: number
  tag_shadow_distance?: number
  tag_shadow_angle?: number
  tag_text_align?: "left" | "center" | "right"
  tag_vertical_writing?: boolean
  tag_letter_spacing?: number
  tag_line_height?: number
  tag_bold?: boolean
  tag_italic?: boolean
  tag_underline?: boolean
  tag_text_transform?: "uppercase" | "lowercase" | "none"
  tag_display_text?: string // 表示用テキスト

  created_at: string
}

export interface DBRecipeImage {
  id: string
  recipe_id: string
  url: string
  width: number
  height: number
  uploaded_at: string
}

export interface DBRecipeItem {
  id: string
  recipe_id: string
  linked_product_id: string
  pin_x_pct: number
  pin_y_pct: number
  text_x_pct: number
  text_y_pct: number
  style: any // JSONB
  created_at: string
  updated_at: string
}

export interface DBAnnotationStyle {
  id: string
  recipe_id: string
  pin_size: number
  pin_color: string
  pin_shape: "circle" | "square" | "triangle"
  line_width: number
  line_color: string
  line_style: "solid" | "dashed" | "dotted"
  font_size: number
  text_color: string
  background_color: string
  font_family: string
  font_weight: string
  created_at: string
  updated_at: string
}

export interface DBCollection {
  id: string
  user_id: string
  title: string
  description: string | null
  visibility: "public" | "draft"
  created_at: string
  updated_at: string
}

export interface DBCollectionItem {
  id: string
  collection_id: string
  product_id: string
  order: number
  created_at: string
}

export interface DBTheme {
  id: string
  user_id: string
  primary_color: string
  background_color: string
  text_color: string
  heading_font: string
  body_font: string
  background_image: string | null
  header_image: string | null // 後方互換性のため残す
  header_images: string[] // 複数ヘッダー画像対応
  social_links: any // JSONB
  amazon_access_key: string | null
  amazon_secret_key: string | null
  amazon_associate_id: string | null
  favorite_fonts: string[] // フォントファミリー名の配列
  created_at: string
  updated_at: string
}

export interface DBCustomFont {
  id: string
  user_id: string
  name: string // フォント表示名
  family: string // font-family名（一意）
  font_data_url: string // Base64エンコードされたフォントファイル（woff2形式推奨）
  created_at: string
}

export type Product = {
  id: string
  userId: string
  title: string
  slug: string
  shortDescription: string
  body: string
  images: Array<{
    id: string
    productId: string
    url: string
    width: number
    height: number
    aspect: string
    role: "thumbnail" | "main" | "secondary" | "attachment"
  }>
  affiliateLinks: Array<{
    provider: string
    url: string
    label: string
  }>
  tags: string[]
  price?: number
  showPrice?: boolean
  notes?: string
  relatedLinks?: string[]
  published: boolean
  createdAt: string
  updatedAt: string
}

export type Recipe = {
  id: string
  userId: string
  title: string
  imageDataUrl: string // Base64画像データ
  imageWidth: number // 基準画像の幅（ピクセル）
  imageHeight: number // 基準画像の高さ（ピクセル）
  aspectRatio: string // アスペクト比情報
  pins: Array<{
    id: string
    productId: string
    // 点のプロパティ（すべて相対値）
    dotXPercent: number
    dotYPercent: number
    dotSizePercent: number // ピクセルから相対値に変更
    dotColor: string
    dotShape: "circle" | "square" | "triangle" | "diamond"
    // タグのプロパティ（すべて相対値）
    tagXPercent: number
    tagYPercent: number
    tagText: string
    tagFontSizePercent: number // ピクセルから相対値に変更
    tagFontFamily: string
    tagFontWeight: "normal" | "bold" | "300" | "400" | "500" | "600" | "700"
    tagTextColor: string
    tagTextShadow: string
    tagBackgroundColor: string
    tagBackgroundOpacity: number
    tagBorderWidthPercent: number // ピクセルから相対値に変更
    tagBorderColor: string
    tagBorderRadiusPercent: number // ピクセルから相対値に変更
    tagShadow: string
    tagPaddingXPercent: number // ピクセルから相対値に変更
    tagPaddingYPercent: number // ピクセルから相対値に変更
    // 線のプロパティ
    lineType: "solid" | "dashed" | "dotted" | "wavy" | "hand-drawn"
    lineWidthPercent: number // ピクセルから相対値に変更
    lineColor: string

    tagTextStrokeColor?: string
    tagTextStrokeWidth?: number
    tagBackgroundWidthPercent?: number
    tagBackgroundHeightPercent?: number
    tagBackgroundOffsetXPercent?: number
    tagBackgroundOffsetYPercent?: number
    tagShadowColor?: string
    tagShadowOpacity?: number
    tagShadowBlur?: number
    tagShadowDistance?: number
    tagShadowAngle?: number
    tagTextAlign?: "left" | "center" | "right"
    tagVerticalWriting?: boolean
    tagLetterSpacing?: number
    tagLineHeight?: number
    tagBold?: boolean
    tagItalic?: boolean
    tagUnderline?: boolean
    tagTextTransform?: "uppercase" | "lowercase" | "none"
    tagDisplayText?: string // 表示用テキスト
  }>
  published: boolean
  createdAt: string
  updatedAt: string
}

export type Collection = {
  id: string
  userId: string
  title: string
  description?: string
  productIds: string[]
  visibility: "public" | "draft"
  createdAt: string
  updatedAt: string
}

export type User = {
  id: string
  username: string
  displayName: string
  bio: string
  profileImageKey?: string // base64直接保存からキー参照に変更
  profileImage?: string // 後方互換性のため残す
  headerImageKey?: string // 後方互換性のため残す
  headerImageKeys?: string[] // 複数ヘッダー画像をキー配列で管理
  headerImage?: string // 後方互換性のため残す
  headerImages?: string[] // 後方互換性のため残す
  backgroundType: "color" | "image"
  backgroundColor?: string
  backgroundImageKey?: string // 背景画像もキー参照に
  backgroundImageUrl?: string // 後方互換性のため残す
  socialLinks?: {
    twitter?: string
    tiktok?: string
    youtube?: string
    instagram?: string
    twitch?: string
    discord?: string
    note?: string
    email?: string
    form?: string
  }
  amazonAccessKey?: string
  amazonSecretKey?: string
  amazonAssociateId?: string
  favoriteFonts?: string[]
  createdAt: string
  updatedAt: string
}

export type Theme = {
  primaryColor: string
  backgroundColor: string
  textColor: string
  headingFont: string
  bodyFont: string
  backgroundImage?: string
  headerImage?: string
}

export type Tag = {
  id: string
  name: string
  group?: string // グループ名（未分類の場合は undefined）
  linkUrl?: string // リンク先URL
  linkLabel?: string // リンクボタン表示テキスト
  userId?: string
  createdAt: string
}

export interface DBAmazonSaleSchedule {
  id: string
  user_id: string
  sale_name: string // 大型セール名（例：プライムデー、ブラックフライデー）
  start_date: string // ISO 8601形式
  end_date: string // ISO 8601形式
  collection_id: string // 自動生成されるコレクションID
  created_at: string
  updated_at: string
}

export type AmazonSaleSchedule = {
  id: string
  userId: string
  saleName: string
  startDate: string
  endDate: string
  collectionId: string
  createdAt: string
  updatedAt: string
}

export type CustomFont = {
  id: string
  userId: string
  name: string
  family: string
  fontDataUrl: string
  createdAt: string
}
