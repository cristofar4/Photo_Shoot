import { motion } from 'motion/react'
import type { ReactNode } from 'react'

type Props = {
  rect: { left: number; top: number; width: number; height: number }
  pageW: number
  pageH: number
  left: ReactNode
  right: ReactNode
  /** In single page mode both wings are cut from the one visible page. */
  split: boolean
  onDone: () => void
}

const RECT_L = 'polygon(0% 0%, 100% 0%, 100% 50%, 100% 100%, 50% 100%, 0% 100%)'
const RECT_R = 'polygon(0% 0%, 100% 0%, 100% 50%, 100% 100%, 50% 100%, 0% 100%)'
// Swept wing silhouettes (left wing: body on the right edge; right wing mirrored).
const WING_L = 'polygon(0% 6%, 100% 30%, 100% 62%, 74% 70%, 40% 64%, 12% 38%)'
const WING_R = 'polygon(0% 30%, 100% 6%, 88% 38%, 60% 64%, 26% 70%, 0% 62%)'

const DURATION = 1.75
const T = [0, 0.26, 0.42, 0.58, 0.72, 0.86, 1]

/**
 * Closing flourish: the open album folds along its spine, its pages become
 * wings, and it flaps away across the screen like a bird.
 */
export function BirdFlight({ rect, pageW, pageH, left, right, split, onDone }: Props) {
  const wingW = split ? pageW / 2 : pageW
  const vw = window.innerWidth
  const vh = window.innerHeight
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  const wing = (side: 'l' | 'r', content: ReactNode, offset: number) => (
    <motion.div
      className="absolute top-0 overflow-hidden [backface-visibility:visible]"
      style={{
        width: wingW,
        height: pageH,
        [side === 'l' ? 'right' : 'left']: '50%',
        transformOrigin: side === 'l' ? '100% 50%' : '0% 50%',
        filter: 'drop-shadow(0 18px 24px rgb(0 0 0 / 0.35))',
      }}
      initial={{ rotateY: 0, clipPath: side === 'l' ? RECT_L : RECT_R }}
      animate={{
        rotateY: side === 'l' ? [0, 38, 78, 12, 74, 18, 60] : [0, -38, -78, -12, -74, -18, -60],
        clipPath: side === 'l' ? [RECT_L, WING_L, WING_L, WING_L, WING_L, WING_L, WING_L] : [RECT_R, WING_R, WING_R, WING_R, WING_R, WING_R, WING_R],
      }}
      transition={{ duration: DURATION, times: T, ease: 'easeInOut' }}
    >
      <div className="absolute top-0 h-full" style={{ width: split ? pageW : wingW, left: offset }}>
        {content}
      </div>
    </motion.div>
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-[95]" aria-hidden style={{ perspective: 1600 }}>
      <motion.div
        className="absolute"
        style={{ left: cx, top: cy, width: 0, height: 0, transformStyle: 'preserve-3d' }}
        initial={{ x: 0, y: 0, scale: 1, rotateZ: 0, rotateX: 0, opacity: 1 }}
        animate={{
          x: [0, 0, vw * 0.06, vw * 0.2, vw * 0.36, vw * 0.52, vw * 0.75],
          y: [0, -10, -vh * 0.1, -vh * 0.28, -vh * 0.46, -vh * 0.66, -vh * 0.95],
          scale: [1, 0.36, 0.32, 0.26, 0.2, 0.15, 0.08],
          rotateZ: [0, 52, 58, 54, 60, 56, 62],
          rotateX: [0, 28, 30, 26, 30, 28, 30],
          opacity: [1, 1, 1, 1, 1, 0.9, 0],
        }}
        transition={{ duration: DURATION, times: T, ease: 'easeInOut' }}
        onAnimationComplete={onDone}
      >
        <div className="absolute" style={{ left: -wingW, top: -pageH / 2, width: wingW * 2, height: pageH, transformStyle: 'preserve-3d' }}>
          {wing('l', left, 0)}
          {wing('r', right, split ? -pageW / 2 : 0)}
          {/* Body, head and tail appear as the pages fold into wings. */}
          <motion.div
            className="absolute left-1/2 top-[14%] h-[66%] -translate-x-1/2"
            style={{ width: Math.max(14, wingW * 0.11) }}
            initial={{ opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: [0, 1, 1, 1, 1, 1, 1], scaleY: [0.4, 1, 1, 1, 1, 1, 1] }}
            transition={{ duration: DURATION, times: T }}
          >
            <span className="absolute inset-0 rounded-[50%] bg-ink" />
            <span className="absolute -top-[9%] left-1/2 aspect-square w-[120%] -translate-x-1/2 rounded-full bg-ink" />
            <span
              className="absolute -top-[15%] left-1/2 h-[9%] w-[60%] -translate-x-1/2 bg-ember"
              style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }}
            />
            <span
              className="absolute -bottom-[16%] left-1/2 h-[22%] w-[180%] -translate-x-1/2 bg-ink"
              style={{ clipPath: 'polygon(50% 0, 100% 100%, 50% 78%, 0 100%)' }}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
