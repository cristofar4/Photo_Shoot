import { useState } from 'react'
import { Dialog } from '../components/Dialog'
import { ArrowUp } from '../components/Icons'
import { nav, site } from '../config/site'

export function Footer() {
  const [privacy, setPrivacy] = useState<HTMLElement | null>(null)
  const socials = site.social.filter((s) => s.href)
  const { email, phone, location } = site.contact

  return (
    <footer className="border-t border-line pb-10 pt-16">
      <div className="shell">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div>
            <a href="#top" className="font-serif text-3xl uppercase tracking-[0.2em]">
              {site.name}
            </a>
            <p className="eyebrow mt-4 text-muted">{site.tagline}</p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 md:gap-16">
            <div>
              <p className="eyebrow mb-4 text-ink">Explore</p>
              <ul className="space-y-2.5 text-sm text-muted">
                {nav.map((n) => (
                  <li key={n.href}>
                    <a href={n.href} className="transition-colors hover:text-ember-deep">
                      {n.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4 text-ink">Contact</p>
              <ul className="space-y-2.5 text-sm text-muted">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className="transition-colors hover:text-ember-deep">
                      {email}
                    </a>
                  </li>
                )}
                {phone && (
                  <li>
                    <a href={`tel:${phone.replace(/\s+/g, '')}`} className="transition-colors hover:text-ember-deep">
                      {phone}
                    </a>
                  </li>
                )}
                {location && <li>{location}</li>}
                <li>
                  <a href="#contact" className="transition-colors hover:text-ember-deep">
                    Send an enquiry
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4 text-ink">Follow</p>
              <ul className="space-y-2.5 text-sm text-muted">
                {socials.length > 0 ? (
                  socials.map((s) => (
                    <li key={s.label}>
                      <a href={s.href} target="_blank" rel="noreferrer noopener" className="transition-colors hover:text-ember-deep">
                        {s.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))
                ) : (
                  <li>Social links coming soon</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="eyebrow text-muted">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button type="button" onClick={(e) => setPrivacy(e.currentTarget)} className="eyebrow text-muted transition-colors hover:text-ember-deep">
              Privacy
            </button>
            <a
              href="#top"
              className="group inline-flex items-center gap-3 text-ink"
              aria-label="Back to top"
            >
              <span className="eyebrow hidden sm:inline">Back to top</span>
              <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-ink text-ivory transition-colors duration-300 group-hover:bg-ember">
                <span className="relative block h-[18px] w-[18px] overflow-hidden">
                  <ArrowUp width={18} height={18} className="absolute inset-0 transition-transform duration-500 group-hover:-translate-y-[150%]" />
                  <ArrowUp width={18} height={18} className="absolute inset-0 translate-y-[150%] transition-transform duration-500 group-hover:translate-y-0" />
                </span>
              </span>
            </a>
          </div>
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
