import { useCallback, useRef } from 'react'
import { useHaptics } from './useHaptics'

type ScrubHandlers<E extends Element> = {
  onTouchStart: (e: React.TouchEvent<E>) => void
  onTouchMove: (e: React.TouchEvent<E>) => void
  onTouchEnd: (e: React.TouchEvent<E>) => void
  onTouchCancel: (e: React.TouchEvent<E>) => void
}

export function useTouchScrubX<E extends Element>(opts: {
  onScrub: (t: number, phase: 'start' | 'move') => void
  onEnd?: () => void
  getTick?: (t: number) => string | number | null
}): ScrubHandlers<E> {
  const { onScrub, onEnd, getTick } = opts
  const haptic = useHaptics()
  const lastTickRef = useRef<string | number | null>(null)
  const activeRef = useRef(false)

  const apply = useCallback(
    (clientX: number, target: Element, phase: 'start' | 'move') => {
      const rect = target.getBoundingClientRect()
      if (rect.width <= 0) return
      const t = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      onScrub(t, phase)
      if (getTick) {
        const tick = getTick(t)
        if (tick !== null && tick !== lastTickRef.current) {
          if (phase === 'move' && lastTickRef.current !== null) {
            haptic('selection')
          }
          lastTickRef.current = tick
        }
      }
      if (phase === 'start') haptic('selection')
    },
    [onScrub, getTick, haptic],
  )

  const onTouchStart = useCallback(
    (e: React.TouchEvent<E>) => {
      const touch = e.touches[0]
      if (!touch) return
      activeRef.current = true
      lastTickRef.current = null
      apply(touch.clientX, e.currentTarget, 'start')
    },
    [apply],
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent<E>) => {
      if (!activeRef.current) return
      const touch = e.touches[0]
      if (!touch) return
      apply(touch.clientX, e.currentTarget, 'move')
    },
    [apply],
  )

  const handleEnd = useCallback(() => {
    activeRef.current = false
    lastTickRef.current = null
    onEnd?.()
  }, [onEnd])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd: handleEnd,
    onTouchCancel: handleEnd,
  }
}
