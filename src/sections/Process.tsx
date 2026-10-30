import { motion, useReducedMotion } from 'motion/react'
import { SectionHeading } from '../components/Reveal'

const steps = [
  { title: 'Discover', text: 'We’ll chat about your vision, ideas, and what matters most to you.' },
  { title: 'Plan', text: 'I’ll help shape the details: location, timing, and creative direction.' },
  { title: 'Create', text: 'We bring it to life, capturing natural, meaningful moments together.' },
  { title: 'Deliver', text: 'You’ll receive a beautifully curated gallery to relive and share for years to come.' },
]

export function Process() {
  const reduce = useReducedMotion()
  return (
    <section aria-labelledby="process-title" className="py-24 md:py-32">
      <div className="shell">
        <SectionHeading
          id="process-title"
          eyebrow="The process"
          title="From first hello to final frame."
          aside={<p className="eyebrow max-w-[16rem] leading-relaxed text-muted">A simple, thoughtful process designed around you.</p>}
        />

        <ol className="relative mt-16 grid gap-10 md:mt-20 md:grid-cols-4 md:gap-6">
          {/* Connecting line: horizontal on desktop, vertical on mobile. */}
          <motion.span
            aria-hidden
            className="absolute left-8 top-8 hidden h-px origin-left bg-gradient-to-r from-ember/60 via-line to-line md:block"
            style={{ right: 'calc((100% - 4.5rem) / 4 - 2rem)' }}
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '0px 0px -20% 0px' }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          />
          <span aria-hidden className="absolute bottom-8 left-8 top-8 w-px bg-line md:hidden" />

          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              className="group relative flex gap-6 md:block"
              initial={reduce ? false : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -12% 0px' }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
                <span className="relative z-10 grid h-16 w-16 shrink-0 place-items-center rounded-full border border-line bg-ivory font-serif text-2xl text-ink transition-all duration-500 group-hover:border-ember group-hover:bg-ember group-hover:text-white">
                  {i + 1}
                  <span className="absolute -inset-2 rounded-full border border-ember/0 transition-all duration-700 group-hover:-inset-3 group-hover:border-ember/40" />
                </span>
                <div className="rounded-[1.75rem] border border-line bg-paper p-6 transition-all duration-500 md:mt-8 md:rounded-tl-none md:p-7 md:group-hover:-translate-y-1 md:group-hover:shadow-[0_24px_40px_-28px_rgb(25_25_25/0.45)]">
                  <p className="eyebrow text-ember-deep">Step 0{i + 1}</p>
                  <h3 className="display mt-3 text-4xl">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{s.text}</p>
                </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
