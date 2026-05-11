import { useEffect, useRef } from 'react'
import { useSetAtom } from 'jotai'
import { sheetOpenAtom } from '../state/sheet'

export function useAutoOpenSheet(
  hasResults: boolean,
  pointsCount: number,
): void {
  const setOpen = useSetAtom(sheetOpenAtom)
  const openedRef = useRef(false)

  useEffect(() => {
    if (hasResults && !openedRef.current) {
      openedRef.current = true
      setOpen(true)
    }
    if (pointsCount === 0) {
      openedRef.current = false
    }
  }, [hasResults, pointsCount, setOpen])
}
