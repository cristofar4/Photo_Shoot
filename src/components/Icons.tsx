import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
const base = (p: P) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...p,
})

export const ArrowRight = (p: P) => (
  <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)
export const ArrowUpRight = (p: P) => (
  <svg {...base(p)}><path d="M7 17 17 7M8 7h9v9" /></svg>
)
export const ArrowLeft = (p: P) => (
  <svg {...base(p)}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
)
export const ArrowUp = (p: P) => (
  <svg {...base(p)}><path d="M12 19V5M6 11l6-6 6 6" /></svg>
)
export const Play = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
)
export const Pause = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></svg>
)
export const VolumeOff = (p: P) => (
  <svg {...base(p)}><path d="M11 5 6 9H3v6h3l5 4V5ZM16 9l5 6M21 9l-5 6" /></svg>
)
export const VolumeOn = (p: P) => (
  <svg {...base(p)}><path d="M11 5 6 9H3v6h3l5 4V5ZM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>
)
export const Close = (p: P) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
)
export const Plus = (p: P) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
)
export const Expand = (p: P) => (
  <svg {...base(p)}><path d="M15 4h5v5M9 20H4v-5M20 4l-6 6M4 20l6-6" /></svg>
)
export const Camera = (p: P) => (
  <svg {...base(p)}><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2h5.6l1.5 2h2.2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" /><circle cx="12" cy="13" r="3.4" /></svg>
)
export const People = (p: P) => (
  <svg {...base(p)}><circle cx="8" cy="8" r="2.6" /><circle cx="16" cy="8" r="2.6" /><path d="M3.5 18c.6-2.8 2.4-4.4 4.5-4.4s3.9 1.6 4.5 4.4M11.5 18c.6-2.8 2.4-4.4 4.5-4.4s3.9 1.6 4.5 4.4" /></svg>
)
export const Sun = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3.8" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" /></svg>
)
export const Menu = (p: P) => (
  <svg {...base(p)}><path d="M4 8h16M4 16h10" /></svg>
)
export const Check = (p: P) => (
  <svg {...base(p)}><path d="m5 12.5 4.2 4.2L19 7" /></svg>
)
export const Spinner = (p: P) => (
  <svg {...base(p)} className={`animate-spin ${p.className ?? ''}`}><path d="M12 3a9 9 0 1 0 9 9" /></svg>
)
export const Book = (p: P) => (
  <svg {...base(p)}><path d="M12 6.5C10 5 7.5 4.5 4 4.8v13c3.5-.3 6 .2 8 1.7 2-1.5 4.5-2 8-1.7v-13c-3.5-.3-6 .2-8 1.7ZM12 6.5v13" /></svg>
)
