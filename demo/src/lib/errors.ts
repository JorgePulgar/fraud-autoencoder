export function reconstructionError(
  input: number[],
  output: Float32Array,
): { perFeature: number[]; total: number } {
  const perFeature = input.map((v, i) => (v - output[i]) ** 2)
  const total = perFeature.reduce((sum, v) => sum + v, 0) / perFeature.length
  return { perFeature, total }
}
