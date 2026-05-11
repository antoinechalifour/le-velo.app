type LogoProps = {
  className?: string
  spinning?: boolean
}

export function Logo({ className = '', spinning = false }: LogoProps) {
  const wheelClass = spinning ? 'spin-wheel' : ''
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="velo-spokes"
          patternUnits="userSpaceOnUse"
          width="40"
          height="40"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={i}
              x1="20"
              y1="20"
              x2="20"
              y2="4"
              stroke="currentColor"
              strokeWidth="0.6"
              transform={`rotate(${i * 30} 20 20)`}
            />
          ))}
        </pattern>
      </defs>

      {/* Rear wheel */}
      <g className={wheelClass} style={{ transformOrigin: '20px 56px' }}>
        <circle
          cx="20"
          cy="56"
          r="14"
          stroke="currentColor"
          strokeWidth="2.2"
          fill="none"
        />
        <circle cx="20" cy="56" r="13" fill="url(#velo-spokes)" opacity="0.55" />
        <circle cx="20" cy="56" r="2" fill="currentColor" />
      </g>

      {/* Front wheel */}
      <g className={wheelClass} style={{ transformOrigin: '60px 56px' }}>
        <circle
          cx="60"
          cy="56"
          r="14"
          stroke="currentColor"
          strokeWidth="2.2"
          fill="none"
        />
        <circle cx="60" cy="56" r="13" fill="url(#velo-spokes)" opacity="0.55" />
        <circle cx="60" cy="56" r="2" fill="currentColor" />
      </g>

      {/* Frame — main diamond */}
      <path
        d="M20 56 L36 28 L54 28 L60 56"
        stroke="var(--color-rust)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M36 28 L60 56"
        stroke="var(--color-rust)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M44 56 L36 28"
        stroke="var(--color-rust)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Seat post + saddle */}
      <path
        d="M44 56 L40 24"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M34 22 L46 22"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Handlebar — drop bar */}
      <path
        d="M54 28 L62 22 Q66 20 64 26"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="44" cy="56" r="2.4" fill="currentColor" />
    </svg>
  )
}
