type StorageData = {
  products?: any[]
  recipes?: any[]
  recipeItems?: any[]
  recipeImages?: any[]
  users?: any[]
  collections?: any[]
  theme?: any
}

export const mockStorage = {
  get: (key: string, defaultValue: any): any => {
    if (typeof window === "undefined") return defaultValue
    try {
      const item = localStorage.getItem(`mock_${key}`)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },

  set: (key: string, value: any): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(`mock_${key}`, JSON.stringify(value))
    } catch (error) {
      console.error("[v0] Failed to save to localStorage:", error)
    }
  },

  getAll: (): StorageData => {
    if (typeof window === "undefined") return {}
    const keys = ["products", "recipes", "recipeItems", "recipeImages", "users", "collections", "theme"]
    const data: StorageData = {}
    keys.forEach((key) => {
      const item = localStorage.getItem(`mock_${key}`)
      if (item) {
        try {
          ;(data as any)[key] = JSON.parse(item)
        } catch {}
      }
    })
    return data
  },

  clear: (): void => {
    if (typeof window === "undefined") return
    const keys = Object.keys(localStorage).filter((key) => key.startsWith("mock_"))
    keys.forEach((key) => localStorage.removeItem(key))
  },
}
