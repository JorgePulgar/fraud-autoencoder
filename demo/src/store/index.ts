import { create } from 'zustand'
import type { Prediction } from '@/types'

interface DemoStore {
  lastPrediction: Prediction | null
  lastInput: { scaled: number[]; raw: Record<string, number> } | null
  setLastPrediction: (p: Prediction) => void
  setLastInput: (input: { scaled: number[]; raw: Record<string, number> }) => void
}

export const useDemoStore = create<DemoStore>((set) => ({
  lastPrediction: null,
  lastInput: null,
  setLastPrediction: (p) => set({ lastPrediction: p }),
  setLastInput: (input) => set({ lastInput: input }),
}))
