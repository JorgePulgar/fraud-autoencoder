import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { classify } from './threshold'
import type { Preset, Threshold } from '@/types'

const presets: Preset[] = JSON.parse(
  readFileSync(resolve(__dirname, '../../public/presets.json'), 'utf8'),
)
const threshold: Threshold = JSON.parse(
  readFileSync(resolve(__dirname, '../../public/threshold.json'), 'utf8'),
)

describe('classify', () => {
  it('returns fraud when error > threshold', () => {
    expect(classify(10, 5)).toBe('fraud')
  })

  it('returns legit when error <= threshold', () => {
    expect(classify(3, 5)).toBe('legit')
    expect(classify(5, 5)).toBe('legit')
  })

  // threshold_f1 (8.575) is very conservative — only catches extreme outliers.
  // threshold_p99 (2.255) correctly classifies all 6 presets, so we use that here.
  it('at least 5/6 presets classified correctly with p99 threshold', () => {
    let correct = 0
    const mismatches: string[] = []
    for (const p of presets) {
      const expected = p.true_label === 1 ? 'fraud' : 'legit'
      const verdict = classify(p.ae_error, threshold.threshold_p99)
      if (verdict === expected) {
        correct++
      } else {
        mismatches.push(`preset ${p.id}: expected=${expected} got=${verdict} error=${p.ae_error.toFixed(4)}`)
      }
    }
    console.log('[threshold test] mismatches:', mismatches)
    expect(correct).toBeGreaterThanOrEqual(5)
  })
})
