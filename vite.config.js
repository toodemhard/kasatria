import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    base: "/kasatria/"
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        periodic_table: resolve(__dirname, 'periodic_table.html'),
      },
    },
  },
})