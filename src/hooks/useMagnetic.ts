import { useCallback, useRef } from 'react'

type Options = {
  strength?: number
  max?: number
}

export function useMagnetic<T extends HTMLElement>({
  strength = 0.18,
  max = 6,
}: Options = {}) {
  const ref = useRef<T | null>(null)

  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * strength
      const dy = (e.clientY - cy) * strength
      const clamp = (v: number) => Math.max(-max, Math.min(max, v))
      el.style.transitionProperty = 'transform'
      el.style.transitionDuration = '0ms'
      el.style.transform = `translate3d(${clamp(dx)}px, ${clamp(dy)}px, 0)`
    },
    [strength, max],
  )

  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transitionProperty = 'transform'
    el.style.transitionDuration = 'var(--dur-quick)'
    el.style.transitionTimingFunction = 'var(--ease-paper)'
    el.style.transform = ''
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}
