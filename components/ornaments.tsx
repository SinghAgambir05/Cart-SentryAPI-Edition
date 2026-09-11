export function LaurelIcon({ className = "", color = "var(--gold)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke={color} strokeWidth="1.4" strokeLinecap="round">
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={`l-${i}`}
            d={`M 58 ${10 + i * 9} C 42 ${8 + i * 9}, 28 ${14 + i * 9}, ${16 + i * 2} ${20 + i * 8}`}
          />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={`r-${i}`}
            d={`M 62 ${10 + i * 9} C 78 ${8 + i * 9}, 92 ${14 + i * 9}, ${104 - i * 2} ${20 + i * 8}`}
          />
        ))}
      </g>
      <path d="M 60 6 L 60 54" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export function MeanderRule({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 12"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="meander" width="20" height="12" patternUnits="userSpaceOnUse">
          <path
            d="M0 2 H8 V8 H14 V2 H20"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.3"
          />
        </pattern>
      </defs>
      <rect width="200" height="12" fill="url(#meander)" />
    </svg>
  );
}

export function ColumnMotif({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* capital */}
      <rect x="6" y="8" width="48" height="10" rx="1" fill="var(--gold-pale)" />
      <rect x="14" y="18" width="32" height="8" rx="1" fill="var(--gold-pale)" />
      {/* fluted shaft */}
      <g stroke="var(--marble-vein)" strokeWidth="1">
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={i} x1={20 + i * 4} y1="30" x2={20 + i * 4} y2="228" />
        ))}
      </g>
      <rect x="16" y="26" width="28" height="206" fill="none" stroke="var(--gold-pale)" strokeWidth="1.5" />
      {/* base */}
      <rect x="10" y="232" width="40" height="8" rx="1" fill="var(--gold-pale)" />
      <rect x="4" y="240" width="52" height="10" rx="1" fill="var(--gold-pale)" />
    </svg>
  );
}

export function ScrollDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--gold)]" />
      <LaurelIcon className="h-4 w-10 rotate-180" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--gold)]" />
    </div>
  );
}
