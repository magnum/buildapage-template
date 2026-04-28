import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  // Project GitHub Pages: assets under /repo-name/; dev server stays at /
  base:
    command === 'serve'
      ? '/'
      : (process.env.VITE_BASE || '/buildapage-template/'),
}))
