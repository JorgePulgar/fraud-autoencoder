import { useEffect, useRef, useState } from 'react'
import type * as ort from 'onnxruntime-web'
import { featuresToVector, applyScaler } from '@/lib/scaler'
import { runInference } from '@/lib/inference'
import { reconstructionError } from '@/lib/errors'
import { classify } from '@/lib/threshold'
import { useDemoStore } from '@/store'
import type { ScalerParams } from '@/types'
import type { ParsedRow } from './CSVUpload'

interface RowResult {
  index: number
  error: number
}

type SortKey = 'index' | 'error' | 'verdict'
type SortDir = 'asc' | 'desc'

interface Props {
  session: ort.InferenceSession
  scaler: ScalerParams
  rows: ParsedRow[]
}

export default function BatchResults({ session, scaler, rows }: Props) {
  const threshold = useDemoStore((s) => s.threshold)
  const [results, setResults] = useState<RowResult[]>([])
  const [progress, setProgress] = useState(0)
  const [running, setRunning] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('index')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const runIdRef = useRef(0)

  useEffect(() => {
    if (rows.length === 0) return
    const runId = ++runIdRef.current
    setResults([])
    setProgress(0)
    setRunning(true)

    async function run() {
      const out: RowResult[] = []
      for (let i = 0; i < rows.length; i++) {
        if (runId !== runIdRef.current) return
        const vec = featuresToVector(rows[i].raw, scaler.feature_order)
        const scaled = applyScaler(vec, scaler)
        const output = await runInference(session, scaled)
        const { total } = reconstructionError(scaled, output)
        out.push({ index: i + 1, error: total })
        setProgress(i + 1)
      }
      if (runId === runIdRef.current) {
        setResults(out)
        setRunning(false)
      }
    }

    run()
  }, [rows, session, scaler])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = [...results].sort((a, b) => {
    let av: number, bv: number
    if (sortKey === 'index') { av = a.index; bv = b.index }
    else if (sortKey === 'error') { av = a.error; bv = b.error }
    else {
      // verdict: fraud=1, legit=0 — sort frauds first in asc
      av = threshold !== null && classify(a.error, threshold) === 'fraud' ? 1 : 0
      bv = threshold !== null && classify(b.error, threshold) === 'fraud' ? 1 : 0
    }
    return sortDir === 'asc' ? av - bv : bv - av
  })

  if (rows.length === 0) return null

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ⇅'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Batch Results
        </h2>
        {running && (
          <span className="font-mono text-xs text-muted-foreground">
            {progress} / {rows.length}
          </span>
        )}
        {!running && results.length > 0 && (
          <span className="font-mono text-xs text-muted-foreground">
            {results.length} rows
          </span>
        )}
      </div>

      {running && (
        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-violet-500 transition-all"
            style={{ width: `${(progress / rows.length) * 100}%` }}
          />
        </div>
      )}

      {!running && results.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-border bg-zinc-900/60">
                {(['index', 'error', 'verdict'] as SortKey[]).map((k) => (
                  <th
                    key={k}
                    onClick={() => toggleSort(k)}
                    className="px-4 py-2 text-left text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors capitalize"
                  >
                    {k}<SortIcon k={k} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const verdict = threshold !== null ? classify(r.error, threshold) : 'legit'
                const isFraud = verdict === 'fraud'
                return (
                  <tr key={r.index} className="border-b border-border/50 last:border-0 hover:bg-zinc-900/40">
                    <td className="px-4 py-2 tabular-nums text-muted-foreground">{r.index}</td>
                    <td className={`px-4 py-2 tabular-nums ${isFraud ? 'text-red-400' : 'text-emerald-400'}`}>
                      {r.error.toFixed(4)}
                    </td>
                    <td className={`px-4 py-2 font-semibold ${isFraud ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isFraud ? 'FRAUD' : 'legit'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
