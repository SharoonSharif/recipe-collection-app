import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: parseInt(process.env.PORT || '5173'),
    host: true, // This is important for Railway
  },
  preview: {
    port: parseInt(process.env.PORT || '4173'),
    host: true,
    // Allow Railway's healthcheck domain
    allowedHosts: [
      'healthcheck.railway.app',
      '.railway.app', // Allow all Railway subdomains
      'localhost',
    ],
  },
})