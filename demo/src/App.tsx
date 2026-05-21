import * as ort from 'onnxruntime-web'
import { useEffect, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { useModel } from '@/hooks/useModel'
import { useLatency } from '@/hooks/useLatency'
import { useDemoStore } from '@/store'
import Header from '@/components/Header'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Footer from '@/components/Footer'
import PresetRunner from '@/components/PresetRunner'
import ManualInputForm from '@/components/ManualInputForm'
import VerdictCard from '@/components/VerdictCard'
import FeatureBarChart from '@/components/FeatureBarChart'
import ThresholdSlider from '@/components/ThresholdSlider'
import ErrorHistogram from '@/components/ErrorHistogram'
import CSVUpload, { type ParsedRow } from '@/components/CSVUpload'
import BatchResults from '@/components/BatchResults'
import LatencyCounter from '@/components/LatencyCounter'
import './index.css'

ort.env.wasm.numThreads = 1
ort.env.wasm.wasmPaths = `${import.meta.env.BASE_URL}ort/`

function LoadingCard({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 animate-pulse">
      <div className="h-4 w-48 rounded bg-zinc-800 mb-3" />
      <div className="h-3 w-32 rounded bg-zinc-800" />
      <p className="font-mono text-xs text-muted-foreground mt-4">{message}</p>
    </div>
  )
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-800 bg-red-950/30 p-6">
      <p className="font-mono text-sm text-red-400">Failed to load model</p>
      <p className="font-mono text-xs text-muted-foreground mt-2">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 rounded px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 font-mono text-xs text-foreground transition-colors"
      >
        Reload
      </button>
    </div>
  )
}

export default function App() {
  const { status, session, scaler, threshold, presets, histogramData, error: loadError } = useModel()
  const { last, avg, count, record } = useLatency()
  const { lastPrediction, setThreshold } = useDemoStore()
  const [csvRows, setCsvRows] = useState<ParsedRow[]>([])

  useEffect(() => {
    if (threshold) setThreshold(threshold.threshold_f1)
  }, [threshold, setThreshold])

  const isReady = status === 'ready' && session && scaler && threshold && presets && histogramData

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Toaster />
      <Header />

      <Alert variant="muted" className="rounded-none border-x-0 border-t-0 text-center font-mono text-xs py-2">
        <AlertDescription>
          Portfolio project on public Kaggle data. Not a production fraud system.
        </AlertDescription>
      </Alert>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {status === 'loading' && (
          <LoadingCard message="Loading ONNX model and artifacts…" />
        )}

        {status === 'error' && loadError && (
          <ErrorCard message={loadError} />
        )}

        {isReady && (
          <>
            {/* Presets + manual form side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <PresetRunner
                  session={session}
                  scaler={scaler}
                  presets={presets}
                  onInfer={record}
                />
              </div>

              <div className="rounded-lg border border-border bg-card p-6 overflow-y-auto max-h-[640px]">
                <ManualInputForm
                  session={session}
                  scaler={scaler}
                  defaultRaw={presets[0].raw_features}
                  onInfer={record}
                />
              </div>
            </div>

            {/* Verdict + feature chart */}
            {lastPrediction && (
              <VerdictCard prediction={lastPrediction} />
            )}
            {lastPrediction && (
              <div className="rounded-lg border border-border bg-card p-6">
                <FeatureBarChart perFeatureError={lastPrediction.perFeatureError} />
              </div>
            )}

            {/* Threshold slider */}
            <div className="rounded-lg border border-border bg-card p-6">
              <ThresholdSlider histogramData={histogramData} threshold={threshold} />
            </div>

            {/* Histogram */}
            <div className="rounded-lg border border-border bg-card p-6">
              <ErrorHistogram histogramData={histogramData} />
            </div>

            {/* CSV upload + batch results */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-6">
              <CSVUpload onRows={setCsvRows} />
              {csvRows.length > 0 && (
                <BatchResults session={session} scaler={scaler} rows={csvRows} />
              )}
            </div>
          </>
        )}
      </main>

      <Footer />

      {last !== null && (
        <div className="fixed bottom-4 right-4 rounded-lg border border-border bg-card/90 backdrop-blur px-3 py-2">
          <LatencyCounter last={last} avg={avg} count={count} />
        </div>
      )}
    </div>
  )
}
