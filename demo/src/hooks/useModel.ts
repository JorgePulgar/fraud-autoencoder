import { useEffect, useState } from 'react'
import * as ort from 'onnxruntime-web'
import { loadModel } from '@/lib/inference'
import type { ScalerParams, Threshold, Preset, HistogramSample } from '@/types'

interface ModelState {
  status: 'loading' | 'ready' | 'error'
  session: ort.InferenceSession | null
  scaler: ScalerParams | null
  threshold: Threshold | null
  presets: Preset[] | null
  histogramData: HistogramSample[] | null
  error: string | null
}

const BASE = import.meta.env.BASE_URL

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export function useModel(): ModelState {
  const [state, setState] = useState<ModelState>({
    status: 'loading',
    session: null,
    scaler: null,
    threshold: null,
    presets: null,
    histogramData: null,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [scaler, threshold, presets, histogramData] = await Promise.all([
          fetchJson<ScalerParams>('scaler.json'),
          fetchJson<Threshold>('threshold.json'),
          fetchJson<Preset[]>('presets.json'),
          fetchJson<{ samples: HistogramSample[] }>('histogram-data.json'),
        ])

        const session = await loadModel(`${BASE}autoencoder.onnx`)

        if (!cancelled) {
          setState({ status: 'ready', session, scaler, threshold, presets, histogramData: histogramData.samples, error: null })
        }
      } catch (err) {
        if (!cancelled) {
          setState((prev) => ({ ...prev, status: 'error', error: String(err) }))
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return state
}
