export function computeCorsHeaders(origin: string | null, env: any) {
  const allowedEnv = ((env && env.PUBLIC_ALLOWED_ORIGINS) || '').split(',').map((s: string) => s.trim()).filter(Boolean)
  const defaults = ['https://www.shirasame.com', 'https://shirasame.com', 'https://admin.shirasame.com', 'http://localhost:3000']
  let acOrigin: string | '*' = '*'

  if (allowedEnv.length > 0) {
    if (allowedEnv.indexOf('*') !== -1) {
      acOrigin = '*'
    } else if (origin && allowedEnv.indexOf(origin) !== -1) {
      acOrigin = origin
    } else {
      acOrigin = allowedEnv[0]
    }
  } else {
    if (origin && defaults.indexOf(origin) !== -1) acOrigin = origin
    else acOrigin = '*'
  }

  return {
    'Access-Control-Allow-Origin': acOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, If-None-Match, Authorization, X-User-Id',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT,DELETE',
    'Access-Control-Expose-Headers': 'ETag',
    'Vary': 'Origin',
    'X-Served-By': 'public-worker',
  } as Record<string, string>
}

export default computeCorsHeaders
