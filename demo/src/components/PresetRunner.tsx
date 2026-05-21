import { useState } from 'react'
import type * as ort from 'onnxruntime-web'
import type { ScalerParams, Preset, Prediction } from '@/types'
import { featuresToVector, applyScaler } from '@/lib/scaler'
import { runInference } from '@/lib/inference'
import { reconstructionError } from '@/lib/errors'
import { classify } from '@/lib/threshold'
import { useDemoStore } from '@/store'

interface CardResult {
  error: number
}

interface Props {
  session: ort.InferenceSession
  scaler: ScalerParams
  presets: Preset[]
  onInfer?: (durationMs: number) => void
}

export default function PresetRunner({ session, scaler, presets, onInfer }: Props) {
  const [results, setResults] = useState<Record<string, CardResult>>({})
  const [running, setRunning] = useState<Record<string, boolean>>({})
  const { setLastPrediction, setLastInput, threshold } = useDemoStore()

  async function runPreset(preset: Preset) {
    if (threshold === null) return
    setRunning((r) => ({ ...r, [preset.id]: true }))
    try {
      const t0 = performance.now()
      const vec = featuresToVector(preset.raw_features, scaler.feature_order)
      const scaled = applyScaler(vec, scaler)
      const output = await runInference(session, scaled)
      const { perFeature, total } = reconstructionError(scaled, output)
      const verdict = classify(total, threshold)
      const elapsed = performance.now() - t0

      const prediction: Prediction = { error: total, perFeatureError: perFeature, verdict }
      setResults((r) => ({ ...r, [preset.id]: { error: total } }))
      setLastPrediction(prediction)
      setLastInput({ scaled, raw: preset.raw_features })
      onInfer?.(elapsed)
    } finally {
      setRunning((r) => ({ ...r, [preset.id]: false }))
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="font-mono text-sm font-semibold text-muted-foreground uppercase tracking-widest">
        Preset Transactions
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {presets.map((preset) => {
          const result = results[preset.id]
          const isRunning = running[preset.id] ?? false
          const trueLabel = preset.true_label === 1 ? 'fraud' : 'legit'
          const liveVerdict = result && threshold !== null ? classify(result.error, threshold) : null

          return (
            <div
              key={preset.id}
              className="rounded-lg border border-border bg-card p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs text-muted-foreground w-16 shrink-0">{preset.id}</span>

                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-mono font-medium border ${
                    trueLabel === 'fraud'
                      ? 'border-red-800 bg-red-950 text-red-400'
                      : 'border-emerald-800 bg-emerald-950 text-emerald-400'
                  }`}
                >
                  {trueLabel}
                </span>

                <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
                  <span>
                    AE:{' '}
                    {result ? (
                      <span
                        className={liveVerdict === 'fraud' ? 'text-red-400' : 'text-emerald-400'}
                      >
                        {result.error.toFixed(5)}
                      </span>
                    ) : (
                      <span className="opacity-40">—</span>
                    )}
                  </span>
                  <span>
                    IF: <span className="text-foreground">{preset.if_score.toFixed(4)}</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => runPreset(preset)}
                disabled={isRunning}
                className="shrink-0 rounded px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-mono text-xs transition-colors"
              >
                {isRunning ? 'Running…' : 'Run'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
