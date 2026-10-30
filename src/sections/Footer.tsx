import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useState } from 'react'
import { PillButton } from '../components/Buttons'
import { Dialog } from '../components/Dialog'
import { ArrowUp } from '../components/Icons'
import { nav, site } from '../config/site'

export function Footer({ onBook }: { onBook: () => void }) {
  const [privacy, setPrivacy] = useState<HTMLElement | null>(null)
  const socials = site.social.filter((s) => s.href)
  const { email, phone, location } = site.contact
  const { scrollYProgress } = useScroll()
  const ring = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const dash = useTransform(ring, (v) => `${v * 138} 138`)

  return (
    <footer className="relative mx-3 mb-3 mt-10 overflow-hidden rounded-[2.5rem] bg-espresso pt-20 text-ivory sm:mx-5 sm:mb-5">
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/3 h-[28rem] w-[28rem] rounded-full bg-ember/15 blur-3xl" />
      <div className="shell relative">
        <div className="flex flex-col gap-10 border-b border-white/10 pb-16 md:flex-row md:items-end md:justify-between">
          <h2 className="display max-w-2xl text-[clamp(2.6rem,6vw,5.6rem)]">
            Have a story in mind? <span className="italic text-[#f3c9a6]">Let’s tell it.</span>
          </h2>
          <PillButton tone="ember" size="lg" onClick={onBook}>
            Book a session
          </PillButton>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-3">
          <div>
            <p className="eyebrow mb-4 text-ivory/50">Explore</p>
            <ul className="space-y-2.5 text-ivory/80">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="group inline-flex items-center gap-2 transition-colors hover:text-ember">
                    <span className="h-px w-0 bg-ember transition-all duration-500 group-hover:w-4" />
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4 text-ivory/50">Contact</p>
            <ul className="space-y-2.5 text-ivory/80">
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="transition-colors hover:text-ember">{email}</a>
                </li>
              )}
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="transition-colors hover:text-ember">{phone}</a>
                </li>
              )}
              {location && <li>{location}</li>}
              <li>
                <a href="#contact" className="transition-colors hover:text-ember">Send an enquiry</a>
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4 text-ivory/50">Follow</p>
            <ul className="space-y-2.5 text-ivory/80">
              {socials.length > 0 ? (
                socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noreferrer noopener" className="transition-colors hover:text-ember">
                      {s.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))
              ) : (
                <li className="text-ivory/50">Social links coming soon</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <p aria-hidden className="display select-none whitespace-nowrap px-3 text-center text-[clamp(3.4rem,15.5vw,16rem)] leading-[0.8] text-transparent" style={{ WebkitTextStroke: '1px rgb(248 245 237 / 0.22)' }}>
        {site.name}
      </p>

      <div className="shell relative flex flex-col-reverse gap-6 border-t border-white/10 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="eyebrow text-ivory/50">
          © {new Date().getFullYear()} {site.name}. {site.tagline}
        </p>
        <div className="flex items-center gap-6">
          <button type="button" onClick={(e) => setPrivacy(e.currentTarget)} className="eyebrow text-ivory/60 transition-colors hover:text-ember">
            Privacy
          </button>
          <a href="#top" className="group inline-flex items-center gap-3" aria-label="Back to top">
            <span className="eyebrow hidden text-ivory/70 sm:inline">Back to top</span>
            <span className="relative grid h-12 w-12 place-items-center">
              <svg aria-hidden viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
                <circle cx="24" cy="24" r="22" fill="none" stroke="rgb(248 245 237 / 0.15)" strokeWidth="1.5" />
                <motion.circle cx="24" cy="24" r="22" fill="none" stroke="var(--color-ember)" strokeWidth="1.5" strokeLinecap="round" style={{ strokeDasharray: dash }} />
              </svg>
              <span className="relative block h-[18px] w-[18px] overflow-hidden">
                <ArrowUp width={18} height={18} className="absolute inset-0 transition-transform duration-500 group-hover:-translate-y-[150%]" />
                <ArrowUp width={18} height={18} className="absolute inset-0 translate-y-[150%] transition-transform duration-500 group-hover:translate-y-0" />
              </span>
            </span>
          </a>
        </div>
      </div>

      <Dialog open={!!privacy} onClose={() => setPrivacy(null)} title="Privacy" returnTo={privacy}>
        <div className="space-y-4 text-base leading-relaxed text-muted">
          <p>
            When you send an enquiry, the details you share (your name, email, session type, preferred date and message) are used only
            to reply to you and plan your session.
          </p>
          <p>This site does not use advertising trackers. Your details are never sold or shared for marketing.</p>
          <p className="rounded-2xl bg-sand p-4 text-sm">
            Studio owner: review this notice and add the form provider you connect, how long enquiries are kept, and how visitors can
            ask for their data to be removed.
          </p>
        </div>
      </Dialog>
    </footer>
  )
}
