const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  )
}

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" {...iconProps}>
      <path d="M4 10h11M10.5 5.5 15 10l-4.5 4.5" />
    </svg>
  )
}

export function ExternalIcon() {
  return (
    <svg viewBox="0 0 20 20" {...iconProps}>
      <path d="M7 5H5.8A1.8 1.8 0 0 0 4 6.8v7.4A1.8 1.8 0 0 0 5.8 16h7.4a1.8 1.8 0 0 0 1.8-1.8V13" />
      <path d="M10 4h6v6M16 4l-7.5 7.5" />
    </svg>
  )
}

export function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 7 8 5-8 5V7Z" fill="currentColor" />
    </svg>
  )
}

export function MenuIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 8h16" />
          <path d="M4 16h16" />
        </>
      )}
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" {...iconProps}>
      <path d="m4 10 4 4 8-9" />
    </svg>
  )
}

export function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.8 12h16.4M12 3.5c2.2 2.3 3.4 5.1 3.4 8.5S14.2 18.2 12 20.5M12 3.5C9.8 5.8 8.6 8.6 8.6 12s1.2 6.2 3.4 8.5" />
    </svg>
  )
}

export function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <path d="M5 7h11M5 12h8M5 17h5" />
      <path d="m17 14 2.5 3L22 14M19.5 17V7" />
    </svg>
  )
}

export function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" {...iconProps}>
      <path d="m6.5 8 3.5 3.5L13.5 8" />
    </svg>
  )
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function PlatformIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="m10 9 5 3-5 3V9Z" />
    </svg>
  )
}

export function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <path d="M12 4v11M7.5 11.5 12 16l4.5-4.5M5 20h14" />
    </svg>
  )
}

export function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  )
}

export function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps}>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" strokeWidth="2.8" />
    </svg>
  )
}

export function PageArrowIcon({ direction = 'next' }) {
  return (
    <svg viewBox="0 0 20 20" {...iconProps} style={direction === 'previous' ? { transform: 'rotate(180deg)' } : undefined}>
      <path d="m7 5 5 5-5 5" />
    </svg>
  )
}
