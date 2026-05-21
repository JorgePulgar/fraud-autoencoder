import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { toast } from 'sonner'

const REQUIRED_COLS = ['Time', ...Array.from({ length: 28 }, (_, i) => `V${i + 1}`), 'Amount']

export interface ParsedRow {
  raw: Record<string, number>
}

interface Props {
  onRows: (rows: ParsedRow[]) => void
}

export default function CSVUpload({ onRows }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [rowCount, setRowCount] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  function processFile(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const headers = results.meta.fields ?? []
        const missing = REQUIRED_COLS.filter((c) => !headers.includes(c))
        if (missing.length > 0) {
          toast.error(`Invalid CSV — missing columns: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ` +${missing.length - 5} more` : ''}`)
          return
        }

        const badRows: number[] = []
        const parsed: ParsedRow[] = []
        results.data.forEach((row, i) => {
          const raw: Record<string, number> = {}
          let ok = true
          for (const col of REQUIRED_COLS) {
            const v = parseFloat(row[col])
            if (isNaN(v)) { ok = false; break }
            raw[col] = v
          }
          if (!ok) badRows.push(i + 2) // 1-indexed, +1 for header row
          else parsed.push({ raw })
        })

        if (badRows.length > 0) {
          const listed = badRows.slice(0, 5).join(', ')
          const suffix = badRows.length > 5 ? ` +${badRows.length - 5} more` : ''
          toast.error(`Skipped ${badRows.length} malformed row(s) — rows: ${listed}${suffix}`)
        }

        if (parsed.length === 0) {
          toast.error('No valid rows found in CSV.')
          return
        }

        setRowCount(parsed.length)
        onRows(parsed)
      },
      error(err) {
        toast.error(`CSV parse error: ${err.message}`)
      },
    })
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  return (
    <div className="space-y-3">
      <h2 className="font-mono text-sm font-semibold text-muted-foreground uppercase tracking-widest">
        Batch CSV Upload
      </h2>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? 'border-violet-500 bg-violet-500/10' : 'border-border hover:border-zinc-500'
        }`}
      >
        <p className="font-mono text-sm text-muted-foreground">
          {rowCount !== null
            ? <span className="text-emerald-400">{rowCount} rows loaded</span>
            : 'Drop a CSV file here or click to browse'}
        </p>
        <p className="font-mono text-xs text-muted-foreground/60 mt-1">
          Required columns: Time, V1–V28, Amount
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onFileChange}
        />
      </div>
    </div>
  )
}
