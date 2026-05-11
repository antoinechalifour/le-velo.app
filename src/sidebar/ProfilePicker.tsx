import { PROFILES } from '../route/profile'
import { useProfileParam } from '../url/params'

export function ProfilePicker() {
  const [value, setValue] = useProfileParam()
  const active = PROFILES.find((p) => p.id === value)

  return (
    <div className="paper-card rounded-xl p-4">
      <div className="grid grid-cols-4 gap-1.5">
        {PROFILES.map((p, idx) => {
          const selected = p.id === value
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setValue(p.id)}
              className={`focus-ring relative flex flex-col items-center gap-1 overflow-hidden rounded-lg border px-2 py-2.5 transition-colors ${
                selected
                  ? 'border-forest bg-forest text-paper-soft shadow-[0_2px_0_var(--color-forest-deep)]'
                  : 'ink-wash border-ink/15 bg-paper-soft/50 text-ink-soft'
              }`}
            >
              <span
                className={`numeral text-[0.65rem] leading-none ${
                  selected ? 'text-mustard' : 'text-sepia-soft'
                }`}
              >
                Nº 0{idx + 1}
              </span>
              <span className="display-serif text-[0.95rem] font-medium leading-none tracking-tight">
                {p.label}
              </span>
            </button>
          )
        })}
      </div>
      {active && (
        <p className="mt-3 border-t border-ink/10 pt-3 text-[0.78rem] leading-relaxed text-sepia">
          <span className="eyebrow-tight mr-1.5 text-rust">Note</span>
          {active.hint}
        </p>
      )}
    </div>
  )
}
