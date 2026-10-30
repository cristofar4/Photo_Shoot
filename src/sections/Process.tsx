import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { Reveal } from '../components/Reveal'

const steps = [
  { title: 'Discover', text: 'We’ll chat about your vision, ideas, and what matters most to you.' },
  { title: 'Plan', text: 'I’ll help shape the details: location, timing, and creative direction.' },
  { title: 'Create', text: 'We bring it to life, capturing natural, meaningful moments together.' },
  { title: 'Deliver', text: 'You’ll receive a beautifully curated gallery to relive and share for years to come.' },
]

/** Dark band; the timeline fills and each step lights up as you scroll past. */
export function Process() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.55'] })
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1])
  const [reached, setReached] = useState(reduce ? steps.length : 0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!reduce) setReached(Math.min(steps.length, Math.floor(v * steps.length + 0.35)))
  })

  return (
    <section aria-labelledby="process-title" className="relative mx-3 overflow-hidden rounded-[2.5rem] bg-espresso py-24 text-ivory sm:mx-5 md:py-32">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-ember/15 blur-3xl" />
      <div className="shell relative">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-8">
            <span className="accent-rule mb-5" />
            <p className="eyebrow mb-4 text-ivory/65">The process</p>
            <h2 id="process-title" className="display text-[clamp(2.8rem,6.6vw,6rem)]">
              From first hello <span className="italic text-[#f3c9a6]">to final frame.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4">
            <p className="max-w-sm text-base leading-relaxed text-ivory/70">A simple, thoughtful process designed around you, from the first message to the gallery in your hands.</p>
          </Reveal>
        </div>

        <ol ref={ref} className="relative mt-20 grid gap-12 md:grid-cols-4 md:gap-8">
          {/* Track and fill: horizontal on desktop, vertical on phones. */}
          <span aria-hidden className="absolute left-7 top-7 hidden h-px bg-white/15 md:block" style={{ right: 'calc((100% - 6rem) / 4 - 1.75rem)' }} />
          <motion.span
            aria-hidden
            className="absolute left-7 top-7 hidden h-px origin-left bg-ember md:block"
            style={{ right: 'calc((100% - 6rem) / 4 - 1.75rem)', scaleX: reduce ? 1 : fill }}
          />
          <span aria-hidden className="absolute bottom-0 left-7 top-7 w-px bg-white/15 md:hidden" />
          <motion.span aria-hidden className="absolute bottom-0 left-7 top-7 w-px origin-top bg-ember md:hidden" style={{ scaleY: reduce ? 1 : fill }} />

          {steps.map((s, i) => {
            const lit = i < reached
            return (
              <li key={s.title} className="group relative flex gap-6 md:block">
                <span
                  className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full font-serif text-2xl transition-all duration-700 ${
                    lit ? 'bg-ember text-white shadow-[0_0_0_8px_rgb(198_83_19/0.18)]' : 'bg-espresso-soft text-ivory/60 ring-1 ring-inset ring-white/20'
                  }`}
                >
                  {i + 1}
                </span>
                <div className={`transition-all duration-700 md:mt-10 ${lit ? 'opacity-100' : 'opacity-45'}`}>
                  <p className="eyebrow text-ember">Step 0{i + 1}</p>
                  <h3 className="display mt-3 text-[2.6rem] transition-transform duration-500 group-hover:translate-x-1">{s.title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-ivory/70">{s.text}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
