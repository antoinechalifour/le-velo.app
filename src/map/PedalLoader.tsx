type PedalLoaderProps = {
  className?: string
}

export function PedalLoader({ className = '' }: PedalLoaderProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="28"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        opacity="0.85"
      />
      {Array.from({ length: 28 }).map((_, i) => {
        const angle = (i * 360) / 28
        return (
          <line
            key={`tooth-${i}`}
            x1="50"
            y1="19.5"
            x2="50"
            y2="22.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            transform={`rotate(${angle} 50 50)`}
          />
        )
      })}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i * 360) / 5
        return (
          <line
            key={`spider-${i}`}
            x1="50"
            y1="50"
            x2="50"
            y2="27"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.4"
            transform={`rotate(${angle} 50 50)`}
          />
        )
      })}

      <g className="pedal-cranks" style={{ transformOrigin: '50px 50px' }}>
        <rect
          x="48.4"
          y="18"
          width="3.2"
          height="32"
          rx="1.6"
          fill="var(--color-rust)"
        />
        <rect
          x="48.4"
          y="50"
          width="3.2"
          height="32"
          rx="1.6"
          fill="var(--color-rust)"
        />
        <g className="pedal-counter" style={{ transformOrigin: '50px 18px' }}>
          <rect
            x="41"
            y="14.5"
            width="18"
            height="7"
            rx="1.6"
            fill="currentColor"
          />
          <rect
            x="43"
            y="16.5"
            width="14"
            height="3"
            rx="1"
            fill="var(--color-paper-soft)"
            opacity="0.55"
          />
        </g>
        <g className="pedal-counter" style={{ transformOrigin: '50px 82px' }}>
          <rect
            x="41"
            y="78.5"
            width="18"
            height="7"
            rx="1.6"
            fill="currentColor"
          />
          <rect
            x="43"
            y="80.5"
            width="14"
            height="3"
            rx="1"
            fill="var(--color-paper-soft)"
            opacity="0.55"
          />
        </g>
        <circle
          cx="50"
          cy="50"
          r="3.2"
          fill="var(--color-paper-soft)"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </g>
    </svg>
  )
}
