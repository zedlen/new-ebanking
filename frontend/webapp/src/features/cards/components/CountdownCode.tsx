import { useEffect, useState } from 'react'

interface CountdownCodeProps {
  code: string
  totalSeconds: number
  onFinish?: () => void
}

export function CountdownCode({ code, totalSeconds, onFinish }: CountdownCodeProps) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    setRemaining(totalSeconds)
  }, [code, totalSeconds])

  useEffect(() => {
    if (remaining <= 0) {
      onFinish?.()
      return
    }
    const timer = window.setTimeout(() => setRemaining((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [remaining, onFinish])

  const progress = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0

  return (
    <article className="flex flex-col items-center gap-3">
      <p className="font-mono text-3xl font-bold tracking-widest text-foreground">{code}</p>
      <p className="text-xs text-neutral">{remaining}s restantes</p>
      <span className="h-1 w-full overflow-hidden rounded-full bg-border">
        <span
          className="block h-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </span>
    </article>
  )
}
