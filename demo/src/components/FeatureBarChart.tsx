import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const FEATURE_NAMES = [
  'Time', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9',
  'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19',
  'V20', 'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28', 'Amount',
]

interface Props {
  perFeatureError: number[]
}

export default function FeatureBarChart({ perFeatureError }: Props) {
  const data = useMemo(() => {
    const sorted = [...perFeatureError].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]

    return perFeatureError.map((v, i) => ({
      name: FEATURE_NAMES[i] ?? `f${i}`,
      value: v,
      aboveMedian: v > median,
    }))
  }, [perFeatureError])

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-mono text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Per-Feature Reconstruction Error
        </h2>
        <p className="font-mono text-xs text-muted-foreground/60 mt-0.5">
          Squared reconstruction error for each of the 30 input features. Tall bars are the dimensions the model struggled to reproduce — the most anomalous features of this transaction. Bars above the median are highlighted violet.
        </p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fontFamily: 'Geist Mono, monospace', fill: '#71717a' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={48}
            />
            <YAxis
              tick={{ fontSize: 9, fontFamily: 'Geist Mono, monospace', fill: '#71717a' }}
              width={48}
              tickFormatter={(v: number) => v.toFixed(3)}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: 6,
                fontFamily: 'Geist Mono, monospace',
                fontSize: 12,
              }}
              formatter={(value) => [typeof value === 'number' ? value.toFixed(6) : value, 'sq. error']}
            />
            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.aboveMedian ? '#8b5cf6' : '#52525b'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
    </div>
  )
}
