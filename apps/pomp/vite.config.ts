import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['pwa-192x192.png', 'pwa-512x512.png'],
    manifest: {
      name: 'POMP — Property Oversight Management Portal',
      short_name: 'POMP',
      description: 'Offline-first property portfolio management for Enthuse Trust',
      theme_color: '#0f172a',
      background_color: '#f8fafc',
      display: 'standalone',
      orientation: 'portrait-primary',
      icons: [
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    workbox: { globPatterns: ['**/*.{js,css,html,png,svg,ico}'] },
  })],
  resolve: {
    alias: { '~': path.resolve(__dirname, 'app') },
  },
  build: {
    outDir: 'dist/public',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
})
