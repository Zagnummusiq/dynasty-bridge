import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    port: 5000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Dynasty Bridge Online Mall',
        short_name: 'Dynasty Bridge',
        description: 'Mumias\' leading electronics & home appliances mall.',
        theme_color: '#FFDB58',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Precache the app shell
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Don't precache large images
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          // API products — network first, fall back to cache (30s timeout)
          {
            urlPattern: /\/api\/products/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-products-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Product images — stale-while-revalidate (fast loads + fresh)
          {
            urlPattern: /\.(png|jpg|jpeg|webp|gif|svg)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'product-images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Unsplash & external image CDNs
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Google Fonts & other external static assets
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ],
})
