import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv'
dotenv.config()

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  // GitHub Pages: set VITE_BASE_PATH=/repo-name/ in .env for build; dev uses /
  base:
    command === 'serve'
      ? '/'
      : (process.env.VITE_BASE_PATH || '/'),
}))
