const fs = require('fs')
const path = require('path')
const src = path.resolve(process.argv[2] || 'public-worker/src/index.ts')
const out = path.resolve(process.argv[3] || 'public-worker/src/index.ts.out')
let s = fs.readFileSync(src, 'utf8')
let orig = s
// Replace new Response(JSON.stringify(...), { ... }) -> ({ ... , body: ... })
// Use non-greedy matches
const re = /new\s+Response\s*\(\s*JSON\.stringify\s*\(\s*([\s\S]*?)\s*\)\s*,\s*\{([\s\S]*?)\}\s*\)/g
s = s.replace(re, function(_, body, opts){
  // clean up leading/trailing whitespace
  const b = body.trim()
  const o = opts.trim()
  return `({ ${o}, body: ${b} })`
})
// Write out
fs.writeFileSync(out, s, 'utf8')
console.log('wrote', out)
// Print diff summary count
const countOrig = (orig.match(/new\s+Response\s*\(\s*JSON\.stringify/g) || []).length
const countNew = (s.match(/new\s+Response\s*\(\s*JSON\.stringify/g) || []).length
console.log('original occurrences:', countOrig, 'remaining:', countNew)
