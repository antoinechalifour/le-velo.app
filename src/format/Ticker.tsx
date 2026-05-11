import { useEffect, useRef, useState } from 'react'

type TickerProps = {
  value: number
  format: (n: number) => string
  durationMs?: number
  className?: string
}

// Approximates cubic-bezier(0.32, 0.72, 0, 1) — the shared --ease-paper curve.
const easePaper = (t: number) => {
  const u = 1 - t
  return 1 - u * u * u
}

export function Ticker({
  value,
  format,
  durationMs = 480,
  className,
}: TickerProps) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!Number.isFinite(value)) {
      fromRef.current = value
      return
    }
    const from = fromRef.current
    const to = value
    if (from === to) return

    const effectiveDuration = prefersReducedMotion() ? 0 : durationMs
    let start: number | null = null

    const step = (ts: number) => {
      if (start === null) start = ts
      const elapsed = ts - start
      const t = effectiveDuration <= 0 ? 1 : Math.min(1, elapsed / effectiveDuration)
      const eased = easePaper(t)
      setDisplay(from + (to - from) * eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        fromRef.current = to
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      fromRef.current = value
    }
  }, [value, durationMs])

  return <span className={className}>{format(display)}</span>
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
