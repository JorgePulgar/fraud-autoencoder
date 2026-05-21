import * as ort from 'onnxruntime-web'
import { useEffect, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { useModel } from '@/hooks/useModel'
import { useLatency } from '@/hooks/useLatency'
import { useDemoStore } from '@/store'
import Header from '@/components/Header'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Footer from '@/components/Footer'
import ModelErrorCard from '@/components/ModelErrorCard'
import PresetRunner from '@/components/PresetRunner'
import ManualInputForm from '@/components/ManualInputForm'
import VerdictCard from '@/components/VerdictCard'
import FeatureBarChart from '@/components/FeatureBarChart'
import ThresholdSlider from '@/components/ThresholdSlider'
import ErrorHistogram from '@/components/ErrorHistogram'
import CSVUpload, { type ParsedRow } from '@/components/CSVUpload'
import BatchResults from '@/components/BatchResults'
import LatencyCounter from '@/components/LatencyCounter'
import { Skeleton } from '@/components/ui/skeleton'
import './index.css'

ort.env.wasm.numThreads = 1
ort.env.wasm.wasmPaths = `${import.meta.env.BASE_URL}ort/`

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Presets + manual form row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <Skeleton className="h-3.5 w-32" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-7 w-12 rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-3.5 w-40" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-full rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-4 w-full rounded-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-9 w-full rounded" />
        </div>
      </div>

      {/* Threshold slider */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-6 w-28 rounded" />
        </div>
        <Skeleton className="h-5 w-full rounded-full" />
      </div>

      {/* Histogram */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-3">
        <Skeleton className="h-3.5 w-56" />
        <Skeleton className="h-[200px] w-full rounded" />
      </div>

      {/* CSV upload */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-3">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
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
        {status === 'loading' && <LoadingSkeleton />}

        {status === 'error' && loadError && (
          <ModelErrorCard message={loadError} />
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

              <div className="rounded-lg border border-border bg-card p-6 lg:overflow-y-auto lg:max-h-[640px]">
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
