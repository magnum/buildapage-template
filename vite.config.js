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
  // Project GitHub Pages: assets under /repo-name/; dev server stays at /
  base: process.env.VITE_BASE_PATH || '/aaa',
}))
