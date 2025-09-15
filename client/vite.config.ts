import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Check if HTTPS certificates exist
const httpsConfig = (() => {
  const keyPath = path.resolve(__dirname, 'certs/localhost-key.pem')
  const certPath = path.resolve(__dirname, 'certs/localhost.pem')
  
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }
  }
  return false
})()

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow external connections for Docker
    https: httpsConfig, // Enable HTTPS if certificates exist
    watch: {
      usePolling: true, // Better file watching in Docker
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  publicDir: 'public',
  optimizeDeps: {
    exclude: ['debate_platform.js'] // Don't bundle our WASM module
  }
})