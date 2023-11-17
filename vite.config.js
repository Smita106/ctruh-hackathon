import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: 'MyHome_realestate',
  build: {
    outDir: './docs',
    rollupOptions: {
      input: {
        main: './index.html',
        viewer: './propertyviewer.html',
      }
    }
  }
})
