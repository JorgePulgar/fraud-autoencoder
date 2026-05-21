import path from 'path'
import fs from 'fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function ortWasm(): Plugin {
  const wasmFiles = ['ort-wasm-simd.wasm', 'ort-wasm.wasm']
  const ortSrc = path.resolve(__dirname, 'node_modules/onnxruntime-web/dist')
  return {
    name: 'ort-wasm',
    // prod: copy to dist/ort/ after bundle
    apply: 'build',
    closeBundle() {
      const dest = path.resolve(__dirname, 'dist/ort')
      fs.mkdirSync(dest, { recursive: true })
      for (const f of wasmFiles) {
        fs.copyFileSync(path.join(ortSrc, f), path.join(dest, f))
      }
    },
    // dev: serve from node_modules at /fraud-autoencoder/ort/<file>
    configureServer(server) {
      server.middlewares.use('/fraud-autoencoder/ort', (req, res, next) => {
        const file = req.url?.replace(/^\//, '') ?? ''
        if (!wasmFiles.includes(file)) return next()
        res.setHeader('Content-Type', 'application/wasm')
        fs.createReadStream(path.join(ortSrc, file)).pipe(res)
      })
    },
  }
}

export default defineConfig({
  base: '/fraud-autoencoder/',
  plugins: [react(), ortWasm()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web'],
  },
})
