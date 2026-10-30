import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type MouseEvent } from 'react'
import { CircleButton, PillButton } from '../components/Buttons'
import { Book } from '../components/Icons'
import { Img } from '../components/Img'
import { NotchedMedia, NotchedSurface } from '../components/Notched'
import { Reveal, SectionHeading } from '../components/Reveal'
import { chapterById, chapters, type ChapterId } from '../config/gallery'
import { sectionMedia } from '../config/media'
import { preloadBook, type OpenGallery } from '../lib/gallery-events'
import { useMediaQuery } from '../lib/hooks'

type Filter = 'all' | ChapterId
const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'weddings', label: 'Weddings' },
  { id: 'portraits', label: 'Portraits' },
  { id: 'lifestyle', label: 'Lifestyle' },
]

export function Gallery({ onOpen }: { onOpen: OpenGallery }) {
  const [filter, setFilter] = useState<Filter>('all')
  const reduce = useReducedMotion()
  const visible = chapters.filter((c) => filter === 'all' || c.id === filter)

  return (
    <section id="work" aria-labelledby="gallery-title" className="py-24 md:py-36">
      <div className="shell">
        <SectionHeading
          id="gallery-title"
          eyebrow="The gallery"
          title="A collection of moments."
          intro="Explore the people, places and feelings that make life extraordinary."
        />

        <Reveal delay={0.05} className="mt-10">
          <LayoutGroup id="filters">
            <div role="group" aria-label="Filter collections" className="flex flex-wrap gap-2.5">
              {filters.map((f) => {
                const active = filter === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(f.id)}
                    className={`relative h-11 min-w-[6.5rem] rounded-full px-6 font-serif text-lg transition-colors duration-300 active:scale-95 ${
                      active ? 'text-white' : 'text-ink ring-1 ring-inset ring-line hover:ring-ink/40'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="filter-pill"
                        className="absolute inset-0 rounded-full bg-ember"
                        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative">{f.label}</span>
                  </button>
                )
              })}
            </div>
          </LayoutGroup>
        </Reveal>

        <div className="mt-10 flex flex-col gap-6 md:gap-8" onPointerEnter={() => void preloadBook()}>
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((c) => (
              <motion.div
                key={c.id}
                layout={!reduce}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {c.id === 'weddings' && <WeddingCard onOpen={onOpen} />}
                {c.id === 'portraits' && <PortraitCard onOpen={onOpen} />}
                {c.id === 'lifestyle' && <LifestyleCard onOpen={onOpen} />}
              </motion.div>
            ))}
            {filter !== 'all' && (
              <motion.div
                key={`strip-${filter}`}
                layout={!reduce}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <ChapterStrip chapter={filter} onOpen={onOpen} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="eyebrow mt-14 flex items-center justify-center gap-6 text-center text-muted">
          <span className="hidden h-px w-24 bg-line sm:block" />
          Choose a collection. Flip through its story.
          <span className="hidden h-px w-24 bg-line sm:block" />
        </p>
      </div>
    </section>
  )
}

/** Helper: opens the book, growing out of the card that holds `e.currentTarget`. */
function useOpener(onOpen: OpenGallery, chapter: ChapterId) {
  const card = useRef<HTMLDivElement>(null)
  const open = (e: MouseEvent<HTMLElement>, photo?: number) =>
    onOpen({ chapter, photo, from: card.current, trigger: e.currentTarget })
  return { card, open }
}

function WeddingCard({ onOpen }: { onOpen: OpenGallery }) {
  const { card, open } = useOpener(onOpen, 'weddings')
  const c = chapterById('weddings')
  const wide = useMediaQuery('(min-width: 768px)')
  const notch = wide ? { nw: 124, nh: 116 } : { nw: 104, nh: 98 }
  return (
    <div ref={card} className="group relative pb-2">
      <span aria-hidden className="absolute inset-x-8 bottom-0 h-6 rounded-b-[2rem] bg-ember" />
      <NotchedSurface
        corner="br"
        radius={32}
        {...notch}
        outer={22}
        className="grid gap-2 p-3 md:grid-cols-[1.5fr_1fr]"
        slot={<CircleButton label="See the wedding collection" diagonal={false} onClick={open} size={wide ? 76 : 64} />}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={open}
          className="relative block aspect-[16/10] cursor-zoom-in overflow-hidden rounded-[1.5rem] bg-sand md:aspect-auto md:min-h-[26rem]"
        >
          <Img photo={sectionMedia.gallery.weddings} sizes="(min-width: 768px) 60vw, 100vw" className="zoom-media absolute inset-0 h-full w-full object-cover" />
        </button>
        <div className="flex flex-col px-5 pb-6 pt-6 md:px-8 md:pt-10">
          <p className="eyebrow text-muted">
            <span className="text-ember-deep">{c.number}</span> <span className="mx-2 text-line">/</span> Weddings
          </p>
          <h3 className="display mt-5 text-[clamp(2.6rem,4.6vw,4rem)]">{c.title}</h3>
          <p className="mt-5 max-w-xs text-base leading-relaxed text-muted">{c.line}</p>
          <span className="mt-8 block h-px w-2/3 bg-line" />
          <p className="mt-auto pr-24 pt-10 text-right font-serif text-xl md:pr-28" aria-hidden>
            See gallery
          </p>
        </div>
      </NotchedSurface>
    </div>
  )
}

function PortraitCard({ onOpen }: { onOpen: OpenGallery }) {
  const { card, open } = useOpener(onOpen, 'portraits')
  const c = chapterById('portraits')
  return (
    <div ref={card} className="group grid overflow-hidden rounded-[2rem] bg-ink text-ivory md:grid-cols-[1fr_1.05fr]">
      <div className="order-2 flex flex-col justify-center p-8 md:order-1 md:p-14">
        <p className="eyebrow text-ivory/70">
          Portraits <span className="mx-2 text-ember">/</span> {c.number}
        </p>
        <h3 className="display mt-5 text-[clamp(2.8rem,5.4vw,4.6rem)]">{c.title}</h3>
        <p className="mt-5 max-w-sm text-base leading-relaxed text-ivory/80">{c.line}</p>
        <div className="mt-9">
          <PillButton tone="light" onClick={open} aria-label="See the portrait collection">
            See gallery
          </PillButton>
        </div>
      </div>
      <div className="relative order-1 px-4 pt-4 md:order-2 md:pb-4 md:pl-0">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={open}
          className="relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-[999px_999px_1.5rem_1.5rem] bg-ink-soft md:aspect-auto md:h-full md:min-h-[30rem]"
        >
          <Img photo={sectionMedia.gallery.portraits} sizes="(min-width: 768px) 50vw, 100vw" className="zoom-media absolute inset-0 h-full w-full object-cover" />
        </button>
        <span className="absolute right-8 top-10 grid h-14 w-14 place-items-center rounded-full bg-ember font-serif text-2xl text-white shadow-lg md:right-10 md:top-14">
          {c.number}
        </span>
      </div>
    </div>
  )
}

function LifestyleCard({ onOpen }: { onOpen: OpenGallery }) {
  const { card, open } = useOpener(onOpen, 'lifestyle')
  const c = chapterById('lifestyle')
  const wide = useMediaQuery('(min-width: 768px)')
  const notch = wide ? { nw: 124, nh: 124 } : { nw: 100, nh: 100 }
  return (
    <div ref={card} className="group">
      <NotchedSurface
        corner="br"
        radius={32}
        {...notch}
        outer={22}
        className="p-3"
        slot={<CircleButton label="See the lifestyle collection" diagonal={false} onClick={open} size={wide ? 76 : 62} />}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={open}
          className="grid aspect-[4/3] w-full cursor-zoom-in grid-cols-3 gap-1.5 overflow-hidden rounded-[1.5rem] sm:aspect-[21/8]"
        >
          {sectionMedia.gallery.lifestyle.map((p, i) => (
            <span key={p.file} className={`relative overflow-hidden bg-sand ${i === 0 ? 'rounded-l-[1.5rem]' : ''} ${i === 2 ? 'rounded-r-[1.5rem]' : ''}`}>
              <Img photo={p} sizes="(min-width: 768px) 30vw, 33vw" className="zoom-media absolute inset-0 h-full w-full object-cover" />
            </span>
          ))}
        </button>
        <div
          className="grid gap-5 px-4 pt-7 md:grid-cols-[1.3fr_1fr_auto] md:items-center md:gap-10 md:px-6 md:pb-5"
          style={wide ? { paddingRight: notch.nw + 8 } : { paddingBottom: notch.nh + 4 }}
        >
          <div>
            <p className="eyebrow text-muted">
              Lifestyle <span className="mx-2 text-line">/</span> <span className="text-ember-deep">{c.number}</span>
            </p>
            <h3 className="display mt-4 text-[clamp(2.4rem,4.4vw,3.8rem)]">{c.title}</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted md:border-l md:border-line md:pl-8">{c.line}</p>
          <p className="hidden font-serif text-xl md:block" aria-hidden>
            See gallery
          </p>
        </div>
      </NotchedSurface>
    </div>
  )
}

/** Shown under a filtered collection: every photo, each opening the book at that page. */
function ChapterStrip({ chapter, onOpen }: { chapter: ChapterId; onOpen: OpenGallery }) {
  const c = chapterById(chapter)
  return (
    <div>
      <p className="eyebrow mb-5 text-muted">Inside this chapter · {c.photos.length} photographs</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {c.photos.map((p, i) => (
          <li key={p.photo.file}>
            <button
              type="button"
              onClick={(e) => onOpen({ chapter, photo: i, from: e.currentTarget, trigger: e.currentTarget })}
              className="group block w-full text-left"
              aria-label={`Open ${p.caption} in the album`}
            >
              <span className="relative block">
                <NotchedMedia corner="br" radius={20} nw={50} nh={50} outer={12} className="aspect-[4/5] bg-sand">
                  <Img photo={p.photo} sizes="(min-width: 1024px) 18vw, 45vw" className="zoom-media absolute inset-0 h-full w-full object-cover" />
                </NotchedMedia>
                <span className="absolute bottom-0 right-0 grid h-[50px] w-[50px] place-items-center">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-ivory transition-colors duration-300 group-hover:bg-ember">
                    <Book width={16} height={16} />
                  </span>
                </span>
              </span>
              <span className="mt-3 flex items-center justify-between gap-2 text-sm text-ink">
                <span className="font-serif text-lg">{p.caption}</span>
                <span className="eyebrow text-ember-deep">{String(i + 1).padStart(2, '0')}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
