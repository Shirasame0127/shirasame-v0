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
    remotePatterns: [
      { protocol: 'https', hostname: '*.r2.dev', pathname: '/**' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com', pathname: '/**' },
    ],
  },
}

export default nextConfig
