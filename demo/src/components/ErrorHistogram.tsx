import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { useDemoStore } from '@/store'
import type { HistogramSample } from '@/types'
import WhyPRAUCPopover from '@/components/WhyPRAUCPopover'

const BINS = 40

interface BinDatum {
  x: number
  legit: number
  fraud: number
}

function buildBins(samples: HistogramSample[], min: number, max: number): BinDatum[] {
  const width = (max - min) / BINS
  const bins: BinDatum[] = Array.from({ length: BINS }, (_, i) => ({
    x: min + (i + 0.5) * width,
    legit: 0,
    fraud: 0,
  }))
  for (const s of samples) {
    const idx = Math.min(Math.floor((s.error - min) / width), BINS - 1)
    if (s.label === 0) { bins[idx].legit++ } else { bins[idx].fraud++ }
  }
  return bins
}

interface Props {
  histogramData: HistogramSample[]
}

export default function ErrorHistogram({ histogramData }: Props) {
  const threshold = useDemoStore((s) => s.threshold)

  const { bins, min, max } = useMemo(() => {
    const errors = histogramData.map((s) => s.error)
    const min = Math.min(...errors)
    const max = Math.max(...errors)
    return { bins: buildBins(histogramData, min, max), min, max }
  }, [histogramData])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="font-mono text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Reconstruction Error Distribution
        </h2>
        <WhyPRAUCPopover />
      </div>
      <div className="flex gap-4 font-mono text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500/70" /> Legit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-500/70" /> Fraud
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={bins} barCategoryGap={1} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
          <XAxis
            dataKey="x"
            type="number"
            domain={[min, max]}
            tickFormatter={(v: number) => v.toFixed(1)}
            tick={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, fill: '#71717a' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, fill: '#71717a' }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', fontFamily: 'Geist Mono, monospace', fontSize: 11 }}
            labelFormatter={(v) => `Error ≈ ${Number(v).toFixed(3)}`}
            formatter={(val, name) => [val, name === 'legit' ? 'Legit' : 'Fraud']}
          />
          <Bar dataKey="legit" stackId="a" fill="#10b981" fillOpacity={0.7} isAnimationActive={false} />
          <Bar dataKey="fraud" stackId="a" fill="#ef4444" fillOpacity={0.8} isAnimationActive={false} />
          {threshold !== null && (
            <ReferenceLine
              x={threshold}
              stroke="#a78bfa"
              strokeWidth={2}
              strokeDasharray="4 3"
              label={{ value: 'threshold', position: 'insideTopRight', fontFamily: 'Geist Mono, monospace', fontSize: 10, fill: '#a78bfa' }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
