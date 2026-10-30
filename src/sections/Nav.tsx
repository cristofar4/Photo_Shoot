import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { PillButton } from '../components/Buttons'
import { Close, Menu } from '../components/Icons'
import { Img } from '../components/Img'
import { photos } from '../config/media'
import { nav, site } from '../config/site'
import { useEscape } from '../lib/hooks'
import { useFocusTrap, useScrollLock } from '../lib/overlay'

const menuImages = [photos.studioHand, photos.trioSkateRoad, photos.weddingGardenWalk, photos.duoGround]

export function Nav({ onBook }: { onBook: () => void }) {
  const [compact, setCompact] = useState(false)
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const [menuHover, setMenuHover] = useState(0)
  const reduce = useReducedMotion()
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useScrollLock(open)
  useFocusTrap(wrap, open)
  useEscape(open, () => setOpen(false))

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const onChange = () => mql.matches && setOpen(false)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return (
    <div ref={wrap}>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4">
        <motion.div
          layout={!reduce}
          className={`pointer-events-auto flex w-full items-center justify-between gap-4 rounded-full border border-white/40 bg-ivory/80 pl-5 pr-2 shadow-[0_18px_40px_-24px_rgb(25_25_25/0.45)] backdrop-blur-xl transition-[max-width,height] duration-700 ease-[var(--ease-lux)] sm:pl-7 ${
            compact ? 'h-14 max-w-5xl' : 'h-16 max-w-7xl'
          } ${open ? 'bg-ivory' : ''}`}
        >
          <a href="#top" className="flex min-w-0 items-center gap-3 text-ink" aria-label={`${site.name}, back to top`}>
            <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink">
              <span className="h-2 w-2 rounded-full bg-ember" />
            </span>
            <span className="truncate whitespace-nowrap font-serif text-[1.15rem] uppercase tracking-[0.16em] sm:text-[1.3rem]">{site.name}</span>
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1" onPointerLeave={() => setHover(null)}>
              {nav.map((n) => (
                <li key={n.href} className="relative">
                  {hover === n.href && (
                    <motion.span
                      layoutId="nav-hover"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <a
                    href={n.href}
                    onPointerEnter={() => setHover(n.href)}
                    onFocus={() => setHover(n.href)}
                    onBlur={() => setHover(null)}
                    className={`relative block rounded-full px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] transition-colors duration-300 ${
                      hover === n.href ? 'text-ivory' : 'text-ink/75'
                    }`}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden min-[520px]:block">
              <PillButton tone="ember" size="sm" onClick={onBook}>
                Book a session
              </PillButton>
            </span>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full bg-ink text-ivory transition-transform active:scale-90 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={open ? 'x' : 'm'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {open ? <Close /> : <Menu />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </motion.div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 overflow-y-auto bg-espresso text-ivory lg:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: 'circle(0% at calc(100% - 3rem) 2.5rem)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'circle(150% at calc(100% - 3rem) 2.5rem)' }}
            exit={reduce ? { opacity: 0 } : { clipPath: 'circle(0% at calc(100% - 3rem) 2.5rem)' }}
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          >
            <nav aria-label="Mobile" className="flex min-h-full flex-col justify-between px-6 pb-10 pt-28">
              <ul className="flex flex-col">
                {nav.map((n, i) => (
                  <motion.li
                    key={n.href}
                    className="border-b border-white/10"
                    initial={reduce ? false : { opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <a
                      href={n.href}
                      onClick={() => setOpen(false)}
                      onPointerEnter={() => setMenuHover(i)}
                      onFocus={() => setMenuHover(i)}
                      className="flex items-baseline justify-between py-5 font-serif text-[2.9rem] leading-none tracking-tight"
                    >
                      {n.label}
                      <span className="eyebrow text-ember">0{i + 1}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                className="mt-10 flex items-end justify-between gap-6"
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="flex flex-col gap-5">
                  <PillButton
                    tone="ember"
                    onClick={() => {
                      setOpen(false)
                      onBook()
                    }}
                  >
                    Book a session
                  </PillButton>
                  <p className="text-sm text-ivory/60">{site.tagline}</p>
                </div>
                <div className="relative hidden h-32 w-24 shrink-0 overflow-hidden rounded-t-full rounded-b-2xl min-[420px]:block">
                  <AnimatePresence mode="popLayout">
                    <motion.div key={menuHover} className="absolute inset-0" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                      <Img photo={menuImages[menuHover]} sizes="96px" badge={false} className="h-full w-full object-cover" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
