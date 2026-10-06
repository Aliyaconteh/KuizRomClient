import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'KuizRoom',
        short_name: 'KuizRoom',
        description: 'A Real-time Multiplayer Quiz Application.',
        theme_color: '#f0f0f0',
        background_color: '#f0f0f0',
        display: 'standalone',
        orientation: 'portrait',

        icons: [
          {
            src: '/pwa-192x192 .png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512 .png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512 .png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },

      devOptions: {
        enabled: false
      }
      
    }),
  ],
})