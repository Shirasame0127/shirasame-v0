export type ApiResponse<T> = {
  data: T
  error?: string | null
  meta?: Record<string, unknown>
}

export type PaginatedMeta = {
  total?: number
  limit?: number | null
  offset?: number
}

export type PaginatedResponse<T> = {
  data: T[]
  error?: string | null
  meta: PaginatedMeta
}
