import { useId, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { LngLat } from '../geo/lngLat'
import { useClickOutside } from '../hooks/useClickOutside'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useHaptics } from '../hooks/useHaptics'
import type { NominatimResult } from '../nominatim/client'
import { nominatimSearchQueryOptions } from '../nominatim/query'

type AddressSearchProps = {
  placeholder: string
  onSelect: (point: LngLat, label: string) => void
}

export function AddressSearch({ placeholder, onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputId = useId()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const haptic = useHaptics()

  const debouncedQuery = useDebouncedValue(query, 300)
  const { data: results = [], isFetching } = useQuery(
    nominatimSearchQueryOptions(debouncedQuery),
  )

  useClickOutside(containerRef, () => setOpen(false))

  function pick(r: NominatimResult) {
    onSelect(r.point, r.shortLabel)
    setQuery('')
    setOpen(false)
    haptic('selection')
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
      setOpen(true)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
      return
    }
    if (e.key === 'Enter') {
      if (activeIdx >= 0 && results[activeIdx]) {
        e.preventDefault()
        pick(results[activeIdx])
      }
      return
    }
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showDropdown = open && query.trim().length >= 3

  return (
    <div ref={containerRef} className="relative">
      <input
        id={inputId}
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          setActiveIdx(-1)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        className="focus-ring w-full rounded-lg border border-ink/20 bg-paper-soft px-3.5 py-2.5 text-sm font-medium text-ink placeholder:font-normal placeholder:italic placeholder:text-sepia-soft focus:border-rust focus:outline-none"
      />
      {showDropdown && (
        <div className="paper-card scroll-soft absolute left-0 right-0 top-full z-20 mt-1.5 max-h-72 overflow-y-auto rounded-lg shadow-xl">
          {isFetching && results.length === 0 && (
            <div className="eyebrow-tight px-3.5 py-2.5 text-sepia">
              Recherche…
            </div>
          )}
          {!isFetching && results.length === 0 && (
            <div className="px-3.5 py-2.5 text-xs italic text-sepia">
              Aucun résultat
            </div>
          )}
          {results.map((r, idx) => {
            const active = idx === activeIdx
            return (
              <button
                key={`${r.point.lat}-${r.point.lng}-${idx}`}
                type="button"
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  pick(r)
                }}
                data-active={active}
                className="ink-wash block w-full border-b border-ink/8 px-3.5 py-2.5 text-left text-xs last:border-b-0"
              >
                <div className="truncate text-[0.85rem] font-medium text-ink">
                  {r.shortLabel}
                </div>
                <div className="truncate text-[0.72rem] text-sepia">
                  {r.label}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
