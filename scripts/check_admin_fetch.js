#!/usr/bin/env node
// Simple check: ensure admin-site sources do not contain raw `fetch('/api` calls
const fs = require('fs')
const path = require('path')
const glob = require('glob')

const root = path.resolve(__dirname, '..')
const pattern = path.join(root, 'admin-site', '**', '*.{js,ts,jsx,tsx}')
const files = glob.sync(pattern, { nodir: true, nocase: true })
let errors = []
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8')
  const re = /fetch\s*\(\s*['"]\/api/gi
  if (re.test(src)) {
    errors.push(f)
  }
}
if (errors.length > 0) {
  console.error('ERROR: raw fetch("/api..." found in admin-site files:')
  for (const e of errors) console.error('  -', path.relative(root, e))
  process.exit(2)
}
console.log('OK: no raw fetch("/api...") occurrences found in admin-site')
process.exit(0)
