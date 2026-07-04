import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Resolve "@/..." to the src directory without needing @types/node.
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})
