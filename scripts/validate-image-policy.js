#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const IGNORE_DIRS = [".next", "node_modules", "dist", "public-worker/dist", "public-worker/.wrangler", "scripts", "docs"]

const exts = ['.js', '.ts', '.jsx', '.tsx']

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (IGNORE_DIRS.some(d => full.includes(path.join(ROOT, d)))) continue
    if (e.isDirectory()) walk(full, cb)
    else cb(full)
  }
}

const forbidden = [
  /\/cdn-cgi\/image\//, // direct image-resize paths
  /https?:\/\/[^\s'"`]+images\.shirasame\.com/, // direct images domain
  /https?:\/\//, // any full URL (we'll report but with filtering)
]

const hits = []

walk(ROOT, (file) => {
  if (!exts.includes(path.extname(file))) return
  try {
    const src = fs.readFileSync(file, 'utf8')
    const lines = src.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // normalize path for reliable checks
      const norm = file.replace(/\\/g, '/')
      // allowlist: the canonical image-usecases implementations may construct /cdn-cgi/image
      if (norm.endsWith('shared/lib/image-usecases.ts') || norm.endsWith('public-site/shared/lib/image-usecases.ts') || norm.endsWith('shared/lib/image-usecases.ts.map')) {
        continue
      }
      // ignore build artifacts and tools
      if (norm.includes('/.next/') || norm.includes('/node_modules/') || norm.includes('/dist/') || norm.includes('/public-worker/dist/') || norm.includes('/scripts/') || norm.includes('/docs/')) continue
      if (/\/cdn-cgi\/image\//.test(line)) {
        // allow server-side extraction of keys containing /cdn-cgi/image/ (we strip prefix)
        if (line.includes("replace(/^cdn-cgi") || line.toLowerCase().includes('strip possible') || line.includes('extractKey')) {
          continue
        }
        hits.push({ file, line: i+1, match: '/cdn-cgi/image/' })
      }
      if (/https?:\/\/images\.shirasame\.com/.test(line)) {
        hits.push({ file, line: i+1, match: 'https://images.shirasame.com' })
      }
      // detect hard-coded full URLs that look like image urls being saved or used
      const urlMatch = line.match(/https?:\/\/[\w\-\.\/:@%\?=&+#,~]+/g)
      if (urlMatch) {
        // ignore obvious external links in docs by path
        const isDoc = file.match(/docs\//i)
        if (!isDoc) {
          for (const u of urlMatch) {
            // ignore common non-image urls (api endpoints)
            if (/\.(png|jpe?g|gif|webp|svg)/i.test(u) || u.includes('images.shirasame.com')) {
              hits.push({ file, line: i+1, match: u })
            }
          }
        }
      }
    }
  } catch (e) {
    // ignore unreadable
  }
})

if (hits.length === 0) {
  console.log('No image-policy violations found.')
  process.exit(0)
}

console.log('Found potential image-policy violations:')
for (const h of hits) {
  console.log(`${h.file}:${h.line} -> ${h.match}`)
}

// exit non-zero so CI can fail
process.exit(2)
