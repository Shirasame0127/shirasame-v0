/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack root を明示してルート推定の警告を抑止
  turbopack: {
    root: 'c:/Users/celes/Documents/shirasameProject/v0-samehome',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    // Allow Cloudflare R2 public and account-hosted images used during development
    remotePatterns: [],
  },
}

// Cloudflare Pages の静的配信に合わせて、必要時のみ export 出力に切り替え
if (process.env.NEXT_OUTPUT_EXPORT === '1') {
  nextConfig.output = 'export'
  // 念のため unoptimized を強制
  nextConfig.images = { ...(nextConfig.images || {}), unoptimized: true }
}

// 画像ドメインを環境変数から動的に許可
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
  // R2 アカウント直ホストも許可
  if (process.env.CLOUDFLARE_ACCOUNT_ID) {
    nextConfig.images.remotePatterns.push({ protocol: 'https', hostname: `${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`, pathname: '/**' })
  }
  // 開発での *.r2.dev も一応許可
  nextConfig.images.remotePatterns.push({ protocol: 'https', hostname: '*.r2.dev', pathname: '/**' })
} catch {}

export default nextConfig
