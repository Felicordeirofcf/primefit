#!/bin/bash

# Script para aplicar todas as correções no frontend PrimeFit
# Execute este script no diretório frontend do seu projeto

echo "🔧 Aplicando correções no frontend PrimeFit..."

# 1. Backup dos arquivos originais
echo "📦 Fazendo backup dos arquivos originais..."
cp package.json package.json.backup
cp vite.config.js vite.config.js.backup

# 2. Limpeza completa
echo "🧹 Limpando instalação anterior..."
npm cache clean --force
rm -rf node_modules package-lock.json

# 3. Atualizar package.json
echo "📝 Atualizando package.json..."
cat > package.json << 'EOF'
{
  "name": "primefit-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "serve -s dist --listen tcp://0.0.0.0:${PORT}",
    "build": "vite build",
    "preview": "vite preview --host --port $PORT",
    "dev": "vite"
  },
  "dependencies": {
    "@headlessui/react": "^1.7.19",
    "@heroicons/react": "^2.2.0",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-tabs": "^1.1.12",
    "axios": "^1.9.0",
    "class-variance-authority": "^0.7.1",
    "framer-motion": "^10.18.0",
    "lucide-react": "^0.513.0",
    "react": "^18.3.1",
    "react-chartjs-2": "^5.3.0",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.57.0",
    "react-icons": "^5.5.0",
    "react-markdown": "^10.1.0",
    "react-router-dom": "^6.30.1",
    "react-toastify": "^9.1.3",
    "recharts": "^2.15.3",
    "tailwind-merge": "^3.3.0",
    "zustand": "^4.5.7"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.10",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "serve": "^14.2.4",
    "tailwindcss": "^3.4.1",
    "terser": "^5.36.0",
    "vite": "^5.2.0"
  }
}
EOF

# 4. Atualizar vite.config.js
echo "⚙️ Atualizando vite.config.js..."
cat > vite.config.js << 'EOF'
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
EOF

# 5. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 6. Executar build de teste
echo "🏗️ Executando build de teste..."
npm run build

# 7. Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build executado com sucesso!"
    echo "📁 Arquivos gerados em dist/:"
    ls -la dist/
    echo ""
    echo "🚀 Pronto para deploy no Railway!"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. git add ."
    echo "2. git commit -m 'Fix: Correções frontend - React 18.3.1, Vite config, terser'"
    echo "3. git push origin main"
    echo ""
    echo "🔍 Para testar localmente:"
    echo "PORT=3000 npm start"
else
    echo "❌ Erro no build. Verifique os logs acima."
    echo "🔄 Restaurando arquivos de backup..."
    cp package.json.backup package.json
    cp vite.config.js.backup vite.config.js
    exit 1
fi

