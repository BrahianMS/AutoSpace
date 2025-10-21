import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Este alias sigue estando presente
    }
  },
  server: {
    port: 8080, // Puedes mantener el puerto si lo necesitas
    proxy: {
      '/api': {
        target: 'https://autospace-backend.onrender.com',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug', // Esto puede ser útil para depuración
        rewrite: (path) => path.replace(/^\/api/, '/api') // El rewrite sigue igual
      }
    }
  }
})
