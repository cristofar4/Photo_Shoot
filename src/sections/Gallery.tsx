import { AnimatePresence, LayoutGroup, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { CircleButton, PillButton } from '../components/Buttons'
import { Book } from '../components/Icons'
import { Img } from '../components/Img'
import { NotchedMedia, NotchedSurface } from '../components/Notched'
import { SectionHeading } from '../components/Reveal'
import { chapterById, chapters, type Chapter, type ChapterId } from '../config/gallery'
import { sectionMedia } from '../config/media'
import { preloadBook, type OpenGallery } from '../lib/gallery-events'
import { useMediaQuery } from '../lib/hooks'

type Filter = 'all' | ChapterId
const filters: { id: Filter; label: string; count: number }[] = [
  { id: 'all', label: 'All', count: chapters.reduce((n, c) => n + c.photos.length, 0) },
  ...chapters.map((c) => ({ id: c.id, label: c.id[0].toUpperCase() + c.id.slice(1), count: c.photos.length })),
]

export function Gallery({ onOpen }: { onOpen: OpenGallery }) {
  const [filter, setFilter] = useState<Filter>('all')
  const reduce = useReducedMotion()
  const desktop = useMediaQuery('(min-width: 1024px)')
  const stack = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: stack, offset: ['start start', 'end end'] })
  const visible = chapters.filter((c) => filter === 'all' || c.id === filter)
  const stacking = filter === 'all' && desktop && !reduce

  return (
    <section id="work" aria-labelledby="gallery-title" className="pb-24 md:pb-36">
      <div className="shell">
        <SectionHeading
          id="gallery-title"
          eyebrow="The gallery"
          title="A collection of moments."
          intro="Explore the people, places and feelings that make life extraordinary. Open any collection to flip through it like a book."
          aside={
            <LayoutGroup id="filters">
              <div role="group" aria-label="Filter collections" className="flex flex-wrap gap-1 rounded-full bg-clay/70 p-1.5">
                {filters.map((f) => {
                  const active = filter === f.id
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilter(f.id)}
                      className={`relative flex h-11 items-center gap-2 rounded-full px-5 font-serif text-lg transition-colors duration-300 active:scale-95 ${active ? 'text-ivory' : 'text-ink/75 hover:text-ink'}`}
                    >
                      {active && (
                        <motion.span
                          layoutId="filter-pill"
                          className="absolute inset-0 rounded-full bg-ink shadow-[0_10px_24px_-12px_rgb(25_25_25/0.7)]"
                          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative">{f.label}</span>
                      <span className={`relative font-sans text-[0.62rem] font-semibold ${active ? 'text-ember' : 'text-muted'}`}>{f.count}</span>
                    </button>
                  )
                })}
              </div>
            </LayoutGroup>
          }
        />

        <div ref={stack} className="relative mt-14 md:mt-20" onPointerEnter={() => void preloadBook()}>
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((c, i) => (
              <motion.div
                key={c.id}
                layout={!reduce && !stacking}
                className={`${stacking ? 'sticky mb-[14vh] last:mb-0' : 'mb-6 md:mb-8'}`}
                style={stacking ? { top: `calc(6.5rem + ${i * 1.4}rem)` } : undefined}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <StackScale progress={scrollYProgress} index={i} count={visible.length} enabled={stacking}>
                  {c.id === 'weddings' && <WeddingCard onOpen={onOpen} />}
                  {c.id === 'portraits' && <PortraitCard onOpen={onOpen} />}
                  {c.id === 'lifestyle' && <LifestyleCard onOpen={onOpen} />}
                </StackScale>
              </motion.div>
            ))}
            {filter !== 'all' && (
              <motion.div key={`strip-${filter}`} layout={!reduce} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
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

/** Earlier cards settle back slightly as later ones slide over them. */
function StackScale({ progress, index, count, enabled, children }: { progress: MotionValue<number>; index: number; count: number; enabled: boolean; children: ReactNode }) {
  const target = 1 - (count - 1 - index) * 0.045
  const scale = useTransform(progress, [index / count, 1], [1, target])
  const dim = useTransform(progress, [index / count, 1], [0, (count - 1 - index) * 0.12])
  if (!enabled) return <>{children}</>
  return (
    <motion.div className="relative origin-top" style={{ scale }}>
      {children}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[2.25rem] bg-espresso" style={{ opacity: dim }} />
    </motion.div>
  )
}

function useOpener(onOpen: OpenGallery, chapter: ChapterId) {
  const card = useRef<HTMLDivElement>(null)
  const open = (e: MouseEvent<HTMLElement>, photo?: number) => onOpen({ chapter, photo, from: card.current, trigger: e.currentTarget })
  return { card, open }
}

/** Three photos fanned like prints; they spread on hover and each opens its page. */
function PrintFan({ chapter, onOpen, dark = false }: { chapter: Chapter; onOpen: (e: MouseEvent<HTMLElement>, i: number) => void; dark?: boolean }) {
  const prints = chapter.photos.slice(0, 3)
  return (
    <div className="group/fan flex items-center">
      <ul className="flex">
        {prints.map((p, i) => (
          <li key={p.photo.file} className="-ml-3 first:ml-0" style={{ zIndex: 3 - i }}>
            <button
              type="button"
              onClick={(e) => onOpen(e, i)}
              aria-label={`Open ${p.caption}`}
              className={`block h-16 w-12 overflow-hidden rounded-lg ring-2 transition-transform duration-500 ease-[var(--ease-lux)] hover:-translate-y-2 ${dark ? 'ring-espresso' : 'ring-paper'}`}
              style={{ rotate: `${(i - 1) * 7}deg` }}
            >
              <Img photo={p.photo} sizes="48px" badge={false} className="h-full w-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
      <span className={`ml-4 text-sm ${dark ? 'text-ivory/70' : 'text-muted'}`}>{chapter.photos.length} photographs</span>
    </div>
  )
}

function BigNumber({ n, dark = false }: { n: string; dark?: boolean }) {
  return (
    <span
      aria-hidden
      className="display pointer-events-none select-none text-[clamp(6rem,12vw,11rem)] leading-none text-transparent"
      style={{ WebkitTextStroke: `1px ${dark ? 'rgb(248 245 237 / 0.28)' : 'rgb(198 83 19 / 0.45)'}` }}
    >
      {n}
    </span>
  )
}

function WeddingCard({ onOpen }: { onOpen: OpenGallery }) {
  const { card, open } = useOpener(onOpen, 'weddings')
  const c = chapterById('weddings')
  const wide = useMediaQuery('(min-width: 768px)')
  const notch = wide ? { nw: 132, nh: 132 } : { nw: 104, nh: 104 }
  return (
    <div ref={card} className="group">
      <NotchedSurface
        corner="br"
        radius={36}
        {...notch}
        outer={24}
        className="grid gap-3 p-3 lg:h-[min(76vh,44rem)] lg:grid-cols-[1.45fr_1fr]"
        slot={<CircleButton label="See the wedding collection" onClick={open} size={wide ? 82 : 66} />}
      >
        <button type="button" tabIndex={-1} aria-hidden onClick={open} data-cursor="Open album" className="relative block aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sand lg:aspect-auto">
          <Img photo={sectionMedia.gallery.weddings} sizes="(min-width: 1024px) 58vw, 100vw" className="zoom-media absolute inset-0 h-full w-full object-cover" />
          <span className="absolute bottom-5 left-5 rounded-full bg-paper/90 px-4 py-2 font-serif text-lg italic text-ink backdrop-blur">Chapter one</span>
        </button>
        <div className="relative flex flex-col overflow-hidden px-5 pb-6 pt-6 md:px-9 md:pt-10">
          <div className="flex items-start justify-between">
            <p className="eyebrow text-muted">
              <span className="text-ember-deep">{c.number}</span> <span className="mx-2 text-line">/</span> Weddings
            </p>
            <div className="-mr-2 -mt-6 hidden md:block">
              <BigNumber n={c.number} />
            </div>
          </div>
          <h3 className="display mt-4 text-[clamp(2.8rem,4.8vw,4.6rem)]">{c.title}</h3>
          <p className="mt-5 max-w-xs text-base leading-relaxed text-muted">{c.line}</p>
          <div className="mt-8">
            <PrintFan chapter={c} onOpen={open} />
          </div>
          <p className="mt-auto pt-10 font-serif text-xl" style={{ paddingRight: notch.nw - 10 }} aria-hidden>
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
    <div ref={card} className="group relative grid overflow-hidden rounded-[2.25rem] bg-espresso text-ivory lg:h-[min(76vh,44rem)] lg:grid-cols-[1fr_1.1fr]">
      <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-ember/20 blur-3xl" />
      <div className="relative order-2 flex flex-col p-8 md:p-14 lg:order-1">
        <div className="flex items-start justify-between">
          <p className="eyebrow text-ivory/70">
            Portraits <span className="mx-2 text-ember">/</span> {c.number}
          </p>
          <div className="-mt-6 hidden md:block">
            <BigNumber n={c.number} dark />
          </div>
        </div>
        <h3 className="display mt-auto text-[clamp(3rem,5.6vw,5.2rem)]">{c.title}</h3>
        <p className="mt-5 max-w-sm text-base leading-relaxed text-ivory/80">{c.line}</p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <PillButton tone="light" onClick={open} aria-label="See the portrait collection">
            See gallery
          </PillButton>
          <PrintFan chapter={c} onOpen={open} dark />
        </div>
      </div>
      <div className="relative order-1 px-4 pt-4 lg:order-2 lg:pb-4 lg:pl-0">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={open}
          data-cursor="Open album"
          className="relative block aspect-[4/5] w-full overflow-hidden rounded-[999px_999px_1.75rem_1.75rem] bg-espresso-soft sm:aspect-[4/3] lg:aspect-auto lg:h-full"
        >
          <Img photo={sectionMedia.gallery.portraits} sizes="(min-width: 1024px) 50vw, 100vw" className="zoom-media absolute inset-0 h-full w-full object-cover" />
        </button>
        <span className="absolute right-9 top-12 grid h-16 w-16 place-items-center rounded-full bg-ember font-serif text-2xl text-white shadow-lg lg:right-10 lg:top-16">
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
  const notch = wide ? { nw: 132, nh: 132 } : { nw: 104, nh: 104 }
  return (
    <div ref={card} className="group">
      <NotchedSurface
        corner="br"
        radius={36}
        {...notch}
        outer={24}
        fill="var(--color-clay)"
        stroke="transparent"
        className="flex flex-col p-3 lg:h-[min(76vh,44rem)]"
        slot={<CircleButton label="See the lifestyle collection" onClick={open} tone="ink" size={wide ? 82 : 66} />}
      >
        <button type="button" tabIndex={-1} aria-hidden onClick={open} data-cursor="Open album" className="grid aspect-[4/3] w-full grid-cols-3 gap-1.5 sm:aspect-[21/9] lg:aspect-auto lg:flex-1">
          {sectionMedia.gallery.lifestyle.map((p, i) => (
            <span key={p.file} className={`relative overflow-hidden bg-sand ${i === 0 ? 'rounded-l-[1.75rem]' : ''} ${i === 2 ? 'rounded-r-[1.75rem]' : ''} ${i === 1 ? 'sm:-mt-3' : ''}`}>
              <Img photo={p} sizes="(min-width: 768px) 30vw, 33vw" className="zoom-media absolute inset-0 h-full w-full object-cover" />
            </span>
          ))}
        </button>
        <div
          className="grid gap-5 px-4 pt-7 md:grid-cols-[1.2fr_1fr] md:items-end md:gap-10 md:px-6 md:pb-4"
          style={wide ? { paddingRight: notch.nw + 8 } : { paddingBottom: notch.nh + 4 }}
        >
          <div>
            <p className="eyebrow text-muted">
              Lifestyle <span className="mx-2 text-ember">/</span> <span className="text-ember-deep">{c.number}</span>
            </p>
            <h3 className="display mt-4 text-[clamp(2.6rem,4.6vw,4.2rem)]">{c.title}</h3>
          </div>
          <div className="flex flex-col gap-5">
            <p className="text-sm leading-relaxed text-ink/75">{c.line}</p>
            <PrintFan chapter={c} onOpen={open} />
          </div>
        </div>
      </NotchedSurface>
    </div>
  )
}

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
