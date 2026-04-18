import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isGitHubPagesBuild = process.env.GITHUB_PAGES_DEPLOY === 'true'

export default defineConfig({
  base: isGitHubPagesBuild ? '/ResumeIQ/' : '/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          pdfjs: ['pdfjs-dist'],
        }
      }
    }
  }
})
