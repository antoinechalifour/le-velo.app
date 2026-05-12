import { useCallback } from 'react'
import { useWebHaptics } from 'web-haptics/react'

type Pattern =
  | 'success'
  | 'warning'
  | 'error'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'soft'
  | 'rigid'
  | 'selection'
  | 'nudge'
  | 'buzz'

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export function useHaptics() {
  const { trigger } = useWebHaptics()

  return useCallback(
    (pattern: Pattern) => {
      if (prefersReducedMotion()) return
      trigger(pattern)
    },
    [trigger],
  )
}
