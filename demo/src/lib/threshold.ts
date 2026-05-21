export function classify(error: number, threshold: number): 'fraud' | 'legit' {
  return error > threshold ? 'fraud' : 'legit'
}
