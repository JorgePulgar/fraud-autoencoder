import { ShieldCheck } from 'lucide-react'

export default function Header() {
  return (
    <header className="w-full border-b border-border bg-card px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="font-mono text-xl font-semibold tracking-tight text-foreground">
          Fraud Detection — Autoencoder Demo
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Autoencoder trained on the Kaggle Credit Card Fraud dataset · inference runs entirely in your browser via ONNX Runtime Web
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 text-xs font-mono text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          No data leaves your device
        </span>
        <a
          href="https://github.com/jpulgar111/fraud-autoencoder"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          v1 repo ↗
        </a>
      </div>
    </header>
  )
}
