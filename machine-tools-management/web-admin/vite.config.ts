import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/auth': {
        target: 'https://localhost:44301',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'https://localhost:44302',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
