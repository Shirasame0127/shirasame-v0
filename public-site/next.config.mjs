/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
}

if (process.env.NEXT_OUTPUT_EXPORT === '1') {
  nextConfig.output = 'export'
  nextConfig.images = { ...(nextConfig.images || {}), unoptimized: true }
}

try {
  const addHost = (urlLike) => {
    if (!urlLike) return
    try {
      const u = new URL(urlLike)
      nextConfig.images.remotePatterns.push({ protocol: u.protocol.replace(':', ''), hostname: u.hostname, pathname: '/**' })
    } catch {}
  }
  addHost(process.env.NEXT_PUBLIC_R2_PUBLIC_URL)
  addHost(process.env.R2_PUBLIC_URL)
  addHost(process.env.CDN_BASE_URL)
  addHost(process.env.NEXT_PUBLIC_CDN_BASE)
  if (process.env.CLOUDFLARE_ACCOUNT_ID) {
    nextConfig.images.remotePatterns.push({ protocol: 'https', hostname: `${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`, pathname: '/**' })
  }
  nextConfig.images.remotePatterns.push({ protocol: 'https', hostname: '*.r2.dev', pathname: '/**' })
} catch {}

export default nextConfig
