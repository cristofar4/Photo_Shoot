import type { CSSProperties } from 'react'
import { imgUrl, type Photo } from '../config/media'
import { site } from '../config/site'

type Props = {
  photo: Photo
  sizes?: string
  className?: string
  style?: CSSProperties
  /** Above the fold images load eagerly with high priority. */
  priority?: boolean
  draggable?: boolean
  badge?: boolean
}

/** Responsive photo with reserved dimensions to prevent layout shift. */
export function Img({ photo, sizes = '100vw', className = '', style, priority, draggable = false, badge = true }: Props) {
  const widths = photo.widths
  const fallback = widths.find((w) => w >= 960) ?? widths[widths.length - 1]
  return (
    <>
      <img
        src={imgUrl(photo, fallback)}
        srcSet={widths.map((w) => `${imgUrl(photo, w)} ${w}w`).join(', ')}
        sizes={sizes}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        draggable={draggable}
        className={className}
        style={{ objectPosition: photo.focus, ...style }}
      />
      {badge && photo.demo && site.showDemoBadges && <DemoBadge />}
    </>
  )
}

export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`pointer-events-none absolute left-3 top-3 z-[2] rounded-full bg-ink/70 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ivory backdrop-blur-sm ${className}`}
    >
      Sample image
    </span>
  )
}
