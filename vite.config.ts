import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const configDir = path.dirname(fileURLToPath(import.meta.url))
const apiTarget = process.env.PRERENDER_API_URL || 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  server: {
    fs: {
      allow: [path.resolve(configDir, '..')],
    },
    proxy: {
      '/api': apiTarget,
      '/health': apiTarget,
      '/sitemap.xml': apiTarget,
      '/robots.txt': apiTarget,
    },
  },
  preview: {
    proxy: {
      '/api': apiTarget,
      '/health': apiTarget,
      '/sitemap.xml': apiTarget,
      '/robots.txt': apiTarget,
    },
  },
})
