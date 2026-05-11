import { useId, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { LngLat } from '../geo/lngLat'
import { useClickOutside } from '../hooks/useClickOutside'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
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

  const debouncedQuery = useDebouncedValue(query, 300)
  const { data: results = [], isFetching } = useQuery(
    nominatimSearchQueryOptions(debouncedQuery),
  )

  useClickOutside(containerRef, () => setOpen(false))

  function pick(r: NominatimResult) {
    onSelect(r.point, r.shortLabel)
    setQuery('')
    setOpen(false)
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
        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
      />
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {isFetching && results.length === 0 && (
            <div className="px-3 py-2 text-xs text-slate-500">Recherche…</div>
          )}
          {!isFetching && results.length === 0 && (
            <div className="px-3 py-2 text-xs text-slate-500">
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
                className={`block w-full px-3 py-2 text-left text-xs ${
                  active ? 'bg-blue-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="truncate font-medium text-slate-900">
                  {r.shortLabel}
                </div>
                <div className="truncate text-slate-500">{r.label}</div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
