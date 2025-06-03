import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer'; // Optional: to analyze bundle size

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true, gzipSize: true, brotliSize: true }), // Optional: Helps visualize chunk sizes after build
  ],
  server: {
    port: 5173,
    host: true, // Allows access from network
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // Enable source maps for debugging production issues
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Create vendor chunks for larger dependencies
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) {
              return 'vendor_supabase';
            }
            if (id.includes('react-router-dom') || id.includes('@remix-run') || id.includes('react-router')) {
               return 'vendor_routing';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
               return 'vendor_charts';
            }
            // Catch-all for other node_modules, can be refined further
            // Grouping react/react-dom is often beneficial
            if (id.includes('react-dom')) {
                return 'vendor_react-dom';
            }
             if (id.includes('react')) {
                return 'vendor_react';
            }
            // Default vendor chunk for other modules
            // return 'vendor'; // Uncomment this for a single large vendor chunk
          }
          // Keep app code separate
          // You might add more specific app logic chunking here if needed
        },
      },
    },
    chunkSizeWarningLimit: 550, // Adjust warning limit slightly if needed
  },
});

