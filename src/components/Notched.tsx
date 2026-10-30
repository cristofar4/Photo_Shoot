import type { CSSProperties, ReactNode } from 'react'
import { useElementSize } from '../lib/hooks'
import { notchPath, type NotchOptions } from '../lib/notch'

type Common = NotchOptions & { className?: string; style?: CSSProperties; children?: ReactNode }

/**
 * A card surface with a curved recess. The outline is an SVG path so the
 * border follows the curve; `slot` renders centred inside the recess.
 */
export function NotchedSurface({
  className = '',
  style,
  children,
  fill = 'var(--color-paper)',
  stroke = 'var(--color-line)',
  slot,
  slotInset = 0,
  ...notch
}: Common & { fill?: string; stroke?: string; slot?: ReactNode; slotInset?: number }) {
  const [ref, { w, h }] = useElementSize<HTMLDivElement>()
  const d = w > 0 ? notchPath(w, h, notch) : ''
  const pos: CSSProperties = {
    width: notch.nw - slotInset,
    height: notch.nh - slotInset,
    [notch.corner.includes('b') ? 'bottom' : 'top']: 0,
    [notch.corner.includes('r') ? 'right' : 'left']: 0,
  }
  return (
    <div ref={ref} className={`relative isolate ${className}`} style={style}>
      {d && (
        <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible" aria-hidden>
          <path d={d} fill={fill} stroke={stroke} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      {children}
      {slot && (
        <div className="absolute z-10 grid place-items-center" style={pos}>
          {slot}
        </div>
      )}
    </div>
  )
}

/** Clips its children (usually an <Img>) to the same notched shape. */
export function NotchedMedia({ className = '', style, children, ...notch }: Common) {
  const [ref, { w, h }] = useElementSize<HTMLDivElement>()
  const clip = w > 0 ? `path('${notchPath(w, h, notch)}')` : undefined
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ clipPath: clip, WebkitClipPath: clip, borderRadius: clip ? undefined : notch.radius, ...style }}
    >
      {children}
    </div>
  )
}
