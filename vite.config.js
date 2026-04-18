import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === 'true' && repoName

export default defineConfig({
  base: isGitHubPagesBuild ? `/${repoName}/` : '/',
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
