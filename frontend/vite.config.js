import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import imagemin from 'vite-plugin-imagemin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), imagemin({
    include: ['**/*.{png,jpg,jpeg,svg,webp}'],
    limit: 10240, // only optimize images > 10KB
    gzipSize: true,
    brotliSize: true,
  })],
  define: {
    global: 'window',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
