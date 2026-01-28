import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React dependencies - loaded first
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          // React Query - critical for data fetching
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          // Icons - loaded on demand
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          // Date utilities
          if (id.includes('date-fns')) {
            return 'vendor-date';
          }
          // Charts - only needed for analytics
          if (id.includes('recharts')) {
            return 'vendor-charts';
          }
          // PDF viewer - only needed for document preview
          if (id.includes('react-pdf') || id.includes('pdfjs-dist')) {
            return 'vendor-pdf';
          }
          // Form handling
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'vendor-forms';
          }
          // UI components (Radix)
          if (id.includes('@radix-ui')) {
            return 'vendor-ui';
          }
          // State management
          if (id.includes('zustand')) {
            return 'vendor-state';
          }
          // HTTP client
          if (id.includes('axios')) {
            return 'vendor-http';
          }
          // Validation
          if (id.includes('zod')) {
            return 'vendor-validation';
          }
        },
      },
    },
    // Minimize CSS
    cssMinify: true,
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'axios',
    ],
  },
})
