import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type * as ort from 'onnxruntime-web'
import { Slider } from '@/components/ui/slider'
import { featuresToVector, applyScaler } from '@/lib/scaler'
import { runInference } from '@/lib/inference'
import { reconstructionError } from '@/lib/errors'
import { classify } from '@/lib/threshold'
import { useDemoStore } from '@/store'
import type { ScalerParams, Threshold, Prediction } from '@/types'

const V_NAMES = Array.from({ length: 28 }, (_, i) => `V${i + 1}`)
const ALL_FEATURES = ['Time', ...V_NAMES, 'Amount'] as const

const BOUNDS: Record<string, { min: number; max: number; step: number }> = {
  Time:   { min: 0,   max: 172800, step: 1    },
  Amount: { min: 0,   max: 25691,  step: 0.01 },
  ...Object.fromEntries(V_NAMES.map((n) => [n, { min: -50, max: 50, step: 0.01 }])),
}

const schema = z.object(
  Object.fromEntries(ALL_FEATURES.map((f) => [f, z.number()])) as Record<typeof ALL_FEATURES[number], z.ZodNumber>
)
type FormValues = z.infer<typeof schema>

interface Props {
  session: ort.InferenceSession
  scaler: ScalerParams
  threshold: Threshold
  defaultRaw: Record<string, number>
  onInfer?: (durationMs: number) => void
}

export default function ManualInputForm({ session, scaler, threshold, defaultRaw, onInfer }: Props) {
  const { setLastPrediction, setLastInput } = useDemoStore()

  const defaultValues = Object.fromEntries(
    ALL_FEATURES.map((f) => [f, defaultRaw[f] ?? 0])
  ) as FormValues

  const { control, handleSubmit, watch, formState: { isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const values = watch()

  async function onSubmit(data: FormValues) {
    const t0 = performance.now()
    const raw = data as Record<string, number>
    const vec = featuresToVector(raw, scaler.feature_order)
    const scaled = applyScaler(vec, scaler)
    const output = await runInference(session, scaled)
    const { perFeature, total } = reconstructionError(scaled, output)
    const verdict = classify(total, threshold.threshold_p99)
    const elapsed = performance.now() - t0

    const prediction: Prediction = { error: total, perFeatureError: perFeature, verdict }
    setLastPrediction(prediction)
    setLastInput({ scaled, raw })
    onInfer?.(elapsed)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="font-mono text-sm font-semibold text-muted-foreground uppercase tracking-widest">
        Manual Input
      </h2>

      {/* Time + Amount */}
      <div className="grid grid-cols-2 gap-3">
        {(['Time', 'Amount'] as const).map((name) => (
          <div key={name} className="space-y-1">
            <label className="font-mono text-xs text-muted-foreground flex justify-between">
              <span>{name}</span>
              <span className="text-foreground tabular-nums">{(values[name] ?? 0).toFixed(2)}</span>
            </label>
            <Controller
              control={control}
              name={name}
              render={({ field }) => (
                <input
                  type="number"
                  min={BOUNDS[name].min}
                  max={BOUNDS[name].max}
                  step={BOUNDS[name].step}
                  value={field.value}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  className="w-full rounded border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              )}
            />
          </div>
        ))}
      </div>

      {/* V1–V28 sliders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
        {V_NAMES.map((name) => {
          const key = name as typeof ALL_FEATURES[number]
          const b = BOUNDS[name]
          return (
            <div key={name} className="space-y-1">
              <label className="font-mono text-xs text-muted-foreground flex justify-between">
                <span>{name}</span>
                <span className="text-foreground tabular-nums">
                  {(values[key] ?? 0).toFixed(2)}
                </span>
              </label>
              <Controller
                control={control}
                name={key}
                render={({ field }) => (
                  <Slider
                    min={b.min}
                    max={b.max}
                    step={b.step}
                    value={[field.value]}
                    onValueChange={([v]) => field.onChange(v)}
                  />
                )}
              />
            </div>
          )
        })}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-mono text-sm transition-colors"
      >
        {isSubmitting ? 'Running…' : 'Run Inference'}
      </button>
    </form>
  )
}
