// Global shims to satisfy Next.js dev validator imports during build
declare module "../../../app/api/images/complete/route.js" {
  const m: any
  export default m
}

declare module "../../../app/api/images/upload/route.js" {
  const m: any
  export default m
}

declare module "*app/*/route.js" {
  const m: any
  export default m
}

declare module "*app/*/page.js" {
  const m: any
  export default m
}

// Fallback
declare module "*.route.js" {
  const m: any
  export default m
}
