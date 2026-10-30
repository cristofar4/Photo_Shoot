import { motion, useTransform, type MotionValue } from 'motion/react'
import type { ReactNode } from 'react'

type Props = {
  /** 0 = lying flat on the right, 1 = turned over to the left. */
  progress: MotionValue<number>
  width: number
  height: number
  left: number
  front: ReactNode
  back: ReactNode
  strips?: number
}

/** Total bend of the paper (degrees) at the middle of a turn. */
const MAX_BEND = 48

/**
 * A turning page. The sheet is cut into vertical strips that are nested in
 * one another, each rotating a little further than the last, so the paper
 * genuinely curls as it lifts from the spine. Every strip shades itself from
 * its own angle, which gives the moving highlight and shadow across the curl.
 */
export function Leaf({ progress, width, height, left, front, back, strips = 10 }: Props) {
  const rotate = useTransform(progress, (p) => -180 * p)
  return (
    <motion.div
      className="pointer-events-none absolute top-0 z-30"
      style={{ left, width, height, rotateY: rotate, transformOrigin: '0% 50%', transformStyle: 'preserve-3d' }}
      aria-hidden
    >
      <Strip i={0} n={strips} width={width} height={height} progress={progress} front={front} back={back} />
    </motion.div>
  )
}

const bendOf = (p: number, i: number, n: number) => (i === 0 ? 0 : Math.sin(p * Math.PI) * (MAX_BEND / (n / 2)) * (i / (n - 1)))

function cumulative(p: number, i: number, n: number) {
  let a = -180 * p
  for (let j = 0; j <= i; j++) a += bendOf(p, j, n)
  return a
}

function Strip({ i, n, width, height, progress, front, back }: Omit<Props, 'left' | 'strips'> & { i: number; n: number }) {
  const w = width / n
  const bend = useTransform(progress, (p) => bendOf(p, i, n))
  // Lambert style falloff: a face turned away from the viewer darkens.
  const frontShade = useTransform(progress, (p) => 0.55 * (1 - Math.abs(Math.cos((cumulative(p, i, n) * Math.PI) / 180))))
  const backShade = useTransform(progress, (p) => 0.45 * (1 - Math.abs(Math.cos((cumulative(p, i, n) * Math.PI) / 180))))
  // A narrow highlight travels across the crest of the curl.
  const gloss = useTransform(progress, (p) => {
    const crest = (1 - Math.sin(p * Math.PI)) * (n - 1)
    const d = (i - crest) / (n * 0.18)
    return 0.09 * Math.sin(p * Math.PI) * Math.exp(-d * d)
  })

  const face = 'absolute inset-y-0 overflow-hidden [backface-visibility:hidden] [-webkit-backface-visibility:hidden]'
  return (
    <motion.div
      className="absolute top-0"
      style={{ left: i === 0 ? 0 : w, width: w, height, rotateY: bend, transformOrigin: '0% 50%', transformStyle: 'preserve-3d' }}
    >
      <div className={face} style={{ left: 0, width: w + 0.75 }}>
        <div className="absolute top-0" style={{ left: -i * w, width, height }}>
          {front}
        </div>
        <motion.div className="absolute inset-0 bg-[#1b130c]" style={{ opacity: frontShade }} />
        <motion.div className="absolute inset-0 bg-white" style={{ opacity: gloss }} />
      </div>
      <div className={face} style={{ left: -0.75, width: w + 0.75, transform: 'rotateY(180deg)' }}>
        <div className="absolute top-0" style={{ left: -(n - 1 - i) * w, width, height }}>
          {back}
        </div>
        <motion.div className="absolute inset-0 bg-[#1b130c]" style={{ opacity: backShade }} />
      </div>
      {i < n - 1 && <Strip i={i + 1} n={n} width={width} height={height} progress={progress} front={front} back={back} />}
    </motion.div>
  )
}
