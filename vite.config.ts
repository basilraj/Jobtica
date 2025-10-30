import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// FIX: Replace __dirname with ES module compatible path resolution
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // FIX: Use path.dirname and fileURLToPath to resolve __dirname equivalent
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})