import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      // Any request to /api/* gets forwarded to the backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,    // fixes the Host header for the backend
      },
    },
  },
})