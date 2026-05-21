interface Props {
  last: number | null
  avg: number | null
  count: number
}

export default function LatencyCounter({ last, avg, count }: Props) {
  if (last === null) return null

  return (
    <div className="font-mono text-xs text-muted-foreground tabular-nums">
      Last:{' '}
      <span className="text-foreground">{last.toFixed(1)} ms</span>
      {avg !== null && (
        <>
          {' '}·{' '}Avg:{' '}
          <span className="text-foreground">{avg.toFixed(1)} ms</span>
          {' '}({count})
        </>
      )}
    </div>
  )
}
