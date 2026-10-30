import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight, Close } from '../components/Icons'
import { Img } from '../components/Img'
import { chapters } from '../config/gallery'
import { imgUrl } from '../config/media'
import type { OpenGalleryRequest } from '../lib/gallery-events'
import { useElementSize } from '../lib/hooks'
import { useFocusTrap, useInertBackground, useScrollLock } from '../lib/overlay'
import { BirdFlight } from './BirdFlight'
import { Leaf } from './Leaf'
import { PageFace } from './PageFace'
import { buildPages, chapterAt, leftOf, pageIndexOf, rightOf, spreadCount, spreadOfPage, type BookPage } from './pages'

type Props = {
  request: OpenGalleryRequest
  onClosed: () => void
  onBook: () => void
}

type Turn = { from: number; to: number; dir: 1 | -1 }
type Phase = 'enter' | 'open' | 'bird' | 'fade'

const PAGE_RATIO = 0.72
const TURN_EASE = [0.42, 0.02, 0.22, 1] as const
const supports3d = () => typeof CSS !== 'undefined' && CSS.supports('transform-style', 'preserve-3d')

/**
 * Fullscreen album. Grows out of the gallery card that opened it, opens its
 * cover, then lets visitors turn pages by dragging, swiping, wheel, keys,
 * buttons, chapter tabs or thumbnails. Closing folds it into a bird.
 */
export default function BookOverlay({ request, onClosed, onBook }: Props) {
  const reduceMotion = useReducedMotion()
  const simple = !!reduceMotion || !supports3d()
  const pages = useMemo(buildPages, [])
  const n = pages.length

  const root = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const [stageRef, stage] = useElementSize<HTMLDivElement>()
  const bookRef = useRef<HTMLDivElement>(null)

  const [phase, setPhase] = useState<Phase>('enter')
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [bird, setBird] = useState<null | { rect: DOMRect; left: BookPage | null; right: BookPage | null; li: number; ri: number }>(null)

  useScrollLock(true)
  useInertBackground(true)
  useFocusTrap(root, true, { initial: closeBtn, returnTo: request.trigger })

  /* Layout ---------------------------------------------------------------- */
  const double = stage.w >= 760 && stage.h >= 340
  const pageW = Math.max(
    120,
    Math.floor(double ? Math.min((stage.w - 24) / 2, stage.h * PAGE_RATIO) : Math.min(stage.w - 8, stage.h * PAGE_RATIO)),
  )
  const pageH = Math.round(pageW / PAGE_RATIO)
  const maxPos = double ? spreadCount(n) - 1 : n - 1
  const toPos = useCallback((page: number) => (double ? spreadOfPage(page) : page), [double])

  /* Turning state --------------------------------------------------------- */
  const target = pageIndexOf(pages, request.chapter, request.photo)
  const [pos, setPos] = useState(() => (simple ? (window.innerWidth >= 800 ? spreadOfPage(target) : target) : 0))
  const [turn, setTurn] = useState<Turn | null>(null)
  const progress = useMotionValue(0)
  const posRef = useRef(pos)
  const turnRef = useRef<Turn | null>(null)
  posRef.current = pos
  turnRef.current = turn

  const anchorPage = double ? (rightOf(pos, n) ?? leftOf(pos) ?? 0) : pos
  const anchorRef = useRef(anchorPage)

  // Keep the visitor on the same page when the layout switches between
  // single and double pages (rotation, resize).
  const prevDouble = useRef(double)
  useLayoutEffect(() => {
    if (prevDouble.current === double) {
      anchorRef.current = anchorPage
      return
    }
    prevDouble.current = double
    progress.stop()
    setTurn(null)
    setPos(double ? spreadOfPage(anchorRef.current) : anchorRef.current)
  }, [double, anchorPage, progress])

  const finishTurn = useCallback((to: number) => {
    setPos(to)
    setTurn(null)
  }, [])

  const turnTo = useCallback(
    (to: number, opts: { duration?: number } = {}) => {
      const from = posRef.current
      if (turnRef.current || to === from || to < 0 || to > maxPos) return
      if (simple) {
        setPos(to)
        return
      }
      const dir = to > from ? 1 : -1
      progress.set(dir > 0 ? 0 : 1)
      const t: Turn = { from, to, dir }
      turnRef.current = t
      setTurn(t)
      animate(progress, dir > 0 ? 1 : 0, {
        duration: opts.duration ?? (Math.abs(to - from) > 1 ? 1.05 : 0.9),
        ease: TURN_EASE,
        onComplete: () => finishTurn(to),
      })
    },
    [maxPos, simple, progress, finishTurn],
  )

  const go = useCallback((d: 1 | -1) => turnTo(posRef.current + d), [turnTo])

  /* Opening sequence: card grows into the overlay, then the cover opens. -- */
  const fromRect = useMemo(() => request.from?.getBoundingClientRect() ?? null, [request.from])
  const onEntered = () => {
    if (phase !== 'enter') return
    setPhase('open')
    if (!simple) window.setTimeout(() => turnTo(toPos(target), { duration: 1.15 }), 120)
  }

  /* Closing: fold into a bird and fly away. ------------------------------- */
  const requestClose = useCallback(() => {
    if (phase === 'bird' || phase === 'fade') return
    setLightbox(null)
    if (simple || !bookRef.current) {
      setPhase('fade')
      return
    }
    progress.stop()
    const p = posRef.current
    const li = double ? leftOf(p) : p
    const ri = double ? rightOf(p, n) : p
    setTurn(null)
    setBird({
      rect: bookRef.current.getBoundingClientRect(),
      left: li === null ? (ri === null ? null : pages[ri]) : pages[li],
      right: ri === null ? (li === null ? null : pages[li]) : pages[ri],
      li: li ?? ri ?? 0,
      ri: ri ?? li ?? 0,
    })
    setPhase('bird')
  }, [phase, simple, double, n, pages, progress])

  const bookAndClose = () => {
    requestClose()
    onBook()
  }

  /* Keyboard ---------------------------------------------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'bird' || phase === 'fade') return
      if (e.key === 'Escape') {
        e.preventDefault()
        if (lightbox !== null) setLightbox(null)
        else requestClose()
        return
      }
      if (lightbox !== null) {
        if (e.key === 'ArrowRight') setLightbox((i) => nextPhoto(pages, i!, 1))
        if (e.key === 'ArrowLeft') setLightbox((i) => nextPhoto(pages, i!, -1))
        return
      }
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (['ArrowRight', 'PageDown', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
        go(1)
      } else if (['ArrowLeft', 'PageUp', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        go(-1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        turnTo(toPos(pageIndexOf(pages, chapters[0].id)))
      } else if (e.key === 'End') {
        e.preventDefault()
        turnTo(maxPos)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, lightbox, requestClose, go, turnTo, toPos, pages, maxPos])

  /* Mouse wheel: one page per gesture, ignoring trackpad inertia. --------- */
  useEffect(() => {
    const el = root.current
    if (!el) return
    let acc = 0
    let last = 0
    let busy = false
    const onWheel = (e: WheelEvent) => {
      if (lightbox !== null) return
      const thumbs = (e.target as HTMLElement).closest('[data-thumbs]')
      if (thumbs && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      e.preventDefault()
      const now = performance.now()
      const gap = now - last
      last = now
      if (busy) {
        if (!turnRef.current && gap > 260) busy = false
        else return
      }
      if (gap > 260) acc = 0
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1
      acc += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unit
      if (Math.abs(acc) >= 40) {
        const d = acc > 0 ? 1 : -1
        acc = 0
        busy = true
        go(d)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [lightbox, go])

  /* Drag / swipe ------------------------------------------------------------ */
  const drag = useRef<null | { id: number; x: number; y: number; live: boolean; dir: 0 | 1 | -1; samples: { x: number; t: number }[] }>(null)
  const suppressClick = useRef(false)

  const onPointerDown = (e: RPointerEvent) => {
    if (phase !== 'open' || turnRef.current || e.button !== 0) return
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, live: false, dir: 0, samples: [{ x: e.clientX, t: e.timeStamp }] }
  }

  const onPointerMove = (e: RPointerEvent) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    d.samples.push({ x: e.clientX, t: e.timeStamp })
    if (d.samples.length > 6) d.samples.shift()
    if (!d.dir) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return
      const dir: 1 | -1 = dx < 0 ? 1 : -1
      const to = posRef.current + dir
      if (to < 0 || to > maxPos) {
        drag.current = null
        return
      }
      d.dir = dir
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      if (!simple) {
        d.live = true
        progress.set(dir > 0 ? 0 : 1)
        const t: Turn = { from: posRef.current, to, dir }
        turnRef.current = t
        setTurn(t)
      }
    }
    if (d.live) {
      const dist = double ? pageW * 1.6 : pageW * 0.95
      const amt = Math.min(1, Math.max(0, Math.abs(dx) / dist))
      progress.set(d.dir > 0 ? (dx < 0 ? amt : 0) : dx > 0 ? 1 - amt : 1)
    }
  }

  const onPointerUp = (e: RPointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d || d.id !== e.pointerId || !d.dir) return
    suppressClick.current = true
    window.setTimeout(() => (suppressClick.current = false), 60)
    const first = d.samples[0]
    const last = d.samples[d.samples.length - 1]
    const v = (last.x - first.x) / Math.max(1, last.t - first.t) // px per ms
    const dx = e.clientX - d.x
    const to = posRef.current + d.dir
    if (!d.live) {
      if (Math.abs(dx) > 40 || Math.abs(v) > 0.35) turnTo(to)
      return
    }
    const p = progress.get()
    const commit = d.dir > 0 ? (p > 0.38 || v < -0.35) && v < 0.35 : (p < 0.62 || v > 0.35) && v > -0.35
    const end = commit ? (d.dir > 0 ? 1 : 0) : d.dir > 0 ? 0 : 1
    animate(progress, end, {
      duration: 0.25 + 0.4 * Math.abs(end - p),
      ease: [0.25, 0.8, 0.3, 1],
      onComplete: () => (commit ? finishTurn(to) : setTurn(null)),
    })
  }

  /* Derived content ----------------------------------------------------------- */
  const visible = double ? [leftOf(pos), rightOf(pos, n)] : [pos]
  const activeChapter = chapterAt(pages, double ? (rightOf(pos, n) ?? leftOf(pos) ?? 0) : pos)
  const label = double
    ? visible.filter((v): v is number => v !== null).map((v) => String(v + 1).padStart(2, '0')).join(' – ')
    : String(pos + 1).padStart(2, '0')

  const face = (i: number | null, side: 'left' | 'right', interactive: boolean) =>
    i === null ? null : (
      <PageFace
        page={pages[i]}
        side={side}
        number={i + 1}
        total={n}
        interactive={interactive}
        onEnlarge={(idx) => setLightbox(idx)}
        onBook={bookAndClose}
      />
    )

  // Static layers and the turning leaf for the current turn.
  let staticLeft: number | null = null
  let staticRight: number | null = null
  let leafFront: number | null = null
  let leafBack: number | null = null
  let shiftFor = pos
  if (double) {
    if (turn && turn.dir > 0) {
      staticLeft = leftOf(turn.from)
      staticRight = rightOf(turn.to, n)
      leafFront = rightOf(turn.from, n)
      leafBack = leftOf(turn.to)
      shiftFor = turn.to
    } else if (turn) {
      staticLeft = leftOf(turn.to)
      staticRight = rightOf(turn.from, n)
      leafFront = rightOf(turn.to, n)
      leafBack = leftOf(turn.from)
      shiftFor = turn.to
    } else {
      staticLeft = leftOf(pos)
      staticRight = rightOf(pos, n)
    }
  } else {
    if (turn) {
      staticRight = turn.dir > 0 ? turn.to : turn.from
      leafFront = turn.dir > 0 ? turn.from : turn.to
    } else staticRight = pos
  }
  // A closed book sits centred: shift when only the cover or back is showing.
  const shift = double ? (leftOf(shiftFor) === null ? -pageW / 2 : rightOf(shiftFor, n) === null ? pageW / 2 : 0) : 0
  const bookW = double ? pageW * 2 : pageW

  const consumed = double ? (leftOf(pos) ?? -1) + 1 : pos
  const remaining = n - consumed

  const closing = phase === 'bird' || phase === 'fade'

  return createPortal(
    <motion.div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Photo album"
      className="fixed inset-0 z-[90] flex flex-col overflow-hidden text-ivory"
      initial={false}
      animate={{ opacity: phase === 'fade' ? 0 : 1 }}
      transition={{ duration: simple ? 0.2 : 0.45 }}
      onAnimationComplete={() => phase === 'fade' && onClosed()}
    >
      {/* Backdrop grows out of the card that was clicked. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[#171513]"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 45%, rgb(198 83 19 / 0.13), transparent 60%)' }}
        initial={
          simple || !fromRect
            ? { opacity: 0 }
            : { clipPath: `inset(${fromRect.top}px ${window.innerWidth - fromRect.right}px ${window.innerHeight - fromRect.bottom}px ${fromRect.left}px round 32px)` }
        }
        animate={simple || !fromRect ? { opacity: 1 } : { clipPath: 'inset(0px 0px 0px 0px round 0px)' }}
        transition={{ duration: simple ? 0.2 : 0.75, ease: [0.65, 0, 0.35, 1] }}
        onAnimationComplete={onEntered}
      />

      <div className="relative flex min-h-0 flex-1 flex-col" inert={lightbox !== null}>
      {/* Header */}
      <motion.header
        className="relative z-10 flex items-center justify-between gap-4 px-4 pt-4 sm:px-8 sm:pt-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: closing ? 0 : 1, y: 0 }}
        transition={{ duration: 0.5, delay: closing ? 0 : 0.45 }}
      >
        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] sm:gap-2" role="group" aria-label="Chapters">
          {chapters.map((c) => {
            const active = activeChapter === c.id
            return (
              <button
                key={c.id}
                type="button"
                aria-current={active ? 'true' : undefined}
                onClick={() => turnTo(toPos(pageIndexOf(pages, c.id)))}
                className={`relative h-10 shrink-0 rounded-full px-3 text-[0.6rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 active:scale-95 sm:px-5 sm:text-[0.68rem] sm:tracking-[0.2em] ${
                  active ? 'text-white' : 'text-ivory/70 ring-1 ring-inset ring-white/15 hover:text-ivory hover:ring-white/35'
                }`}
              >
                {active && <motion.span layoutId="chapter-pill" className="absolute inset-0 rounded-full bg-ember" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className="relative">
                  <span className="hidden sm:inline">{c.number} </span>
                  {c.id}
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <p className="hidden font-sans text-xs font-semibold tracking-[0.25em] text-ivory/70 md:block" aria-live="polite">
            <span className="sr-only">Showing page </span>
            {label} <span className="text-ivory/35">/ {String(n).padStart(2, '0')}</span>
          </p>
          <button
            ref={closeBtn}
            type="button"
            onClick={requestClose}
            aria-label="Close album"
            className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-ivory ring-1 ring-inset ring-white/15 transition-all duration-300 hover:rotate-90 hover:bg-ember active:scale-90"
          >
            <Close />
          </button>
        </div>
      </motion.header>

      {/* Stage */}
      <div
        ref={stageRef}
        className="relative z-0 mx-3 my-3 flex-1 touch-none select-none sm:mx-8 sm:my-5"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.stopPropagation()
            e.preventDefault()
          }
        }}
      >
        {stage.w > 0 && phase !== 'bird' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              ref={bookRef}
              className="relative"
              style={{ width: bookW, height: pageH, perspective: 2600 }}
              initial={simple ? { opacity: 0 } : { opacity: 0, scale: 0.82, y: 40, rotateX: 18 }}
              animate={{ opacity: phase === 'enter' && !simple ? 0 : 1, scale: 1, y: 0, rotateX: 0, x: shift }}
              transition={{
                opacity: { duration: 0.5 },
                x: { duration: simple ? 0 : 1, ease: TURN_EASE },
                default: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              {/* Ground shadow */}
              <div aria-hidden className="pointer-events-none absolute -inset-x-[6%] -bottom-[5%] h-[12%] rounded-[50%] bg-black/50 blur-2xl" />

              <AnimatePresence initial={false} mode="sync">
                {staticLeft !== null && (
                  <StaticPage key={`l-${staticLeft}`} simple={simple} left={0} w={pageW} h={pageH} edge={double ? Math.min(7, Math.ceil(consumed / 3)) : 0} edgeSide="left">
                    {face(staticLeft, 'left', !turn)}
                    {turn && <UnderShadow progress={progress} side="left" />}
                  </StaticPage>
                )}
                {staticRight !== null && (
                  <StaticPage key={`r-${staticRight}`} simple={simple} left={double ? pageW : 0} w={pageW} h={pageH} edge={Math.min(7, Math.ceil(remaining / 3))} edgeSide="right">
                    {face(staticRight, double ? 'right' : 'right', !turn)}
                    {turn && <UnderShadow progress={progress} side="right" />}
                  </StaticPage>
                )}
              </AnimatePresence>

              {double && (staticLeft !== null || leafBack !== null) && (staticRight !== null || leafFront !== null) && (
                <div aria-hidden className="pointer-events-none absolute inset-y-0 z-20 w-10 -translate-x-1/2" style={{ left: pageW, background: 'linear-gradient(to right, transparent, rgb(40 25 10 / 0.25) 45%, rgb(40 25 10 / 0.35) 50%, rgb(40 25 10 / 0.25) 55%, transparent)' }} />
              )}

              {turn && leafFront !== null && (
                <Leaf
                  progress={progress}
                  width={pageW}
                  height={pageH}
                  left={double ? pageW : 0}
                  front={face(leafFront, 'right', false)}
                  back={double ? face(leafBack, 'left', false) : <div className="paper-grain absolute inset-0 rounded-[10px_3px_3px_10px] bg-[#f3eee4]" />}
                  strips={pageW < 300 ? 10 : 16}
                />
              )}
            </motion.div>
          </div>
        )}

        {bird && (
          <BirdFlight
            rect={bird.rect}
            pageW={pageW}
            pageH={pageH}
            split={!double}
            left={<PageFace page={bird.left} side="left" number={bird.li + 1} total={n} />}
            right={<PageFace page={bird.right} side="right" number={bird.ri + 1} total={n} />}
            onDone={() => setPhase('fade')}
          />
        )}
      </div>

      {/* Footer controls */}
      <motion.footer
        className="relative z-10 flex flex-col gap-3 px-4 pb-4 sm:px-8 sm:pb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: closing ? 0 : 1, y: 0 }}
        transition={{ duration: 0.5, delay: closing ? 0 : 0.55 }}
      >
        <div className="flex items-center justify-between gap-4">
          <NavButton label="Previous page" onClick={() => go(-1)} disabled={pos <= 0}>
            <ArrowLeft />
          </NavButton>
          <p className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ivory/60">
            <span className="md:hidden">
              {label} / {String(n).padStart(2, '0')}
              <span className="mx-2 text-ivory/30">·</span>
            </span>
            <span className="hidden sm:inline">Drag the corner, swipe, scroll or use the arrow keys</span>
            <span className="sm:hidden">Swipe to turn</span>
          </p>
          <NavButton label="Next page" onClick={() => go(1)} disabled={pos >= maxPos}>
            <ArrowRight />
          </NavButton>
        </div>
        <Thumbnails pages={pages} visible={visible} onSelect={(i) => turnTo(toPos(i))} />
      </motion.footer>
      </div>

      <AnimatePresence>
        {lightbox !== null && pages[lightbox]?.kind === 'photo' && (
          <Lightbox
            key="lightbox"
            page={pages[lightbox] as Extract<BookPage, { kind: 'photo' }>}
            onClose={() => setLightbox(null)}
            onStep={(d) => setLightbox((i) => nextPhoto(pages, i!, d))}
            reduce={simple}
          />
        )}
      </AnimatePresence>
    </motion.div>,
    document.body,
  )
}

function nextPhoto(pages: BookPage[], from: number, d: 1 | -1) {
  for (let i = from + d; i >= 0 && i < pages.length; i += d) if (pages[i].kind === 'photo') return i
  return from
}

function StaticPage({
  children,
  left,
  w,
  h,
  edge,
  edgeSide,
  simple,
}: {
  children: React.ReactNode
  left: number
  w: number
  h: number
  edge: number
  edgeSide: 'left' | 'right'
  simple: boolean
}) {
  // Stacked page edges show how much of the album is on each side.
  const shadows = Array.from({ length: edge }, (_, i) => {
    const o = (i + 1) * (edgeSide === 'right' ? 1.5 : -1.5)
    return `${o}px ${i * 0.6}px 0 ${i % 2 ? '#d8cebd' : '#efe7da'}`
  })
  return (
    <motion.div
      className="absolute top-0"
      style={{ left, width: w, height: h, boxShadow: [...shadows, '0 30px 60px -30px rgb(0 0 0 / 0.6)'].join(', '), borderRadius: edgeSide === 'left' ? '10px 3px 3px 10px' : '3px 10px 10px 3px' }}
      initial={simple ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      exit={simple ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: simple ? 0.25 : 0 }}
    >
      {children}
    </motion.div>
  )
}

/** Shadow cast by the lifting leaf onto the page beneath it. */
function UnderShadow({ progress, side }: { progress: MotionValue<number>; side: 'left' | 'right' }) {
  const opacity = useTransform(progress, (p) => Math.sin(p * Math.PI) * 0.75)
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        opacity,
        background:
          side === 'right'
            ? 'linear-gradient(to right, rgb(20 12 5 / 0.55), rgb(20 12 5 / 0.15) 35%, transparent 70%)'
            : 'linear-gradient(to left, rgb(20 12 5 / 0.55), rgb(20 12 5 / 0.15) 35%, transparent 70%)',
      }}
    />
  )
}

function NavButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ember text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-ember-deep active:scale-90 disabled:pointer-events-none disabled:bg-white/10 disabled:text-ivory/30 sm:h-14 sm:w-14"
    >
      {children}
    </button>
  )
}

function Thumbnails({ pages, visible, onSelect }: { pages: BookPage[]; visible: (number | null)[]; onSelect: (i: number) => void }) {
  const list = useRef<HTMLUListElement>(null)
  const items = pages.map((p, i) => ({ p, i })).filter(({ p }) => p.kind === 'photo' || p.kind === 'chapter')

  useEffect(() => {
    const el = list.current
    const active = el?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!el || !active) return
    const target = active.offsetLeft - el.clientWidth / 2 + active.clientWidth / 2
    el.scrollTo({ left: target, behavior: 'smooth' })
  }, [visible])

  return (
    <ul ref={list} data-thumbs className="mx-auto flex max-w-full gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none]" aria-label="Pages">
      {items.map(({ p, i }) => {
        const current = visible.includes(i)
        return (
          <li key={i} className="shrink-0">
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={current ? 'true' : undefined}
              aria-label={p.kind === 'photo' ? `Go to page ${i + 1}: ${p.caption}` : p.kind === 'chapter' ? `Go to chapter ${p.number}, ${p.chapter}` : `Go to page ${i + 1}`}
              className={`relative block h-14 w-11 overflow-hidden rounded-md transition-all duration-300 active:scale-95 ${
                current ? 'ring-2 ring-ember ring-offset-2 ring-offset-[#171513]' : 'opacity-55 hover:opacity-100'
              }`}
            >
              {p.kind === 'photo' ? (
                <img src={imgUrl(p.photo, p.photo.widths[0])} alt="" loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: p.photo.focus }} />
              ) : (
                <span className="grid h-full w-full place-items-center bg-[#fbf8f1] font-serif text-lg text-ember-deep">{p.kind === 'chapter' ? p.number : ''}</span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function Lightbox({
  page,
  onClose,
  onStep,
  reduce,
}: {
  page: Extract<BookPage, { kind: 'photo' }>
  onClose: () => void
  onStep: (d: 1 | -1) => void
  reduce: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  useFocusTrap(ref, true, { initial: closeRef })
  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`Enlarged photograph: ${page.caption}`}
      className="fixed inset-0 z-[100] flex flex-col bg-black/92 p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="font-serif text-2xl italic text-ivory">{page.caption}</p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close enlarged photograph"
          className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-ivory transition-all duration-300 hover:rotate-90 hover:bg-ember active:scale-90"
        >
          <Close />
        </button>
      </div>
      <div className="relative my-4 flex min-h-0 flex-1 items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div
          key={page.photo.file}
          className="relative flex h-full w-full items-center justify-center"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <Img photo={page.photo} sizes="100vw" priority className="h-auto max-h-full w-auto max-w-full rounded-md object-contain shadow-2xl" />
        </motion.div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <NavButton label="Previous photograph" onClick={() => onStep(-1)}>
          <ArrowLeft />
        </NavButton>
        {page.photo.credit && <p className="text-xs tracking-[0.15em] text-ivory/60">Photo {page.photo.credit}</p>}
        <NavButton label="Next photograph" onClick={() => onStep(1)}>
          <ArrowRight />
        </NavButton>
      </div>
    </motion.div>
  )
}
