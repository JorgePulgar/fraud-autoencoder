import type { Prediction } from '@/types'

interface Props {
  prediction: Prediction
}

export default function VerdictCard({ prediction }: Props) {
  const isFraud = prediction.verdict === 'fraud'

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
        <span className="font-mono text-sm text-muted-foreground">
          AE error:{' '}
          <span className={`text-lg font-semibold ${isFraud ? 'text-red-400' : 'text-emerald-400'}`}>
            {prediction.error.toFixed(6)}
          </span>
        </span>
      </div>
    </div>
  )
}
