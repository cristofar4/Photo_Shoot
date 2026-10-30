import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState } from 'react'
import { PillButton } from '../components/Buttons'
import { Camera, People, Sun } from '../components/Icons'
import { Img } from '../components/Img'
import { NotchedSurface } from '../components/Notched'
import { Reveal } from '../components/Reveal'
import { sectionMedia } from '../config/media'
import { site } from '../config/site'

const benefits = [
  { icon: Camera, title: 'Authentic storytelling', text: 'Real moments, gently guided and never forced.' },
  { icon: People, title: 'A personal approach', text: 'Every session is shaped around you and your story.' },
  { icon: Sun, title: 'Natural light, always', text: 'Soft, honest light that flatters and lasts.' },
]

export function About() {
  const [more, setMore] = useState(false)
  const reduce = useReducedMotion()
  const moreId = useId()

  return (
    <section id="about" aria-labelledby="about-title" className="relative py-24 md:py-32">
      <div className="shell grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          <div className="group relative aspect-[4/5] overflow-hidden rounded-[999px_999px_2rem_2rem] bg-sand">
            <Img photo={sectionMedia.aboutPortrait} sizes="(min-width: 1024px) 38vw, 90vw" className="zoom-media absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -right-2 rounded-[1.5rem] bg-ink px-6 py-5 text-ivory shadow-xl sm:-right-6">
            <p className="eyebrow text-ivory/70">Behind the camera</p>
            <p className="mt-1 font-serif text-3xl">{site.photographer}</p>
          </div>
          <span aria-hidden className="absolute -left-3 top-10 hidden h-24 w-24 rounded-full border border-ember/50 lg:block" />
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7">
          <NotchedSurface
            corner="tr"
            radius={32}
            nw={92}
            nh={92}
            outer={20}
            className="p-7 sm:p-10 lg:p-14"
            slot={
              <span className="grid h-16 w-16 place-items-center rounded-full bg-ember text-white shadow-lg">
                <Camera width={26} height={26} />
              </span>
            }
          >
            <span className="accent-rule mb-5" />
            <p className="eyebrow mb-4 text-muted">About</p>
            <h2 id="about-title" className="display pr-16 text-[clamp(2.6rem,5.4vw,4.6rem)]">
              Behind the lens
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
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
                  <div className="max-w-xl space-y-4 pt-5 text-base leading-relaxed text-muted">
                    <p>
                      Every session begins with a conversation. I want to know what matters to you, how you want to feel, and the
                      little details that make your story yours.
                    </p>
                    <p>
                      On the day, I’ll guide where it helps and step back where it doesn’t, so the photographs feel like you on your
                      best, most natural day.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <PillButton tone="ink" onClick={() => setMore((m) => !m)} aria-expanded={more} aria-controls={moreId}>
                {more ? 'Show less' : `Meet ${site.photographer}`}
              </PillButton>
            </div>

            <ul className="mt-12 grid gap-6 border-t border-line pt-8 sm:grid-cols-3 sm:gap-0">
              {benefits.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className={`group flex gap-4 sm:flex-col sm:gap-3 sm:px-6 ${i === 0 ? 'sm:pl-0' : 'sm:border-l sm:border-line'}`}>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full ring-1 ring-inset ring-line transition-colors duration-300 group-hover:bg-ember group-hover:text-white group-hover:ring-ember">
                    <Icon />
                  </span>
                  <span>
                    <span className="eyebrow block text-ink">{title}</span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-muted">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </NotchedSurface>
        </Reveal>
      </div>
    </section>
  )
}
