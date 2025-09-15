import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { AuthProvider } from '@descope/react-sdk'
import { createRouter } from './router'
import './index.css'

// Initialize Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!)

// Create router
const router = createRouter()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <AuthProvider projectId="P32IOSJNhSnSjWqMWQFI6ax1zmiR">
        <RouterProvider router={router} />
      </AuthProvider>
    </ConvexProvider>
  </React.StrictMode>,
)