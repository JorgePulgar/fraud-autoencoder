import { useMemo } from 'react'
import { Slider } from '@/components/ui/slider'
import { useDemoStore } from '@/store'
import type { HistogramSample, Threshold } from '@/types'

interface Props {
  histogramData: HistogramSample[]
  threshold: Threshold
}

export default function ThresholdSlider({ histogramData, threshold }: Props) {
  const { threshold: liveThreshold, setThreshold } = useDemoStore()

  const { min, max } = useMemo(() => {
    const errors = histogramData.map((s) => s.error)
    return { min: Math.min(...errors), max: Math.max(...errors) }
  }, [histogramData])

  const current = liveThreshold ?? threshold.threshold_f1

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-mono text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Detection Threshold
          </h2>
          <p className="font-mono text-xs text-muted-foreground/60 mt-0.5">
            Drag to adjust the fraud/legit boundary · re-classifies all loaded rows in real time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-foreground tabular-nums">
            {current.toFixed(4)}
          </span>
          <button
            onClick={() => setThreshold(threshold.threshold_f1)}
            className="rounded px-2 py-1 bg-zinc-800 hover:bg-zinc-700 font-mono text-xs text-muted-foreground transition-colors"
          >
            Reset to F1-optimal
          </button>
        </div>
      </div>
      {/* Desktop: interactive slider */}
      <div className="hidden md:block space-y-2">
        <Slider
          min={min}
          max={max}
          step={(max - min) / 1000}
          value={[current]}
          onValueChange={([v]) => setThreshold(v)}
          className="w-full"
        />
        <div className="flex justify-between font-mono text-xs text-muted-foreground">
          <span>{min.toFixed(3)}</span>
          <span>{max.toFixed(3)}</span>
        </div>
      </div>

      {/* Mobile: number input */}
      <div className="md:hidden">
        <input
          type="number"
          min={min}
          max={max}
          step={(max - min) / 1000}
          value={current}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v)) setThreshold(Math.max(min, Math.min(max, v)))
          }}
          className="w-full rounded border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        <div className="flex justify-between font-mono text-xs text-muted-foreground mt-1">
          <span>min {min.toFixed(3)}</span>
          <span>max {max.toFixed(3)}</span>
        </div>
      </div>
    </div>
  )
}
