// Shim declarations to satisfy Next.js dev-time validator imports
// The Next.js generated validator may import compiled JS modules under
// paths like '../../../app/.../page.js' or '../../../app/.../route.js'.
// TypeScript in the admin-site build may fail to resolve those module
// specifiers. These ambient module declarations make those imports
// legal for the typechecker during build.

declare module "*app/*/page.js" {
  const m: any
  export default m
}

declare module "*app/*/*/page.js" {
  const m: any
  export default m
}

declare module "*app/*/route.js" {
  const m: any
  export default m
}

declare module "../../../app/admin/products/[id]/edit/page.js" {
  const m: any
  export default m
}

declare module "../../../app/admin/products/new/page.js" {
  const m: any
  export default m
}

declare module "../../../app/api/images/complete/route.js" {
  const m: any
  export default m
}

// Fallback wildcard to avoid other similar resolution errors during validation
declare module "*.page.js" {
  const m: any
  export default m
}
