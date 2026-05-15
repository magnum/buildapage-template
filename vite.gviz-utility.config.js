import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))

/**
 * Second build pass: standalone IIFE for <script src="…/utils/spreadsheetLoaderGviz.js">.
 * Run after main `vite build` (emptyOutDir: false so dist/ is preserved).
 */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(root, 'src/utils/spreadsheetLoaderGviz-iife-entry.js'),
      name: 'SpreadsheetDataGViz',
      formats: ['iife'],
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'utils/spreadsheetLoaderGviz.js',
      },
    },
  },
})
