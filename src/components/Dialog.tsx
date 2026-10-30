import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useEscape } from '../lib/hooks'
import { useFocusTrap, useInertBackground, useScrollLock } from '../lib/overlay'
import { Close } from './Icons'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  /** Visually hide the title (still announced). */
  hideTitle?: boolean
  children: ReactNode
  variant?: 'sheet' | 'cinema'
  returnTo?: HTMLElement | null
}

/** Accessible modal: portal, focus trap, Escape, scroll lock and inert page. */
export function Dialog({ open, onClose, title, hideTitle, children, variant = 'sheet', returnTo }: Props) {
  return createPortal(
    <AnimatePresence>{open && <DialogInner {...{ onClose, title, hideTitle, variant, returnTo }}>{children}</DialogInner>}</AnimatePresence>,
    document.body,
  )
}

function DialogInner({ onClose, title, hideTitle, children, variant, returnTo }: Omit<Props, 'open'>) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const id = useId()
  const reduce = useReducedMotion()
  useScrollLock(true)
  useInertBackground(true)
  useFocusTrap(ref, true, { initial: closeRef, returnTo })
  useEscape(true, onClose)

  const cinema = variant === 'cinema'
  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={id}
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`absolute inset-0 ${cinema ? 'bg-ink/92' : 'bg-ink/55 backdrop-blur-sm'}`} onClick={onClose} aria-hidden />
      <motion.div
        className={
          cinema
            ? 'relative w-full max-w-6xl px-4 pb-6 sm:px-0 sm:pb-0'
            : 'relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-paper p-7 shadow-2xl sm:rounded-[2rem] sm:p-10'
        }
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={`mb-6 flex items-start justify-between gap-6 ${cinema ? 'text-ivory' : ''}`}>
          <h2 id={id} className={hideTitle ? 'sr-only' : 'display text-4xl md:text-5xl'}>
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`group ml-auto grid h-12 w-12 shrink-0 place-items-center rounded-full transition-all duration-300 hover:rotate-90 active:scale-90 ${
              cinema ? 'bg-white/10 text-ivory hover:bg-ember' : 'bg-sand text-ink hover:bg-ink hover:text-ivory'
            }`}
          >
            <Close />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}
