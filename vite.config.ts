import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          convex: ['convex/react'],
          auth: ['@descope/react-sdk']
        }
      }
    }
  },
  preview: {
    port: parseInt(process.env.PORT || '8080'),
    host: true,
    allowedHosts: [
      'recipe-collection-app.up.railway.app',
      'localhost',
      '127.0.0.1',
      '.railway.app'
    ]
  }
})
