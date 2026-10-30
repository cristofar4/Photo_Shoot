import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useId, useRef, useState } from 'react'
import { PillButton, RotatingText } from '../components/Buttons'
import { Camera, People, Sun } from '../components/Icons'
import { Img } from '../components/Img'
import { Reveal } from '../components/Reveal'
import { sectionMedia } from '../config/media'
import { site } from '../config/site'

const benefits = [
  { icon: Camera, title: 'Authentic storytelling', text: 'Real moments, gently guided and never forced. The photographs feel like the day felt.' },
  { icon: People, title: 'A personal approach', text: 'Every session is shaped around you, your people and the story you want to tell.' },
  { icon: Sun, title: 'Natural light, always', text: 'Soft, honest light that flatters skin, holds colour and lasts for years.' },
]

export function About() {
  const [more, setMore] = useState(false)
  const reduce = useReducedMotion()
  const moreId = useId()
  const frame = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: frame, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <section id="about" aria-labelledby="about-title" className="relative bg-blush/60 py-24 md:py-36">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-20">
        {/* Pinned portrait column */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal className="relative mx-auto max-w-md lg:max-w-none">
              <div ref={frame} className="relative aspect-[4/5] overflow-hidden rounded-[999px_999px_2.25rem_2.25rem] bg-sand">
                <motion.div className="absolute -inset-y-[10%] inset-x-0" style={reduce ? undefined : { y: imgY }}>
                  <Img photo={sectionMedia.aboutPortrait} sizes="(min-width: 1024px) 38vw, 90vw" className="h-full w-full object-cover" />
                </motion.div>
              </div>
              <div className="absolute -bottom-8 -left-2 grid h-36 w-36 place-items-center rounded-full bg-ivory shadow-xl sm:-left-6">
                <RotatingText text="Behind the lens · Praise Studio · " size={136} className="text-ink/70" />
                <span className="grid h-16 w-16 place-items-center rounded-full bg-ember text-white">
                  <Camera width={26} height={26} />
                </span>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Scrolling story column */}
        <div className="lg:col-span-7 lg:pt-10">
          <Reveal>
            <span className="accent-rule mb-5" />
            <p className="eyebrow mb-4 text-muted">About</p>
            <h2 id="about-title" className="display text-[clamp(3rem,7vw,6.4rem)]">
              Behind <span className="italic text-ember-deep">the lens</span>
            </h2>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink/80 md:text-xl">
              I’m a photographer drawn to real people, honest moments, and the beauty in between. Through a blend of natural light and
              thoughtful direction, I create images that feel alive. Photographs you’ll want to hold on to for years.
            </p>

            <AnimatePresence initial={false}>
              {more && (
                <motion.div
                  id={moreId}
                  initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="max-w-xl space-y-4 pt-6 text-base leading-relaxed text-muted md:text-lg">
                    <p>
                      Every session begins with a conversation. I want to know what matters to you, how you want to feel, and the little
                      details that make your story yours.
                    </p>
                    <p>On the day, I’ll guide where it helps and step back where it doesn’t, so the photographs feel like you on your best, most natural day.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <PillButton tone="ink" onClick={() => setMore((m) => !m)} aria-expanded={more} aria-controls={moreId}>
                {more ? 'Show less' : `Meet ${site.photographer}`}
              </PillButton>
              <p className="font-serif text-3xl italic text-ink/70">{site.photographer}</p>
            </div>
          </Reveal>

          <ol className="mt-20 border-t border-ink/15">
            {benefits.map(({ icon: Icon, title, text }, i) => (
              <Reveal as="li" key={title} delay={i * 0.08} className="group relative grid grid-cols-[auto_1fr] items-start gap-6 overflow-hidden border-b border-ink/15 py-8 sm:grid-cols-[4rem_1fr_auto] sm:items-center"
              >
                  <span
                    aria-hidden
                    className="absolute inset-0 -z-10 origin-left scale-x-0 bg-paper transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-x-100"
                  />
                  <span className="eyebrow pt-2 text-ember-deep sm:pt-0">0{i + 1}</span>
                  <span>
                    <span className="display block text-[clamp(1.8rem,3vw,2.6rem)] transition-transform duration-500 group-hover:translate-x-2">{title}</span>
                    <span className="mt-2 block max-w-md text-sm leading-relaxed text-muted">{text}</span>
                  </span>
                  <span className="col-start-2 grid h-14 w-14 place-items-center rounded-full ring-1 ring-inset ring-ink/20 transition-all duration-500 group-hover:rotate-12 group-hover:bg-ember group-hover:text-white group-hover:ring-ember sm:col-start-auto">
                    <Icon />
                  </span>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
