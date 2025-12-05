import fs from 'fs'
import path from 'path'
import postcss from 'postcss'
import tailwind from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

async function build() {
  const cwd = process.cwd()
  const inFile = path.join(cwd, 'app', 'globals.css')
  const outFile = path.join(cwd, 'public', 'tailwind-debug.css')

  if (!fs.existsSync(inFile)) {
    console.error('globals.css not found at', inFile)
    process.exit(1)
  }

  const input = fs.readFileSync(inFile, 'utf8')
  try {
    const result = await postcss([tailwind(), autoprefixer()]).process(input, { from: inFile, to: outFile })
    fs.writeFileSync(outFile, result.css, 'utf8')
    console.log('Wrote', outFile, 'size=', result.css.length)
  } catch (err) {
    console.error('PostCSS build failed:', err)
    process.exit(2)
  }
}

build()
