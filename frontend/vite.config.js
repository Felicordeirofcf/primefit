import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8000',
      '/admin': 'http://localhost:8000',
      '/cliente': 'http://localhost:8000'
    },
    // 🔧 Habilita fallback para rotas de SPA
    historyApiFallback: true
  }
})
