import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { applyScaler, featuresToVector } from './scaler'
import type { ScalerParams, Preset } from '@/types'

const scaler: ScalerParams = JSON.parse(
  readFileSync(resolve(__dirname, '../../public/scaler.json'), 'utf8'),
)
const presets: Preset[] = JSON.parse(
  readFileSync(resolve(__dirname, '../../public/presets.json'), 'utf8'),
)

// Expected first-5 scaled values computed in Python (double precision)
const expected: [number, number, number, number, number][] = [
  [1.1299815162210998, -0.565884678866764, 0.14379683796021786, 1.1597783099916203, -1.6761854506329765],
  [-1.1066137997529029, -4.827931578042945, 4.5485363077702194, -1.8644327327843928, -1.6028127768567302],
  [-0.34987181534941364, -0.18012304596433545, 0.672679405767234, 0.8705663144666863, 0.05366292628785518],
]

describe('scaler', () => {
  for (let i = 0; i < 3; i++) {
    it(`preset ${i}: featuresToVector respects feature_order`, () => {
      const vec = featuresToVector(presets[i].raw_features, scaler.feature_order)
      expect(vec).toHaveLength(30)
      // First feature is Time — spot-check it wasn't shuffled
      expect(vec[0]).toBe(presets[i].raw_features['Time'])
    })

    it(`preset ${i}: applyScaler first 5 elements match Python within 1e-6`, () => {
      const vec = featuresToVector(presets[i].raw_features, scaler.feature_order)
      const scaled = applyScaler(vec, scaler)
      for (let j = 0; j < 5; j++) {
        expect(scaled[j]).toBeCloseTo(expected[i][j], 6)
      }
    })
  }
})
