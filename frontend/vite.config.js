import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // ← ADICIONE ESTA LINHA!
  plugins: [
    react(),
  ],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom') || id.includes('@remix-run') || id.includes('react-router')) return 'vendor_routing';
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'vendor_charts';
            if (id.includes('react-dom')) return 'vendor_react-dom';
            if (id.includes('react')) return 'vendor_react';
            if (id.includes('recharts')) return 'vendor_recharts';
          }
        },
      },
    },
    chunkSizeWarningLimit: 550,
  },
});

