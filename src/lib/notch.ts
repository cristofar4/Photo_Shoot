export type Corner = 'tl' | 'tr' | 'bl' | 'br'

export type NotchOptions = {
  /** Which corner the recess is cut into. */
  corner: Corner
  /** Recess width and height in px. */
  nw: number
  nh: number
  /** Radius of the shape's ordinary corners. */
  radius: number
  /** Radius of the two convex shoulders either side of the recess. */
  outer?: number
  /** Radius of the concave pocket inside the recess. */
  inner?: number
}

/**
 * SVG path for a rounded rectangle with a curved recess cut into one corner.
 * The same string drives the card outline (SVG) and image masks (clip-path),
 * so borders and photographs follow exactly the same curve.
 */
export function notchPath(w: number, h: number, o: NotchOptions): string {
  const nw = Math.min(o.nw, w - 2)
  const nh = Math.min(o.nh, h - 2)
  const R = Math.max(0, Math.min(o.radius, (w - nw) / 2, (h - nh) / 2))
  const a = Math.max(0, Math.min(o.outer ?? 18, nh / 2, nw / 2, R))
  const b = Math.max(0, Math.min(o.inner ?? Math.min(nw, nh) / 2, nw - a, nh - a))

  const flipX = o.corner === 'bl' || o.corner === 'tl'
  const flipY = o.corner === 'tr' || o.corner === 'tl'
  const X = (x: number) => +(flipX ? w - x : x).toFixed(2)
  const Y = (y: number) => +(flipY ? h - y : y).toFixed(2)
  const sweep = (s: 0 | 1) => (flipX !== flipY ? 1 - s : s)
  const L = (x: number, y: number) => `L${X(x)} ${Y(y)}`
  const A = (r: number, s: 0 | 1, x: number, y: number) => `A${r} ${r} 0 0 ${sweep(s)} ${X(x)} ${Y(y)}`

  // Drawn for a bottom right recess, then mirrored for other corners.
  return [
    `M${X(R)} ${Y(0)}`,
    L(w - R, 0),
    A(R, 1, w, R),
    L(w, h - nh - a),
    A(a, 1, w - a, h - nh),
    L(w - nw + b, h - nh),
    A(b, 0, w - nw, h - nh + b),
    L(w - nw, h - a),
    A(a, 1, w - nw - a, h),
    L(R, h),
    A(R, 1, 0, h - R),
    L(0, R),
    A(R, 1, R, 0),
    'Z',
  ].join(' ')
}
