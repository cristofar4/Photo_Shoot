import { Img } from '../components/Img'
import { site } from '../config/site'
import type { BookPage } from './pages'

export type Side = 'left' | 'right'

type Props = {
  page: BookPage | null
  side: Side
  number: number
  total: number
  /** When provided, photographs become buttons that enlarge the image. */
  onEnlarge?: (number: number) => void
  onBook?: () => void
  interactive?: boolean
}

/** The printed content of one page of the album. */
export function PageFace({ page, side, number, total, onEnlarge, onBook, interactive = false }: Props) {
  if (!page) return null
  const isCover = page.kind === 'cover' || page.kind === 'backcover'
  const gutter =
    side === 'left'
      ? 'linear-gradient(to left, rgb(60 40 20 / 0.28), rgb(60 40 20 / 0.06) 7%, transparent 16%)'
      : 'linear-gradient(to right, rgb(60 40 20 / 0.28), rgb(60 40 20 / 0.06) 7%, transparent 16%)'
  const coverGutter =
    side === 'left' ? 'linear-gradient(to left, rgb(0 0 0 / 0.5), transparent 9%)' : 'linear-gradient(to right, rgb(0 0 0 / 0.5), transparent 9%)'

  return (
    <div
      className={`absolute inset-0 overflow-hidden [container-type:size] ${isCover ? 'bg-[#211d1a] text-ivory' : 'paper-grain bg-[#fbf8f1] text-ink'}`}
      style={{ borderRadius: side === 'left' ? '10px 3px 3px 10px' : '3px 10px 10px 3px' }}
    >
      <Content page={page} side={side} number={number} total={total} onEnlarge={onEnlarge} onBook={onBook} interactive={interactive} />
      <div className="pointer-events-none absolute inset-0" style={{ background: isCover ? coverGutter : gutter }} />
    </div>
  )
}

function Folio({ number, total, side }: { number: number; total: number; side: Side }) {
  return (
    <p
      className={`absolute bottom-[3.2cqh] font-sans text-[max(9px,1.9cqw)] font-semibold tracking-[0.25em] text-muted ${side === 'left' ? 'left-[7cqw]' : 'right-[7cqw]'}`}
    >
      {String(number).padStart(2, '0')} <span className="text-line">/</span> {String(total).padStart(2, '0')}
    </p>
  )
}

function Content({ page, side, number, total, onEnlarge, onBook, interactive }: Props & { page: BookPage }) {
  switch (page.kind) {
    case 'cover':
      return (
        <div className="absolute inset-[5cqw] flex flex-col items-center justify-between rounded-[4px] border border-[#c9a27a]/40 py-[9cqh] text-center">
          <p className="font-serif text-[max(11px,4.2cqw)] uppercase tracking-[0.3em] text-[#e9d2b4]">{site.name}</p>
          <div>
            <span className="mx-auto mb-[5cqh] block h-[14cqw] w-[14cqw] rounded-full border border-[#c9a27a]/60 p-[2.4cqw]">
              <span className="block h-full w-full rounded-full bg-ember" />
            </span>
            <p className="display text-[max(22px,11cqw)] leading-[0.95]">A collection of moments.</p>
          </div>
          <p className="font-sans text-[max(8px,1.9cqw)] font-semibold uppercase tracking-[0.35em] text-ivory/70">Weddings · Portraits · Lifestyle</p>
        </div>
      )
    case 'backcover':
      return (
        <div className="absolute inset-0 grid place-items-center">
          <p className="font-serif text-[max(11px,4cqw)] uppercase tracking-[0.3em] text-[#e9d2b4]/80">{site.name}</p>
        </div>
      )
    case 'endpaper':
      return (
        <div className="absolute inset-0 bg-[#efe6d6]">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 30%, rgb(198 83 19 / 0.12) 0 18%, transparent 19%), radial-gradient(circle at 75% 70%, rgb(198 83 19 / 0.1) 0 22%, transparent 23%), repeating-linear-gradient(135deg, rgb(25 25 25 / 0.04) 0 1px, transparent 1px 9px)',
            }}
          />
          <div className="absolute inset-0 grid place-items-center p-[10cqw] text-center">
            <p className="font-serif text-[max(14px,6cqw)] italic leading-tight text-ink/75">
              {page.side === 'front' ? 'Moments worth keeping.' : 'Until the next chapter.'}
            </p>
          </div>
        </div>
      )
    case 'chapter':
      return (
        <div className="absolute inset-0 flex flex-col justify-between p-[9cqw]">
          <p className="font-sans text-[max(9px,2.1cqw)] font-semibold uppercase tracking-[0.3em] text-ember-deep">Chapter {page.number}</p>
          <div>
            <p className="display text-[max(60px,34cqw)] leading-none text-ember/90">{page.number}</p>
            <h3 className="display mt-[3cqh] text-[max(24px,11cqw)]">{page.title}</h3>
            <p className="mt-[3cqh] max-w-[80%] text-[max(11px,3.3cqw)] leading-relaxed text-muted">{page.line}</p>
          </div>
          <p className="font-sans text-[max(9px,2cqw)] font-semibold uppercase tracking-[0.3em] text-muted">
            {page.count} photographs <span className="text-ember">·</span> turn the page
          </p>
          <Folio number={number} total={total} side={side} />
        </div>
      )
    case 'photo': {
      return (
        <div className="absolute inset-0 flex flex-col p-[7cqw] pb-[11cqh]">
          <div className="relative flex flex-1 items-center justify-center">
            <PhotoMount page={page} number={number} onEnlarge={onEnlarge} interactive={interactive} />
          </div>
          <p className={`mt-[3cqh] font-serif text-[max(13px,4.4cqw)] italic text-ink/80 ${side === 'left' ? 'text-left' : 'text-right'}`}>{page.caption}</p>
          {page.photo.credit && (
            <p className={`mt-[0.6cqh] font-sans text-[max(8px,1.7cqw)] tracking-[0.12em] text-muted ${side === 'left' ? 'text-left' : 'text-right'}`}>
              Photo {page.photo.credit}
            </p>
          )}
          <Folio number={number} total={total} side={side} />
        </div>
      )
    }
    case 'end':
      return (
        <div className="absolute inset-0 flex flex-col justify-center gap-[4cqh] p-[10cqw]">
          <span className="block h-[2px] w-[12cqw] bg-ember" />
          <h3 className="display text-[max(26px,11cqw)]">Let’s create something timeless.</h3>
          <p className="text-[max(11px,3.3cqw)] leading-relaxed text-muted">Your story could be the next chapter in this album.</p>
          {interactive && onBook && (
            <button
              type="button"
              onClick={onBook}
              className="self-start rounded-full bg-ember px-[5cqw] py-[2.4cqh] font-sans text-[max(10px,2.2cqw)] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-ink active:scale-95"
            >
              Book a session
            </button>
          )}
          <Folio number={number} total={total} side={side} />
        </div>
      )
  }
}

function PhotoMount({
  page,
  number,
  onEnlarge,
  interactive,
}: {
  page: Extract<BookPage, { kind: 'photo' }>
  number: number
  onEnlarge?: (n: number) => void
  interactive?: boolean
}) {
  const img = (
    <Img
      photo={page.photo}
      sizes="(min-width: 1024px) 40vw, 90vw"
      className="h-auto max-h-full w-auto max-w-full bg-sand shadow-[0_1px_2px_rgb(0_0_0/0.18),0_12px_26px_-12px_rgb(60_40_20/0.5)] transition-transform duration-500 group-hover/photo:scale-[1.012]"
    />
  )
  if (!interactive || !onEnlarge) return <span className="absolute inset-0 flex items-center justify-center">{img}</span>
  return (
    <button
      type="button"
      data-photo
      onClick={() => onEnlarge(number - 1)}
      aria-label={`Enlarge photograph: ${page.caption}`}
      className="group/photo absolute inset-0 flex cursor-zoom-in items-center justify-center"
    >
      {img}
    </button>
  )
}
