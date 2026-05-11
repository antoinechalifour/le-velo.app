import { useEffect } from 'react'

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
): void {
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const el = ref.current
      if (!el) return
      if (!el.contains(e.target as Node)) handler()
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [ref, handler])
}
