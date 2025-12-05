/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind v4 expects the PostCSS adapter package `@tailwindcss/postcss`
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}

export default config
