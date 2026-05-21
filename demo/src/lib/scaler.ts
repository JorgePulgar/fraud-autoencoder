import type { ScalerParams } from '@/types'

export function featuresToVector(
  features: Record<string, number>,
  order: string[],
): number[] {
  return order.map((name) => features[name])
}

export function applyScaler(x: number[], params: ScalerParams): number[] {
  return x.map((v, i) => (v - params.mean[i]) / params.scale[i])
}
