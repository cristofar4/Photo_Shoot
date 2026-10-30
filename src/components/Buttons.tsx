import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { forwardRef, useRef, type ComponentPropsWithoutRef, type ReactNode, type PointerEvent } from 'react'
import { useFinePointer } from '../lib/hooks'
import { ArrowRight, ArrowUpRight } from './Icons'

/**
 * Arrow that slides out and a twin that slides in on hover, focus or press.
 * Used inside every button so arrow motion is consistent across the site.
 */
export function SlidingArrow({ diagonal = false, size = 18 }: { diagonal?: boolean; size?: number }) {
  const Icon = diagonal ? ArrowUpRight : ArrowRight
  const out = diagonal
    ? 'group-hover/btn:translate-x-[140%] group-hover/btn:-translate-y-[140%] group-focus-visible/btn:translate-x-[140%] group-focus-visible/btn:-translate-y-[140%]'
    : 'group-hover/btn:translate-x-[150%] group-focus-visible/btn:translate-x-[150%]'
  const inn = diagonal
    ? '-translate-x-[140%] translate-y-[140%] group-hover/btn:translate-x-0 group-hover/btn:translate-y-0 group-focus-visible/btn:translate-x-0 group-focus-visible/btn:translate-y-0'
    : '-translate-x-[150%] group-hover/btn:translate-x-0 group-focus-visible/btn:translate-x-0'
  return (
    <span className="relative block overflow-hidden" style={{ width: size, height: size }} aria-hidden>
      <Icon width={size} height={size} className={`absolute inset-0 transition-transform duration-500 ease-[var(--ease-lux)] ${out}`} />
      <Icon width={size} height={size} className={`absolute inset-0 transition-transform duration-500 ease-[var(--ease-lux)] ${inn}`} />
    </span>
  )
}

type Tone = 'ink' | 'ember' | 'light' | 'outline' | 'glass'

const tones: Record<Tone, { base: string; fill: string; dot: string; hoverText: string }> = {
  ink: { base: 'bg-ink text-ivory', fill: 'bg-ember', dot: 'bg-ivory text-ink', hoverText: 'text-white' },
  ember: { base: 'bg-ember text-white', fill: 'bg-ink', dot: 'bg-white text-ember-deep', hoverText: 'text-white' },
  light: { base: 'bg-ivory text-ink', fill: 'bg-ember', dot: 'bg-ink text-ivory', hoverText: 'text-white' },
  outline: { base: 'bg-transparent text-ink ring-1 ring-inset ring-ink/25', fill: 'bg-ink', dot: 'bg-ink text-ivory', hoverText: 'text-ivory' },
  glass: { base: 'bg-white/10 text-ivory ring-1 ring-inset ring-white/25 backdrop-blur-md', fill: 'bg-ivory', dot: 'bg-ivory text-ink', hoverText: 'text-ink' },
}

/** Label that rolls up on hover/focus while an identical copy rolls in from below. */
function RollText({ children, hoverText }: { children: ReactNode; hoverText: string }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-[var(--ease-lux)] group-hover/btn:-translate-y-full group-focus-visible/btn:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className={`absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-lux)] group-hover/btn:translate-y-0 group-focus-visible/btn:translate-y-0 ${hoverText}`}
      >
        {children}
      </span>
    </span>
  )
}

type PillProps = {
  tone?: Tone
  children: ReactNode
  diagonal?: boolean
  size?: 'sm' | 'md' | 'lg'
  href?: string
} & Omit<ComponentPropsWithoutRef<'button'>, 'children'>

/**
 * Pill button: the label rolls to a fresh copy, a colour wash grows out of
 * the arrow dot and the arrow swaps. Pressing gives a soft squeeze so touch
 * users get the same feedback without hover.
 */
export const PillButton = forwardRef<HTMLButtonElement & HTMLAnchorElement, PillProps>(function PillButton(
  { tone = 'ink', children, diagonal, size = 'md', href, className = '', ...rest },
  ref,
) {
  const t = tones[tone]
  const pad = { sm: 'h-11 pl-5 pr-1.5 text-[0.66rem]', md: 'h-[3.25rem] pl-6 pr-2 text-[0.7rem]', lg: 'h-16 pl-8 pr-2.5 text-[0.78rem]' }[size]
  const dot = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-11 w-11' }[size]
  const inner = (
    <>
      <span
        className={`pointer-events-none absolute right-2 top-1/2 aspect-square w-10 -translate-y-1/2 scale-0 rounded-full transition-transform duration-[700ms] ease-[var(--ease-lux)] group-hover/btn:scale-[10] group-focus-visible/btn:scale-[10] ${t.fill}`}
        aria-hidden
      />
      <span className="relative z-10 whitespace-nowrap font-semibold uppercase tracking-[0.22em]">
        <RollText hoverText={t.hoverText}>{children}</RollText>
      </span>
      <span
        className={`relative z-10 grid place-items-center rounded-full transition-transform duration-500 ease-[var(--ease-lux)] group-hover/btn:rotate-[-45deg] group-hover/btn:scale-110 ${dot} ${t.dot}`}
      >
        <SlidingArrow diagonal={diagonal} size={size === 'sm' ? 14 : 16} />
      </span>
    </>
  )
  const cls = `group/btn relative isolate inline-flex select-none items-center gap-4 overflow-hidden rounded-full ${pad} ${t.base} transition-[transform,box-shadow] duration-300 ease-[var(--ease-lux)] hover:shadow-[0_16px_34px_-16px_rgb(25_25_25/0.6)] active:scale-[0.97] ${className}`
  if (href) {
    return (
      <a ref={ref} href={href} className={cls} onClick={rest.onClick as never} aria-label={rest['aria-label']}>
        {inner}
      </a>
    )
  }
  return (
    <button ref={ref} type="button" className={cls} {...rest}>
      {inner}
    </button>
  )
})

type CircleProps = {
  label: string
  icon?: ReactNode
  diagonal?: boolean
  tone?: 'ember' | 'ink' | 'outline' | 'glass'
  size?: number
  /** Rotating caption around the button, for featured actions. */
  ring?: string
  magnetic?: boolean
} & Omit<ComponentPropsWithoutRef<'button'>, 'children'>

const circleTones = {
  ember: 'bg-ember text-white hover:bg-ember-deep',
  ink: 'bg-ink text-ivory hover:bg-ember',
  outline: 'bg-transparent text-ember-deep ring-1 ring-inset ring-ember/70 hover:bg-ember hover:text-white',
  glass: 'bg-ink/45 text-ivory ring-1 ring-inset ring-white/25 backdrop-blur-md hover:bg-ink/70',
}

/**
 * Circular action button designed to sit inside a curved recess. A ripple
 * ring breathes out on hover, the arrow swaps, and on fine pointers the
 * button is gently drawn toward the cursor.
 */
export const CircleButton = forwardRef<HTMLButtonElement, CircleProps>(function CircleButton(
  { label, icon, diagonal = true, tone = 'ember', size = 72, ring, magnetic = true, className = '', ...rest },
  ref,
) {
  const reduce = useReducedMotion()
  const fine = useFinePointer()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 })
  const box = useRef<HTMLSpanElement>(null)
  const canMagnet = magnetic && fine && !reduce

  const onMove = (e: PointerEvent) => {
    if (!canMagnet || !box.current) return
    const r = box.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.28)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  const ringSize = size + 46
  return (
    <span
      ref={box}
      className="relative grid place-items-center"
      style={{ width: ring ? ringSize : size + 12, height: ring ? ringSize : size + 12 }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {ring && <RotatingText text={ring} size={ringSize} />}
      <motion.button
        ref={ref}
        type="button"
        aria-label={label}
        style={{ x: sx, y: sy, width: size, height: size }}
        className={`group/btn relative grid place-items-center rounded-full shadow-[0_18px_34px_-18px_rgb(120_45_8/0.7)] transition-[background-color,color,transform] duration-300 active:scale-90 ${circleTones[tone]} ${className}`}
        {...(rest as object)}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-ember/50 opacity-0 transition-all duration-700 ease-[var(--ease-lux)] group-hover/btn:scale-[1.35] group-hover/btn:opacity-100 group-focus-visible/btn:scale-[1.35] group-focus-visible/btn:opacity-100"
        />
        {icon ?? <SlidingArrow diagonal={diagonal} size={Math.round(size * 0.32)} />}
      </motion.button>
    </span>
  )
})

/** Slowly rotating circular caption (static when reduced motion is preferred). */
export function RotatingText({ text, size, className = 'text-ink/70' }: { text: string; size: number; className?: string }) {
  const id = `ring-${text.replace(/\W+/g, '')}`
  const r = size / 2 - 8
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={`pointer-events-none absolute inset-0 animate-spin-slow ${className}`}
    >
      <defs>
        <path id={id} d={`M ${size / 2} ${size / 2} m -${r} 0 a ${r} ${r} 0 1 1 ${2 * r} 0 a ${r} ${r} 0 1 1 -${2 * r} 0`} />
      </defs>
      <text className="fill-current text-[9px] font-semibold uppercase" style={{ letterSpacing: '0.34em' }}>
        <textPath href={`#${id}`}>{text}</textPath>
      </text>
    </svg>
  )
}
