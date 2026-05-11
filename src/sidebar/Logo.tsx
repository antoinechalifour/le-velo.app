export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <circle cx="16" cy="44" r="12" stroke="#16a34a" strokeWidth="4" />
      <circle cx="48" cy="44" r="12" stroke="#16a34a" strokeWidth="4" />
      <path
        d="M16 44 L29 22 L33 44 Z"
        stroke="#0f172a"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M29 22 L45 22 L33 44"
        stroke="#0f172a"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M45 22 L48 44"
        stroke="#0f172a"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M24 22 L33 22"
        stroke="#0f172a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M42 22 L50 20"
        stroke="#0f172a"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
