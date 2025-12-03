export type ApiResponse<T> = {
  data: T
  meta?: Record<string, any>
  error?: { message: string; code?: string }
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: { total: number; limit: number; offset: number }
}
