import { useState } from 'react'
import type * as ort from 'onnxruntime-web'
import type { ScalerParams, Preset, Prediction } from '@/types'
import { featuresToVector, applyScaler } from '@/lib/scaler'
import { runInference } from '@/lib/inference'
import { reconstructionError } from '@/lib/errors'
import { classify } from '@/lib/threshold'
import { useDemoStore } from '@/store'

// score_samples convention: more negative = more anomalous
const IF_THRESHOLD = -0.5

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
  const { setLastPrediction, setLastInput, setLastPredictionSource, threshold } = useDemoStore()

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
      setLastPredictionSource('preset')
      onInfer?.(elapsed)
    } finally {
      setRunning((r) => ({ ...r, [preset.id]: false }))
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-mono text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Preset Transactions
        </h2>
        <p className="font-mono text-xs text-muted-foreground/60 mt-0.5">
          6 real test-set transactions — 3 legit, 3 fraud. Click <span className="text-muted-foreground">Run</span> to pass each through the autoencoder.{' '}
          <span className="text-muted-foreground">AE</span> = autoencoder verdict (moves with the threshold slider).{' '}
          <span className="text-muted-foreground">IF</span> = Isolation Forest (precomputed, threshold-independent).
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {presets.map((preset) => {
          const result = results[preset.id]
          const isRunning = running[preset.id] ?? false
          const trueLabel = preset.true_label === 1 ? 'fraud' : 'legit'
          const liveVerdict = result && threshold !== null ? classify(result.error, threshold) : null
          const ifVerdict = preset.if_score < IF_THRESHOLD ? 'fraud' : 'legit'

          return (
            <div
              key={preset.id}
              className="rounded-lg border border-border bg-card p-4 flex items-center justify-between gap-4 transition-colors hover:bg-zinc-900/40"
            >
              <div className="flex items-center gap-3 min-w-0 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground w-16 shrink-0">{preset.id}</span>

                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-mono font-medium border ${
                    trueLabel === 'fraud'
                      ? 'border-red-800 bg-red-950 text-red-400'
                      : 'border-emerald-800 bg-emerald-950 text-emerald-400'
                  }`}
                >
                  true: {trueLabel}
                </span>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-muted-foreground">
                    AE:{' '}
                    {result ? (
                      <span className={liveVerdict === 'fraud' ? 'text-red-400' : 'text-emerald-400'}>
                        {liveVerdict ?? '—'}
                      </span>
                    ) : (
                      <span className="opacity-40">—</span>
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    IF:{' '}
                    <span className={ifVerdict === 'fraud' ? 'text-red-400' : 'text-emerald-400'}>
                      {ifVerdict}
                    </span>
                  </span>
                  {result && (
                    <span className="text-muted-foreground/60 tabular-nums">
                      err {result.error.toFixed(4)}
                    </span>
                  )}
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
      <p className="font-mono text-xs text-muted-foreground/50 pt-1">
        At the F1-optimal threshold the autoencoder catches ~46% of fraud cases (recall 0.46, PR-AUC 0.37). Missing some fraud presets is expected — not a bug.
        The model was trained with no fraud labels; some fraud transactions are close enough to legitimate patterns that the error stays below the threshold.
        Drag the threshold slider down to catch more fraud at the cost of more false alarms.
      </p>
    </div>
  )
}
