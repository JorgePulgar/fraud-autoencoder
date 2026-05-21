import { useDemoStore } from '@/store'
import { classify } from '@/lib/threshold'
import type { Prediction } from '@/types'

interface Props {
  prediction: Prediction
}

export default function VerdictCard({ prediction }: Props) {
  const threshold = useDemoStore((s) => s.threshold)
  const source = useDemoStore((s) => s.lastPredictionSource)
  const liveVerdict = threshold !== null ? classify(prediction.error, threshold) : prediction.verdict
  const isFraud = liveVerdict === 'fraud'

  return (
    <div
      className={`rounded-lg border p-6 ${
        isFraud
          ? 'border-red-800 bg-red-950/40'
          : 'border-emerald-800 bg-emerald-950/40'
      }`}
    >
      <div className="flex items-baseline justify-between">
        <span
          className={`font-mono text-2xl font-bold tracking-tight ${
            isFraud ? 'text-red-400' : 'text-emerald-400'
          }`}
        >
          {isFraud ? 'FRAUD DETECTED' : 'LEGITIMATE'}
        </span>
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-sm text-muted-foreground">
            AE error:{' '}
            <span className={`text-lg font-semibold ${isFraud ? 'text-red-400' : 'text-emerald-400'}`}>
              {prediction.error.toFixed(6)}
            </span>
          </span>
          {source === 'manual' && (
            <span className="font-mono text-xs text-muted-foreground/50">
              IF: N/A — preset only
            </span>
          )}
        </div>
      </div>
      <p className="font-mono text-xs text-muted-foreground/50 mt-2">
        The autoencoder was trained only on legitimate transactions. High reconstruction error means the input looks unusual — the model couldn't reproduce it well.
        The verdict is <span className="text-muted-foreground">fraud</span> if the error exceeds the current threshold.
      </p>
    </div>
  )
}
