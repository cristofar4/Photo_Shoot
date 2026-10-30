import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { PillButton } from '../components/Buttons'
import { Img } from '../components/Img'
import { Marquee } from '../components/Ambient'
import { photos, type Photo } from '../config/media'
import { site } from '../config/site'

type Token = string | { photo: Photo }

const statement: Token[] = [
  'I', 'photograph', { photo: photos.studioSeated }, 'real', 'people,', 'honest', 'moments', 'and', 'the', 'quiet', 'beauty',
  'in', 'between,', { photo: photos.weddingGardenKiss }, 'so', 'the', 'story', 'you', 'live', 'becomes', 'the', 'story', 'you',
  { photo: photos.trioTailgate }, 'keep.',
]

/** Manifesto: words brighten one by one as the paragraph scrolls through view. */
export function Intro() {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const total = statement.length

  return (
    <section id="intro" aria-label="Introduction" className="pt-10 md:pt-16">
      <Marquee items={['Portraits', 'Weddings', 'Lifestyle', 'Film', 'Stories told through light']} className="border-y border-line py-5 text-ink/85" />

      <div className="shell py-24 md:py-36">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <span className="accent-rule mb-5" />
            <p className="eyebrow text-muted">The approach</p>
          </div>
          <div className="lg:col-span-9">
            <p ref={ref} className="display text-[clamp(2.1rem,4.6vw,4.4rem)] leading-[1.08]">
              {statement.map((t, i) => (
                <Word key={i} token={t} progress={scrollYProgress} range={[i / total, (i + 1) / total]} still={!!reduce} />
              ))}
            </p>
            <div className="mt-14 flex flex-wrap items-center gap-6">
              <PillButton tone="ink" href="#about">
                Meet {site.photographer}
              </PillButton>
              <p className="font-serif text-2xl italic text-muted">With love, {site.photographer}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Word({ token, progress, range, still }: { token: Token; progress: MotionValue<number>; range: [number, number]; still: boolean }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  const scale = useTransform(progress, range, [0.6, 1])
  if (typeof token !== 'string') {
    return (
      <motion.span
        className="relative mx-[0.12em] inline-block h-[0.82em] w-[1.7em] overflow-hidden rounded-full align-[-0.08em]"
        style={still ? undefined : { scale }}
      >
        <Img photo={token.photo} sizes="120px" badge={false} className="absolute inset-0 h-full w-full object-cover" />
      </motion.span>
    )
  }
  return (
    <motion.span className="inline" style={still ? undefined : { opacity }}>
      {token}{' '}
    </motion.span>
  )
}
