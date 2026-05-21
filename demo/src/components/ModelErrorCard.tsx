import { AlertTriangle } from 'lucide-react'

interface Props {
  message: string
}

export default function ModelErrorCard({ message }: Props) {
  return (
    <div className="rounded-lg border border-red-800 bg-red-950/20 p-6 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
        <p className="font-mono text-sm font-semibold text-red-400">Failed to load model</p>
      </div>
      <p className="font-mono text-xs text-muted-foreground leading-relaxed">{message}</p>
      <p className="font-mono text-xs text-muted-foreground/60">
        Check that <code className="text-zinc-400">autoencoder.onnx</code> and the JSON artifacts are present in <code className="text-zinc-400">demo/public/</code>.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 font-mono text-xs text-foreground transition-colors"
      >
        Reload
      </button>
    </div>
  )
}
