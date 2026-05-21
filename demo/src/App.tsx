import * as ort from 'onnxruntime-web'
import { useModel } from '@/hooks/useModel'
import './index.css'

// Single-threaded wasm — GitHub Pages cannot serve COOP/COEP headers.
ort.env.wasm.numThreads = 1
ort.env.wasm.wasmPaths = `${import.meta.env.BASE_URL}ort/`

export default function App() {
  const { status, error } = useModel()

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="font-mono text-3xl font-semibold tracking-tight text-foreground mb-2">
          Fraud Detection — Autoencoder Demo
        </h1>
        <p className="text-muted-foreground mb-6">
          In-browser inference on the Kaggle Credit Card Fraud dataset.
          No data leaves your device.
        </p>
        <p className="font-mono text-sm text-muted-foreground">
          Status: {status}
          {error && <span className="text-red-500 ml-2">{error}</span>}
        </p>
      </div>
    </div>
  )
}
