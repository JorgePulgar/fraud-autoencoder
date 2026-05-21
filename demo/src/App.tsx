import { useState } from 'react'
import * as ort from 'onnxruntime-web'
import { useModel } from '@/hooks/useModel'
import { featuresToVector, applyScaler } from '@/lib/scaler'
import { runInference } from '@/lib/inference'
import { reconstructionError } from '@/lib/errors'
import { classify } from '@/lib/threshold'
import './index.css'

// Single-threaded wasm — GitHub Pages cannot serve COOP/COEP headers.
ort.env.wasm.numThreads = 1
ort.env.wasm.wasmPaths = `${import.meta.env.BASE_URL}ort/`

interface SmokeResult {
  error: number
  verdict: 'fraud' | 'legit'
  expected: 'fraud' | 'legit'
  match: boolean
}

export default function App() {
  const { status, session, scaler, threshold, presets, error: loadError } = useModel()
  const [result, setResult] = useState<SmokeResult | null>(null)
  const [running, setRunning] = useState(false)

  async function runPreset0() {
    if (!session || !scaler || !threshold || !presets) return
    setRunning(true)
    try {
      const preset = presets[0]
      const vec = featuresToVector(preset.raw_features, scaler.feature_order)
      const scaled = applyScaler(vec, scaler)
      const output = await runInference(session, scaled)
      const { total } = reconstructionError(scaled, output)
      const verdict = classify(total, threshold.threshold_p99)
      const expected = preset.true_label === 1 ? 'fraud' : 'legit'
      setResult({ error: total, verdict, expected, match: verdict === expected })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-8 shadow-sm space-y-4">
        <h1 className="font-mono text-3xl font-semibold tracking-tight text-foreground">
          Fraud Detection — Autoencoder Demo
        </h1>
        <p className="text-muted-foreground">
          In-browser inference on the Kaggle Credit Card Fraud dataset.
          No data leaves your device.
        </p>

        <p className="font-mono text-sm">
          Model: <span className={status === 'ready' ? 'text-emerald-500' : 'text-muted-foreground'}>{status}</span>
          {loadError && <span className="text-red-500 ml-2">{loadError}</span>}
        </p>

        <button
          onClick={runPreset0}
          disabled={status !== 'ready' || running}
          className="px-4 py-2 rounded bg-violet-500 text-white font-mono text-sm disabled:opacity-40"
        >
          {running ? 'Running…' : 'Run preset 0'}
        </button>

        {result && (
          <div className="font-mono text-sm space-y-1 border border-border rounded p-4">
            <div>error: <span className="text-foreground">{result.error.toFixed(6)}</span></div>
            <div>verdict: <span className={result.verdict === 'fraud' ? 'text-red-500' : 'text-emerald-500'}>{result.verdict}</span></div>
            <div>expected: <span className={result.expected === 'fraud' ? 'text-red-500' : 'text-emerald-500'}>{result.expected}</span></div>
            <div>match: <span className={result.match ? 'text-emerald-500' : 'text-red-500'}>{result.match ? '✓' : '✗'}</span></div>
          </div>
        )}
      </div>
    </div>
  )
}
