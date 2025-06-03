import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 800, // aumenta limite antes de avisar
    rollupOptions: {
      output: {
        manualChunks: {
          // Quebra o bundle principal em partes menores
          react: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          chart: ['chart.js'],
        }
      }
    }
  }
})
