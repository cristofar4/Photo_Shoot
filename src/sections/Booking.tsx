import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { PillButton } from '../components/Buttons'
import { Check, Spinner } from '../components/Icons'
import { Img } from '../components/Img'
import { Reveal } from '../components/Reveal'
import { sectionMedia } from '../config/media'
import { sessionTypes, type SessionType } from '../config/services'
import { site } from '../config/site'

type Fields = { name: string; email: string; session: SessionType | ''; date: string; message: string }
type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string } | { kind: 'demo' }

const empty: Fields = { name: '', email: '', session: '', date: '', message: '' }

function validate(f: Fields) {
  const e: Partial<Record<keyof Fields, string>> = {}
  if (f.name.trim().length < 2) e.name = 'Please tell me your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Please enter a valid email address.'
  if (!f.session) e.session = 'Choose the kind of session you have in mind.'
  if (f.date && f.date < today()) e.date = 'Please choose a date from today onwards.'
  if (f.message.trim().length < 10) e.message = 'A few words about your plans helps me prepare (10 characters or more).'
  return e
}

const today = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

/**
 * Enquiry form. POSTs JSON to `site.enquiryEndpoint`. A success message is
 * only shown when that request returns a 2xx response; with no endpoint the
 * form runs in clearly labelled demo mode and sends nothing.
 */
export function Booking({ preset, presetKey }: { preset: SessionType | null; presetKey: number }) {
  const [fields, setFields] = useState<Fields>(empty)
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const errors = validate(fields)
  const nameRef = useRef<HTMLInputElement>(null)
  const honeypot = useRef<HTMLInputElement>(null)
  const sessionRef = useRef<HTMLInputElement>(null)
  const demo = !site.enquiryEndpoint

  useEffect(() => {
    if (!preset) return
    setFields((f) => ({ ...f, session: preset }))
    setStatus({ kind: 'idle' })
  }, [preset, presetKey])

  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => setFields((f) => ({ ...f, [k]: v }))
  const show = (k: keyof Fields) => (touched[k] ? errors[k] : undefined)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched({ name: true, email: true, session: true, date: true, message: true })
    const firstError = (Object.keys(errors) as (keyof Fields)[])[0]
    if (firstError) {
      document.getElementById(`field-${firstError}`)?.focus()
      return
    }
    if (demo) {
      setStatus({ kind: 'demo' })
      return
    }
    setStatus({ kind: 'sending' })
    try {
      const res = await fetch(site.enquiryEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...fields, company: honeypot.current?.value ?? '', source: window.location.href }),
      })
      if (!res.ok) {
        const detail = await res.json().catch(() => null)
        throw new Error(detail?.error ?? `The server responded with ${res.status}.`)
      }
      setStatus({ kind: 'sent' })
      setFields(empty)
      setTouched({})
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' })
    }
  }

  return (
    <section id="contact" aria-labelledby="booking-title" className="relative py-24 md:py-32">
      <div className="shell grid gap-4 lg:grid-cols-[1fr_1.05fr]">
        {/* Image panel */}
        <Reveal className="relative min-h-[30rem] overflow-hidden rounded-[2.5rem] bg-espresso text-ivory">
          <Img photo={sectionMedia.booking} sizes="(min-width: 1024px) 48vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/40 to-espresso/10" />
          <div className="relative flex h-full flex-col justify-between gap-16 p-8 sm:p-12">
            <p className="eyebrow flex w-max items-center gap-3 rounded-full bg-white/10 px-4 py-2 ring-1 ring-inset ring-white/20 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-ember" /> Bookings open
            </p>
            <div>
              <h2 id="booking-title" className="display text-[clamp(3rem,6.4vw,6rem)]">
                Let’s create <span className="italic text-[#f3c9a6]">something timeless.</span>
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-ivory/85 md:text-lg">
                Whether it’s a wedding, a portrait session, or a new story, I’d love to hear your vision and bring it to life through my lens.
              </p>
              {(site.contact.email || site.contact.phone) && (
                <ul className="mt-8 flex flex-wrap gap-2 text-sm">
                  {site.contact.email && (
                    <li>
                      <a className="rounded-full bg-white/10 px-4 py-2 ring-1 ring-inset ring-white/20 transition hover:bg-ivory hover:text-ink" href={`mailto:${site.contact.email}`}>
                        {site.contact.email}
                      </a>
                    </li>
                  )}
                  {site.contact.phone && (
                    <li>
                      <a className="rounded-full bg-white/10 px-4 py-2 ring-1 ring-inset ring-white/20 transition hover:bg-ivory hover:text-ink" href={`tel:${site.contact.phone.replace(/\s+/g, '')}`}>
                        {site.contact.phone}
                      </a>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </Reveal>

        {/* Form panel */}
        <Reveal delay={0.08}>
          <form noValidate onSubmit={submit} className="relative h-full rounded-[2.5rem] border border-line bg-paper p-6 sm:p-10" aria-describedby={demo ? 'demo-note' : undefined}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="display text-[2.6rem]">Send an enquiry</h3>
                <p className="mt-2 text-sm text-muted">Tell me a little about your plans and I’ll be in touch soon.</p>
              </div>
              <span aria-hidden className="hidden h-14 w-14 shrink-0 place-items-center rounded-full bg-ember/10 font-serif text-2xl italic text-ember-deep sm:grid">P</span>
            </div>

            {demo && (
              <p id="demo-note" className="mt-6 rounded-2xl border border-dashed border-ember/50 bg-ember/5 px-4 py-3 text-[0.8rem] leading-relaxed text-ink/80">
                <strong className="font-semibold text-ember-deep">Demo mode.</strong> No form service is connected yet, so enquiries are not sent. Set{' '}
                <code className="rounded bg-sand px-1">VITE_ENQUIRY_ENDPOINT</code> to enable delivery.
              </p>
            )}

            {/* Spam trap: hidden from people, often filled in by bots. */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Company
                <input ref={honeypot} type="text" name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <fieldset className="mt-8">
              <legend className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink/80">Session type</legend>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-invalid={!!show('session')} aria-describedby={show('session') ? 'err-session' : undefined}>
                {sessionTypes.map((t, i) => {
                  const checked = fields.session === t
                  return (
                    <label
                      key={t}
                      className={`relative cursor-pointer select-none rounded-full px-4 py-2.5 text-sm transition-all duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember active:scale-95 ${
                        checked ? 'bg-ink text-ivory shadow-[0_10px_22px_-12px_rgb(25_25_25/0.7)]' : 'bg-clay/60 text-ink/80 hover:bg-clay'
                      }`}
                    >
                      <input
                        ref={i === 0 ? (sessionRef as never) : undefined}
                        id={i === 0 ? 'field-session' : undefined}
                        type="radio"
                        name="session"
                        value={t}
                        checked={checked}
                        onChange={() => {
                          set('session', t)
                          setTouched((x) => ({ ...x, session: true }))
                        }}
                        className="sr-only"
                      />
                      {checked && <Check width={14} height={14} className="-ml-1 mr-1.5 inline text-ember" />}
                      {t}
                    </label>
                  )
                })}
              </div>
              <FieldError id="session" error={show('session')} />
            </fieldset>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Name" error={show('name')}>
                <input
                  ref={nameRef}
                  id="field-name"
                  name="name"
                  autoComplete="name"
                  value={fields.name}
                  onChange={(e) => set('name', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  aria-invalid={!!show('name')}
                  aria-describedby={show('name') ? 'err-name' : undefined}
                  className={inputCls(!!show('name'))}
                />
              </Field>
              <Field id="email" label="Email" error={show('email')}>
                <input
                  id="field-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={fields.email}
                  onChange={(e) => set('email', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  aria-invalid={!!show('email')}
                  aria-describedby={show('email') ? 'err-email' : undefined}
                  className={inputCls(!!show('email'))}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field id="date" label="Preferred date" hint="Optional" error={show('date')}>
                <input
                  id="field-date"
                  name="date"
                  type="date"
                  min={today()}
                  value={fields.date}
                  onChange={(e) => set('date', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, date: true }))}
                  aria-invalid={!!show('date')}
                  aria-describedby={show('date') ? 'err-date' : undefined}
                  className={inputCls(!!show('date'))}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field id="message" label="Message" error={show('message')}>
                <textarea
                  id="field-message"
                  name="message"
                  rows={4}
                  value={fields.message}
                  onChange={(e) => set('message', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                  aria-invalid={!!show('message')}
                  aria-describedby={show('message') ? 'err-message' : undefined}
                  className={`${inputCls(!!show('message'))} h-auto resize-y py-3`}
                />
              </Field>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <PillButton tone="ember" size="lg" type="submit" disabled={status.kind === 'sending'} aria-busy={status.kind === 'sending'} className="disabled:opacity-70">
                {status.kind === 'sending' ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner width={14} height={14} /> Sending
                  </span>
                ) : (
                  'Send enquiry'
                )}
              </PillButton>
              <p className="text-xs text-muted">All fields except the date are required.</p>
            </div>

            <div aria-live="polite" className="mt-5">
              <AnimatePresence mode="wait">
                {status.kind === 'sent' && (
                  <StatusNote key="sent" tone="ok">
                    <Check width={18} height={18} /> Thank you, your enquiry has been sent. I’ll reply as soon as I can.
                  </StatusNote>
                )}
                {status.kind === 'error' && (
                  <StatusNote key="err" tone="error">
                    Your enquiry could not be sent. {status.message} Please try again
                    {site.contact.email ? (
                      <>
                        {' '}or email <a className="underline" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
                      </>
                    ) : null}
                    .
                  </StatusNote>
                )}
                {status.kind === 'demo' && (
                  <StatusNote key="demo" tone="demo">
                    Everything looks good, but this form is in demo mode so nothing was sent. Connect a form endpoint to receive enquiries.
                  </StatusNote>
                )}
              </AnimatePresence>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  )
}

const inputCls = (invalid: boolean) =>
  `h-12 w-full rounded-xl border bg-white/70 px-4 text-[0.95rem] text-ink outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-mist focus:border-ink focus:shadow-[0_0_0_4px_rgb(198_83_19/0.15)] ${
    invalid ? 'border-ember-deep' : 'border-line hover:border-mist'
  }`

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  const hid = useId()
  return (
    <div>
      <label htmlFor={`field-${id}`} className="mb-1.5 flex items-baseline justify-between text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink/80">
        {label}
        {hint && (
          <span id={hid} className="font-normal normal-case tracking-normal text-muted">
            {hint}
          </span>
        )}
      </label>
      {children}
      <FieldError id={id} error={error} />
    </div>
  )
}

function FieldError({ id, error }: { id: string; error?: string }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p id={`err-${id}`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-[0.8rem] text-ember-deep">
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

function StatusNote({ tone, children }: { tone: 'ok' | 'error' | 'demo'; children: React.ReactNode }) {
  const cls = {
    ok: 'bg-[#e8efe3] text-[#2f4a24] border-[#b9cdb0]',
    error: 'bg-ember/8 text-ember-deep border-ember/40',
    demo: 'bg-sand text-ink/80 border-line',
  }[tone]
  return (
    <motion.p
      role={tone === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm leading-relaxed ${cls}`}
    >
      {children}
    </motion.p>
  )
}
