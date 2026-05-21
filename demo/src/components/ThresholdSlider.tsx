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
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Threshold
        </h2>
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
  )
}
