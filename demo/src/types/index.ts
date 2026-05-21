export interface ScalerParams {
  mean: number[]
  scale: number[]
  feature_order: string[]
}

export interface Threshold {
  threshold_p99: number
  threshold_f1: number
  f1_at_p99: number
  f1_at_f1_threshold: number
}

export interface Preset {
  id: string
  raw_features: Record<string, number>
  true_label: 0 | 1
  ae_error: number
  if_score: number
}

export interface HistogramSample {
  error: number
  label: 0 | 1
}

export interface Prediction {
  error: number
  perFeatureError: number[]
  verdict: 'fraud' | 'legit'
}
