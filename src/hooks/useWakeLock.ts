import { useEffect } from 'react'

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return

    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      try {
        const next = await navigator.wakeLock.request('screen')
        if (cancelled) {
          await next.release().catch(() => {})
          return
        }
        sentinel = next
      } catch {
        // Permission denied or document not visible — ignore.
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && sentinel === null) {
        void acquire()
      }
    }

    void acquire()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibility)
      sentinel?.release().catch(() => {})
      sentinel = null
    }
  }, [active])
}
