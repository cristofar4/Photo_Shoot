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
  const sessionRef = useRef<HTMLSelectElement>(null)
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
        body: JSON.stringify({ ...fields, source: window.location.href }),
      })
      if (!res.ok) throw new Error(`The server responded with ${res.status}.`)
      setStatus({ kind: 'sent' })
      setFields(empty)
      setTouched({})
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' })
    }
  }

  return (
    <section id="contact" aria-labelledby="booking-title" className="relative py-16 md:py-24">
      <div className="shell">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-ink">
          <div className="absolute inset-0">
            <Img photo={sectionMedia.booking} sizes="100vw" className="h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-ink/20" />
          </div>

          <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-16 lg:p-16">
            <Reveal className="flex flex-col justify-end pt-24 text-ivory lg:pb-6 lg:pt-40">
              <span className="accent-rule mb-6" />
              <p className="eyebrow mb-4 text-ivory/75">Bookings</p>
              <h2 id="booking-title" className="display text-[clamp(2.8rem,6.4vw,5.6rem)]">
                Let’s create something timeless.
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-ivory/85 md:text-lg">
                Whether it’s a wedding, a portrait session, or a new story, I’d love to hear your vision and bring it to life through
                my lens.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <form noValidate onSubmit={submit} className="rounded-[2rem] bg-paper p-6 text-ink shadow-2xl sm:p-9" aria-describedby={demo ? 'demo-note' : undefined}>
                <h3 className="display text-4xl">Send an enquiry</h3>
                <p className="mt-2 text-sm text-muted">Tell me a little about your plans and I’ll be in touch soon.</p>

                {demo && (
                  <p id="demo-note" className="mt-5 rounded-2xl border border-ember/40 bg-ember/5 px-4 py-3 text-[0.8rem] leading-relaxed text-ink/80">
                    <strong className="font-semibold text-ember-deep">Demo mode.</strong> No form service is connected yet, so enquiries
                    are not sent. Set <code className="rounded bg-sand px-1">VITE_ENQUIRY_ENDPOINT</code> to enable delivery.
                  </p>
                )}

                <div className="mt-6 grid gap-4">
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
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="session" label="Session type" error={show('session')}>
                      <select
                        ref={sessionRef}
                        id="field-session"
                        name="session"
                        value={fields.session}
                        onChange={(e) => set('session', e.target.value as SessionType)}
                        onBlur={() => setTouched((t) => ({ ...t, session: true }))}
                        aria-invalid={!!show('session')}
                        aria-describedby={show('session') ? 'err-session' : undefined}
                        className={`${inputCls(!!show('session'))} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23191919%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:14px] bg-[right_1rem_center] bg-no-repeat pr-10`}
                      >
                        <option value="">Choose one</option>
                        {sessionTypes.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
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

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <PillButton tone="ink" type="submit" disabled={status.kind === 'sending'} aria-busy={status.kind === 'sending'} className="disabled:opacity-70">
                    {status.kind === 'sending' ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner width={14} height={14} /> Sending
                      </span>
                    ) : (
                      'Send enquiry'
                    )}
                  </PillButton>
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
                        Your enquiry could not be sent. {status.message} Please try again{site.contact.email ? <> or email <a className="underline" href={`mailto:${site.contact.email}`}>{site.contact.email}</a></> : null}.
                      </StatusNote>
                    )}
                    {status.kind === 'demo' && (
                      <StatusNote key="demo" tone="demo">
                        Everything looks good, but this form is in demo mode so nothing was sent. Connect a form endpoint to receive
                        enquiries.
                      </StatusNote>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </Reveal>
          </div>
        </div>
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
      <AnimatePresence>
        {error && (
          <motion.p
            id={`err-${id}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 text-[0.8rem] text-ember-deep"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
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
