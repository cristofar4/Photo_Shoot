import { useEffect, useLayoutEffect, type RefObject } from 'react'

/* Scroll locking ---------------------------------------------------------- */

let locks = 0
let savedScroll = 0

/** Locks page scrolling (reference counted, so nested overlays are safe). */
export function lockScroll() {
  if (locks++ > 0) return
  savedScroll = window.scrollY
  const gap = window.innerWidth - document.documentElement.clientWidth
  const html = document.documentElement
  html.style.overflow = 'hidden'
  if (gap > 0) html.style.paddingRight = `${gap}px`
}

export function unlockScroll() {
  if (--locks > 0) return
  locks = 0
  const html = document.documentElement
  html.style.overflow = ''
  html.style.paddingRight = ''
  if (Math.abs(window.scrollY - savedScroll) > 1) {
    const prev = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'
    window.scrollTo(0, savedScroll)
    html.style.scrollBehavior = prev
  }
}

export function useScrollLock(active: boolean) {
  useLayoutEffect(() => {
    if (!active) return
    lockScroll()
    return unlockScroll
  }, [active])
}

/* Background inertness ----------------------------------------------------- */

let inertCount = 0

/** Makes the page behind an overlay inert so focus and screen readers stay inside. */
export function useInertBackground(active: boolean) {
  useEffect(() => {
    if (!active) return
    const root = document.getElementById('root')
    if (!root) return
    inertCount++
    root.inert = true
    root.setAttribute('aria-hidden', 'true')
    return () => {
      if (--inertCount <= 0) {
        inertCount = 0
        root.inert = false
        root.removeAttribute('aria-hidden')
      }
    }
  }, [active])
}

/* Focus trap ---------------------------------------------------------------- */

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),video[controls],[tabindex]:not([tabindex="-1"])'

export function focusables(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.closest('[inert]') && el.getClientRects().length > 0,
  )
}

/**
 * Keeps Tab focus inside `ref` while active. On deactivation focus returns to
 * `returnTo` (or whatever was focused when the trap started).
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  opts: { initial?: RefObject<HTMLElement | null>; returnTo?: HTMLElement | null } = {},
) {
  const { initial, returnTo } = opts
  useEffect(() => {
    if (!active) return
    const container = ref.current
    if (!container) return
    const previous = returnTo ?? (document.activeElement as HTMLElement | null)

    const focusFirst = () => {
      const target = initial?.current ?? focusables(container)[0] ?? container
      target.focus({ preventScroll: true })
    }
    const raf = requestAnimationFrame(focusFirst)

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = focusables(container)
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const activeEl = document.activeElement as HTMLElement | null
      if (!activeEl || !container.contains(activeEl)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && activeEl === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      // Wait a frame so the background is no longer inert before refocusing.
      requestAnimationFrame(() => previous?.focus?.({ preventScroll: true }))
    }
  }, [active, ref, initial, returnTo])
}
