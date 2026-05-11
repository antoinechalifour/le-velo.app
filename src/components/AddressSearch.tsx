import { useEffect, useId, useRef, useState } from 'react'
import { searchAddress, type NominatimResult } from '../lib/nominatim'
import type { LngLat } from '../types'

type AddressSearchProps = {
  placeholder: string
  onSelect: (point: LngLat, label: string) => void
}

export function AddressSearch({ placeholder, onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputId = useId()
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 3) {
      const clear = setTimeout(() => {
        setResults([])
        setLoading(false)
      }, 0)
      return () => clearTimeout(clear)
    }
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setLoading(true)
      searchAddress(q, controller.signal)
        .then((r) => {
          setResults(r)
          setActiveIdx(r.length > 0 ? 0 : -1)
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === 'AbortError') return
          setResults([])
        })
        .finally(() => setLoading(false))
    }, 300)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function pick(r: NominatimResult) {
    onSelect(r.point, r.shortLabel)
    setQuery('')
    setResults([])
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
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
      />
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {loading && results.length === 0 && (
            <div className="px-3 py-2 text-xs text-slate-500">Recherche…</div>
          )}
          {!loading && results.length === 0 && (
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
