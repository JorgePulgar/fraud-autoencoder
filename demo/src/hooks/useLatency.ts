import { useCallback, useRef, useState } from 'react'

interface LatencyState {
  last: number | null
  avg: number | null
  count: number
}

export function useLatency() {
  const [state, setState] = useState<LatencyState>({ last: null, avg: null, count: 0 })
  const sumRef = useRef(0)

  const record = useCallback((durationMs: number) => {
    setState((prev) => {
      const count = prev.count + 1
      sumRef.current += durationMs
      return { last: durationMs, avg: sumRef.current / count, count }
    })
  }, [])

  return { ...state, record }
}
