import { create } from 'zustand'
import type { Prediction } from '@/types'

interface DemoStore {
  lastPrediction: Prediction | null
  lastInput: { scaled: number[]; raw: Record<string, number> } | null
  lastPredictionSource: 'preset' | 'manual' | null
  threshold: number | null
  setLastPrediction: (p: Prediction) => void
  setLastInput: (input: { scaled: number[]; raw: Record<string, number> }) => void
  setLastPredictionSource: (source: 'preset' | 'manual') => void
  setThreshold: (t: number) => void
}

export const useDemoStore = create<DemoStore>((set) => ({
  lastPrediction: null,
  lastInput: null,
  lastPredictionSource: null,
  threshold: null,
  setLastPrediction: (p) => set({ lastPrediction: p }),
  setLastInput: (input) => set({ lastInput: input }),
  setLastPredictionSource: (source) => set({ lastPredictionSource: source }),
  setThreshold: (t) => set({ threshold: t }),
}))
