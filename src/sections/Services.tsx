import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useState } from 'react'
import { CircleButton, PillButton } from '../components/Buttons'
import { Dialog } from '../components/Dialog'
import { Book, Check, Play } from '../components/Icons'
import { Img } from '../components/Img'
import { NotchedMedia } from '../components/Notched'
import { Reveal, SectionHeading } from '../components/Reveal'
import { sectionMedia } from '../config/media'
import { services, type Service, type SessionType } from '../config/services'
import type { OpenGallery } from '../lib/gallery-events'
import { useFinePointer, useMediaQuery } from '../lib/hooks'

type Props = {
  onEnquire: (s: SessionType) => void
  onOpenGallery: OpenGallery
  onPlayFilm: (trigger: HTMLElement | null) => void
}

export function Services({ onEnquire, onOpenGallery, onPlayFilm }: Props) {
  const [active, setActive] = useState<Service['id']>('weddings')
  const [detail, setDetail] = useState<{ service: Service; trigger: HTMLElement | null } | null>(null)
  const desktop = useMediaQuery('(min-width: 1024px)')

  const primary = (s: Service, el: HTMLElement) =>
    s.id === 'film' ? onPlayFilm(el) : onOpenGallery({ chapter: s.chapter!, trigger: el, from: el.closest('[data-panel]') as HTMLElement })

  return (
    <section id="services" aria-labelledby="services-title" className="py-24 md:py-36">
      <div className="shell">
        <SectionHeading
          id="services-title"
          eyebrow="Services"
          title="Made around your story."
          intro="Thoughtfully crafted photography for the moments that matter. Choose a service to see what it includes."
          aside={
            <ul className="flex gap-2" aria-hidden>
              {services.map((s) => (
                <li key={s.id} className={`h-1.5 rounded-full transition-all duration-700 ease-[var(--ease-lux)] ${active === s.id ? 'w-12 bg-ember' : 'w-4 bg-line'}`} />
              ))}
            </ul>
          }
        />

        <Reveal className="mt-14 md:mt-20">
          <div className={`flex gap-3 ${desktop ? 'h-[min(82vh,44rem)] flex-row' : 'flex-col'}`}>
            {services.map((s) => (
              <Panel
                key={s.id}
                service={s}
                active={active === s.id}
                desktop={desktop}
                onActivate={() => setActive(s.id)}
                onEnquire={() => onEnquire(s.session)}
                onDetails={(el) => setDetail({ service: s, trigger: el })}
                onPrimary={(el) => primary(s, el)}
              />
            ))}
          </div>
        </Reveal>
      </div>

      <Dialog open={!!detail} onClose={() => setDetail(null)} title={detail?.service.title ?? ''} returnTo={detail?.trigger}>
        {detail && (
          <ServiceDetail
            service={detail.service}
            onEnquire={() => {
              const s = detail.service.session
              setDetail(null)
              // Let the dialog unlock scrolling before moving to the form.
              window.setTimeout(() => onEnquire(s), 320)
            }}
            onGallery={
              detail.service.chapter
                ? () => {
                    const chapter = detail.service.chapter!
                    const trigger = detail.trigger
                    setDetail(null)
                    window.setTimeout(() => onOpenGallery({ chapter, trigger }), 320)
                  }
                : undefined
            }
            onFilm={
              detail.service.id === 'film'
                ? () => {
                    const trigger = detail.trigger
                    setDetail(null)
                    window.setTimeout(() => onPlayFilm(trigger), 320)
                  }
                : undefined
            }
          />
        )}
      </Dialog>
    </section>
  )
}

/**
 * One service as a photographic panel. On desktop panels sit side by side and
 * the chosen one widens; on phones they stack and the chosen one grows taller.
 */
function Panel({
  service,
  active,
  desktop,
  onActivate,
  onEnquire,
  onDetails,
  onPrimary,
}: {
  service: Service
  active: boolean
  desktop: boolean
  onActivate: () => void
  onEnquire: () => void
  onDetails: (el: HTMLElement) => void
  onPrimary: (el: HTMLElement) => void
}) {
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const id = useId()
  const photo = sectionMedia.services[service.id]
  const notch = active ? (desktop ? { nw: 128, nh: 128 } : { nw: 104, nh: 104 }) : { nw: 0, nh: 0 }
  const primaryLabel = service.id === 'film' ? 'Play the film' : `Open the ${service.eyebrow.toLowerCase()} album`

  return (
    <div
      data-panel
      className="relative min-w-0 transition-[flex-grow,height] duration-[900ms] ease-[var(--ease-lux)]"
      style={desktop ? { flexGrow: active ? 3.4 : 1, flexBasis: 0, minWidth: '6rem' } : { height: active ? '36rem' : '6.5rem' }}
      onPointerEnter={() => fine && desktop && onActivate()}
    >
      <NotchedMedia corner="br" radius={32} {...notch} outer={active ? 24 : 0} className="h-full w-full bg-espresso">
        <Img
          photo={photo}
          sizes={desktop ? '60vw' : '100vw'}
          className={`absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-[1200ms] ease-[var(--ease-lux)] ${active ? 'scale-100 grayscale-0' : 'scale-110 grayscale-[60%]'}`}
        />
        <div className={`absolute inset-0 transition-opacity duration-700 ${active ? 'bg-gradient-to-t from-espresso via-espresso/45 to-espresso/5' : 'bg-espresso/65'}`} />

        {/* Collapsed label */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${active ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
          {desktop ? (
            <div className="flex h-full flex-col items-center justify-between py-8 text-ivory">
              <span className="eyebrow text-ember">{service.number}</span>
              <span className="display text-4xl [writing-mode:vertical-rl] rotate-180">{service.eyebrow}</span>
              <span className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-inset ring-white/30">
                <span className="h-1.5 w-1.5 rounded-full bg-ember" />
              </span>
            </div>
          ) : (
            <div className="flex h-full items-center justify-between px-6 text-ivory">
              <span className="flex items-baseline gap-4">
                <span className="eyebrow text-ember">{service.number}</span>
                <span className="display text-3xl">{service.eyebrow}</span>
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-inset ring-white/30">+</span>
            </div>
          )}
        </div>

        {!active && (
          <button
            type="button"
            onClick={onActivate}
            aria-expanded={false}
            aria-controls={id}
            aria-label={`Show ${service.eyebrow.toLowerCase()} service`}
            className="absolute inset-0 z-10 rounded-[32px]"
          />
        )}

        {/* Expanded content */}
        <AnimatePresence>
          {active && (
            <motion.div
              id={id}
              className="absolute inset-0 flex flex-col justify-end p-6 text-ivory sm:p-9 lg:p-12"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.7, delay: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ paddingRight: desktop ? notch.nw : 0 }}>
                <Meta service={service} light />
                <h3 className="display mt-4 max-w-xl text-[clamp(2.6rem,5.4vw,5.2rem)]">{service.title}</h3>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-ivory/85 md:text-lg">{service.summary}</p>
                <div className="mt-6 hidden sm:block">
                  <Tags tags={service.tags} light />
                </div>
                {desktop && (
                  <ul className="mt-7 grid max-w-xl grid-cols-2 gap-x-8 gap-y-2.5">
                    {service.includes.map((i) => (
                      <li key={i} className="flex gap-2.5 text-sm leading-snug text-ivory/80">
                        <Check width={17} height={17} className="mt-px shrink-0 text-ember" />
                        {i}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-8 flex flex-wrap gap-3" style={{ paddingRight: desktop ? 0 : notch.nw }}>
                  <PillButton tone="ember" onClick={onEnquire}>
                    Enquire
                  </PillButton>
                  <PillButton tone="glass" onClick={(e) => onDetails(e.currentTarget)} aria-label={`${service.cta}: full details`}>
                    {desktop ? service.cta : 'Details'}
                  </PillButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </NotchedMedia>

      {active && (
        <div className="absolute bottom-0 right-0 z-10 grid place-items-center" style={{ width: notch.nw, height: notch.nh }}>
          <CircleButton
            label={primaryLabel}
            onClick={(e) => onPrimary(e.currentTarget)}
            size={desktop ? 84 : 68}
            icon={service.id === 'film' ? <Play width={26} height={26} className="translate-x-0.5" /> : <Book width={26} height={26} />}
          />
        </div>
      )}
    </div>
  )
}

function Meta({ service, light = false }: { service: Service; light?: boolean }) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${light ? 'text-ivory/70' : 'text-muted'}`}>
      <span className={light ? 'text-ember' : 'text-ember-deep'}>{service.number}</span>
      <span aria-hidden className={`h-3 w-px ${light ? 'bg-white/30' : 'bg-line'}`} />
      {service.eyebrow}
    </p>
  )
}

function Tags({ tags, light = false }: { tags: string[]; light?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <li
          key={t}
          className={`rounded-full px-4 py-2 text-[0.8rem] transition-colors duration-300 ${
            light ? 'bg-white/10 text-ivory ring-1 ring-inset ring-white/20 backdrop-blur-md hover:bg-ivory hover:text-ink' : 'bg-sand text-ink/80 hover:bg-ink hover:text-ivory'
          }`}
        >
          {t}
        </li>
      ))}
    </ul>
  )
}

function ServiceDetail({
  service,
  onEnquire,
  onGallery,
  onFilm,
}: {
  service: Service
  onEnquire: () => void
  onGallery?: () => void
  onFilm?: () => void
}) {
  const photo = sectionMedia.services[service.id]
  return (
    <div>
      <Meta service={service} />
      <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-[1.5rem] bg-sand">
        <Img photo={photo} sizes="(min-width: 640px) 40rem, 100vw" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <p className="mt-6 text-base leading-relaxed text-muted">{service.summary}</p>
      <p className="mt-4 font-serif text-2xl italic leading-snug text-ink">{service.approach}</p>
      <h3 className="eyebrow mt-8 text-ink">What’s included</h3>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {service.includes.map((i) => (
          <li key={i} className="flex gap-3 text-sm leading-snug text-ink/80">
            <Check width={18} height={18} className="mt-px shrink-0 text-ember" />
            {i}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Tags tags={service.tags} />
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <PillButton tone="ember" onClick={onEnquire}>
          Enquire about {service.eyebrow.toLowerCase()}
        </PillButton>
        {onGallery && (
          <PillButton tone="outline" onClick={onGallery}>
            Open the album
          </PillButton>
        )}
        {onFilm && (
          <PillButton tone="outline" onClick={onFilm}>
            Watch the film
          </PillButton>
        )}
      </div>
    </div>
  )
}
