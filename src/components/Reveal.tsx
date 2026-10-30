import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'

type Props = HTMLMotionProps<'div'> & { delay?: number; y?: number }

/** Restrained entrance: a short rise and fade, once, when scrolled into view. */
export function Reveal({ delay = 0, y = 26, children, ...rest }: Props) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
  aside,
  light = false,
}: {
  eyebrow: string
  title: string
  intro?: string
  id?: string
  aside?: React.ReactNode
  light?: boolean
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <Reveal className="max-w-3xl">
        <span className="accent-rule mb-5" />
        <p className={`eyebrow mb-4 ${light ? 'text-ivory/75' : 'text-muted'}`}>{eyebrow}</p>
        <h2 id={id} className={`display text-[clamp(2.6rem,6.4vw,5.4rem)] ${light ? 'text-ivory' : 'text-ink'}`}>
          {title}
        </h2>
        {intro && <p className={`mt-5 max-w-xl text-base leading-relaxed md:text-lg ${light ? 'text-ivory/80' : 'text-muted'}`}>{intro}</p>}
      </Reveal>
      {aside && <Reveal delay={0.1}>{aside}</Reveal>}
    </div>
  )
}
