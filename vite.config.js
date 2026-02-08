import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/MarketStack-App/',  // 👈 IMPORTANT: change this
  build: {
  outDir: 'docs',    // 👈 GitHub Pages will serve from docs/
  },
})
