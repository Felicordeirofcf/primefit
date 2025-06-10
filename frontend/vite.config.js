import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react', '@radix-ui/react-avatar', '@radix-ui/react-scroll-area', '@radix-ui/react-separator', '@radix-ui/react-slot', '@radix-ui/react-tabs'],
          charts: ['react-chartjs-2', 'recharts'],
          utils: ['axios', 'class-variance-authority', 'framer-motion', 'lucide-react', 'react-hook-form', 'react-icons', 'react-markdown', 'react-toastify', 'tailwind-merge', 'zustand']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  preview: {
    port: parseInt(process.env.PORT) || 4173,
    host: '0.0.0.0'
  }
});
