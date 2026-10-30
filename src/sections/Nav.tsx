import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { PillButton } from '../components/Buttons'
import { Close, Menu } from '../components/Icons'
import { nav, site } from '../config/site'
import { useEscape } from '../lib/hooks'
import { useFocusTrap, useScrollLock } from '../lib/overlay'

export function Nav({ onBook }: { onBook: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const sheet = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useScrollLock(open)
  useFocusTrap(sheet, open)
  useEscape(open, () => setOpen(false))

  // Close the menu if the viewport grows into the desktop layout.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const onChange = () => mql.matches && setOpen(false)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return (
    <div ref={sheet}>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
        scrolled || open ? 'bg-ivory/85 shadow-[0_1px_0_var(--color-line)] backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="shell flex h-[4.5rem] items-center justify-between gap-4">
        <a href="#top" className="min-w-0 truncate whitespace-nowrap font-serif text-[1.05rem] uppercase tracking-[0.12em] text-ink min-[400px]:text-[1.2rem] sm:text-[1.45rem] sm:tracking-[0.2em]" aria-label={`${site.name}, back to top`}>
          {site.name}
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="group relative py-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-ink/80 transition-colors hover:text-ink">
                  {n.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-ember transition-transform duration-500 ease-[var(--ease-lux)] group-hover:origin-left group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden min-[520px]:block">
            <PillButton tone="ember" size="sm" onClick={onBook}>
              Book a session
            </PillButton>
          </span>
          <button
            ref={toggle}
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full bg-ink text-ivory transition-transform active:scale-90 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
    </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 overflow-y-auto bg-ivory lg:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0)' }}
            exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <nav aria-label="Mobile" className="shell flex min-h-full flex-col justify-between pb-10 pt-8">
              <ul className="flex flex-col">
                {nav.map((n, i) => (
                  <motion.li
                    key={n.href}
                    className="border-b border-line"
                    initial={reduce ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <a
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline justify-between py-5 font-serif text-5xl tracking-tight text-ink"
                    >
                      {n.label}
                      <span className="eyebrow text-ember-deep">0{i + 1}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-10 flex flex-col gap-6">
                <PillButton
                  tone="ember"
                  onClick={() => {
                    setOpen(false)
                    onBook()
                  }}
                  className="self-start"
                >
                  Book a session
                </PillButton>
                <p className="text-sm text-muted">{site.tagline}</p>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
