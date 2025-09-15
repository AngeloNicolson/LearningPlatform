import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Check if HTTPS certificates exist
const httpsConfig = (() => {
  // Try Docker mount path first, then local path
  const dockerKeyPath = path.resolve(__dirname, 'certs/localhost-key.pem')
  const dockerCertPath = path.resolve(__dirname, 'certs/localhost.pem')
  const localKeyPath = path.resolve(__dirname, '../certs/localhost-key.pem')
  const localCertPath = path.resolve(__dirname, '../certs/localhost.pem')
  
  if (fs.existsSync(dockerKeyPath) && fs.existsSync(dockerCertPath)) {
    return {
      key: fs.readFileSync(dockerKeyPath),
      cert: fs.readFileSync(dockerCertPath)
    }
  } else if (fs.existsSync(localKeyPath) && fs.existsSync(localCertPath)) {
    return {
      key: fs.readFileSync(localKeyPath),
      cert: fs.readFileSync(localCertPath)
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