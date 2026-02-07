import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@':  path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0', // Quan trọng cho Docker
    port: 5175,
    watch: {
      usePolling: true // Quan trọng cho hot reload trong Docker
    },
    hmr: {
      overlay: true
    }
  },
})
