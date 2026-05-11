import { PROFILES } from '../route/profile'
import { useProfileParam } from '../url/params'

export function ProfilePicker() {
  const [value, setValue] = useProfileParam()
  const active = PROFILES.find((p) => p.id === value)

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        Type de trajet
      </h2>
      <div className="grid grid-cols-4 gap-1 rounded-md bg-slate-100 p-1">
        {PROFILES.map((p) => {
          const selected = p.id === value
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setValue(p.id)}
              className={`rounded px-2 py-1.5 text-xs font-medium transition ${
                selected
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          )
        })}
      </div>
      {active && <p className="mt-2 text-xs text-slate-500">{active.hint}</p>}
    </div>
  )
}
