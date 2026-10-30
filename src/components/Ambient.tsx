import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { useFinePointer } from '../lib/hooks'

/** Thin ember reading progress bar across the top of the page. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 })
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-ember" style={{ scaleX }} />
}

/**
 * On mouse and trackpad devices, elements with `data-cursor="Label"` show a
 * soft label bubble that trails the pointer. Purely decorative.
 */
export function CursorBubble() {
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const [label, setLabel] = useState<string | null>(null)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 380, damping: 32, mass: 0.5 })
  const enabled = fine && !reduce

  useEffect(() => {
    if (!enabled) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]')
      // Hide while over a real control so the bubble never covers a button.
      const overControl = (e.target as HTMLElement | null)?.closest('button:not([data-cursor]), a:not([data-cursor])')
      setLabel(target && !overControl ? target.dataset.cursor ?? null : null)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [enabled, x, y])

  if (!enabled) return null
  return (
    <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[70]" style={{ x: sx, y: sy }}>
      <AnimatePresence>
        {label && (
          <motion.span
            key="bubble"
            className="absolute grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ember text-center text-[0.62rem] font-semibold uppercase leading-tight tracking-[0.2em] text-white shadow-[0_20px_40px_-18px_rgb(120_45_8/0.8)]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/** Infinite ticker. Pauses on hover and stops entirely for reduced motion. */
export function Marquee({ items, className = '' }: { items: string[]; className?: string }) {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <li key={`${t}-${i}`} className="flex items-center">
          <span className="display px-8 text-[clamp(2.2rem,5vw,4.2rem)] italic">{t}</span>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="text-ember">
            <path fill="currentColor" d="M12 0c.8 6.4 5.6 11.2 12 12-6.4.8-11.2 5.6-12 12-.8-6.4-5.6-11.2-12-12C6.4 11.2 11.2 6.4 12 0Z" />
          </svg>
        </li>
      ))}
    </ul>
  )
  return (
    <div className={`group overflow-hidden ${className}`}>
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
