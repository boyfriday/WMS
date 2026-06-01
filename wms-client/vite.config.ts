import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api/core': {
        target: 'http://wms-core-api:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/core/, ''),
      },
      '/api/order': {
        target: 'http://wms-order-api:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/order/, ''),
      },
    },
  },
})
