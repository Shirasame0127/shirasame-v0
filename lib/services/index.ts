/**
 * サービス層のエクスポート
 * すべてのサービスを一箇所から import できるようにする
 */

export { ProductsService } from "./products.service"
export { CollectionsService } from "./collections.service"
export { RecipesService } from "./recipes.service"
export { AnalyticsService } from "./analytics.service"
export { AuthService } from "./auth.service"

// 使用例:
// import { ProductsService, AuthService } from '@/lib/services'
// const products = await ProductsService.getAll()
// const user = await AuthService.getCurrentUser()
