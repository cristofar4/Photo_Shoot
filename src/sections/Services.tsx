import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useRef, useState, type PointerEvent } from 'react'
import { CircleButton, PillButton, SlidingArrow } from '../components/Buttons'
import { Dialog } from '../components/Dialog'
import { Check, Play } from '../components/Icons'
import { DemoBadge, Img } from '../components/Img'
import { site } from '../config/site'
import { NotchedMedia, NotchedSurface } from '../components/Notched'
import { Reveal, SectionHeading } from '../components/Reveal'
import { sectionMedia, videos } from '../config/media'
import { services, type Service, type SessionType } from '../config/services'
import type { OpenGallery } from '../lib/gallery-events'
import { useFinePointer, useMediaQuery } from '../lib/hooks'

type Props = {
  onEnquire: (s: SessionType) => void
  onOpenGallery: OpenGallery
  onPlayFilm: (trigger: HTMLElement | null) => void
}

const byId = (id: Service['id']) => services.find((s) => s.id === id)!

export function Services({ onEnquire, onOpenGallery, onPlayFilm }: Props) {
  const [detail, setDetail] = useState<{ service: Service; trigger: HTMLElement | null } | null>(null)
  const open = (service: Service) => (e: { currentTarget: HTMLElement }) => setDetail({ service, trigger: e.currentTarget })

  return (
    <section id="services" aria-labelledby="services-title" className="py-24 md:py-36">
      <div className="shell">
        <SectionHeading
          id="services-title"
          eyebrow="Services"
          title="Made around your story."
          intro="Thoughtfully crafted photography for the moments that matter."
        />

        <div className="mt-14 flex flex-col gap-6 md:mt-20 md:gap-8">
          <Reveal>
            <FeaturedWedding service={byId('weddings')} onExplore={open(byId('weddings'))} />
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            <Reveal delay={0.05} className="h-full">
              <PortraitService service={byId('portraits')} onExplore={open(byId('portraits'))} />
            </Reveal>
            <Reveal delay={0.12} className="h-full">
              <FilmService service={byId('film')} onExplore={open(byId('film'))} onPlay={(e) => onPlayFilm(e.currentTarget)} />
            </Reveal>
          </div>
        </div>
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

function Meta({ service, light = false }: { service: Service; light?: boolean }) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${light ? 'text-ivory/70' : 'text-muted'}`}>
      <span className="text-ember-deep">{service.number}</span>
      <span aria-hidden className="h-3 w-px bg-line" />
      {service.eyebrow}
    </p>
  )
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <li key={t} className="rounded-full bg-sand px-4 py-2 text-[0.8rem] text-ink/80 transition-colors duration-300 hover:bg-ink hover:text-ivory">
          {t}
        </li>
      ))}
    </ul>
  )
}

function FeaturedWedding({ service, onExplore }: { service: Service; onExplore: (e: { currentTarget: HTMLElement }) => void }) {
  const wide = useMediaQuery('(min-width: 1024px)')
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const notch = wide ? { nw: 172, nh: 172 } : { nw: 132, nh: 132 }

  // Gentle parallax on the photograph following the pointer.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 120, damping: 20 })
  const sy = useSpring(py, { stiffness: 120, damping: 20 })
  const frame = useRef<HTMLDivElement>(null)
  const onMove = (e: PointerEvent) => {
    if (!fine || reduce || !frame.current) return
    const r = frame.current.getBoundingClientRect()
    px.set(((e.clientX - r.left) / r.width - 0.5) * -18)
    py.set(((e.clientY - r.top) / r.height - 0.5) * -18)
  }

  return (
    <NotchedSurface
      corner="br"
      radius={36}
      {...notch}
      outer={26}
      className="group grid gap-3 p-3 lg:grid-cols-[1.2fr_1fr]"
      slot={<CircleButton label={`${service.cta}: details`} onClick={onExplore} size={wide ? 84 : 66} ring={wide ? 'Explore weddings · For your forever · ' : undefined} />}
    >
      <div
        ref={frame}
        onPointerMove={onMove}
        onPointerLeave={() => {
          px.set(0)
          py.set(0)
        }}
        className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sand lg:aspect-auto lg:min-h-[36rem]"
      >
        <motion.div className="absolute -inset-4" style={{ x: sx, y: sy }}>
          <Img photo={sectionMedia.services.weddings} badge={false} sizes="(min-width: 1024px) 55vw, 100vw" className="zoom-media h-full w-full object-cover" />
        </motion.div>
        {sectionMedia.services.weddings.demo && site.showDemoBadges && <DemoBadge className="left-5 top-5" />}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/40 to-transparent" />
        <p className="eyebrow absolute bottom-6 left-6 text-ivory">Featured service</p>
      </div>

      <div className="flex flex-col px-5 pb-8 pt-8 sm:px-8 lg:px-12 lg:pt-14">
        <Meta service={service} />
        <h3 className="display mt-6 text-[clamp(3rem,6vw,5.4rem)]">{service.title}</h3>
        <p className="mt-6 max-w-md text-base leading-relaxed text-muted md:text-lg">{service.summary}</p>
        <div className="mt-8">
          <Tags tags={service.tags} />
        </div>
        <ul className="mt-10 grid gap-x-8 gap-y-3 border-t border-line pt-8 sm:grid-cols-2">
          {service.includes.map((i) => (
            <li key={i} className="flex gap-3 text-sm leading-snug text-ink/80">
              <Check width={18} height={18} className="mt-px shrink-0 text-ember" />
              {i}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-end pt-10" style={{ paddingRight: notch.nw, minHeight: notch.nh + 24 }}>
          <button type="button" onClick={onExplore} className="group/btn inline-flex items-center gap-3 font-serif text-2xl" tabIndex={-1} aria-hidden>
            <span className="relative">
              {service.cta}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-[0.3] bg-ember transition-transform duration-500 group-hover:scale-x-100" />
            </span>
          </button>
        </div>
      </div>
    </NotchedSurface>
  )
}

function PortraitService({ service, onExplore }: { service: Service; onExplore: (e: { currentTarget: HTMLElement }) => void }) {
  return (
    <article className="group flex h-full flex-col rounded-[2.25rem] border border-line bg-paper p-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] rounded-tr-[clamp(6rem,14vw,11rem)] bg-sand">
        <Img photo={sectionMedia.services.portraits} sizes="(min-width: 768px) 45vw, 100vw" className="zoom-media absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col px-5 pb-6 pt-8 sm:px-8">
        <Meta service={service} />
        <h3 className="display mt-5 text-[clamp(2.4rem,4.2vw,3.6rem)]">{service.title}</h3>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted">{service.summary}</p>
        <div className="mt-6">
          <Tags tags={service.tags} />
        </div>
        <div className="mt-auto pt-10">
          <PillButton tone="ink" onClick={onExplore}>
            {service.cta}
          </PillButton>
        </div>
      </div>
    </article>
  )
}

function FilmService({
  service,
  onExplore,
  onPlay,
}: {
  service: Service
  onExplore: (e: { currentTarget: HTMLElement }) => void
  onPlay: (e: { currentTarget: HTMLElement }) => void
}) {
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const video = useRef<HTMLVideoElement>(null)
  const [previewing, setPreviewing] = useState(false)
  const start = () => {
    if (!fine || reduce || !video.current) return
    setPreviewing(true)
    video.current.play().catch(() => setPreviewing(false))
  }
  const stop = () => {
    video.current?.pause()
    setPreviewing(false)
  }
  const clip = videos.filmService

  return (
    <article className="group h-full" onPointerEnter={start} onPointerLeave={stop}>
      <div className="flex h-full flex-col rounded-[2.25rem] border border-line bg-paper p-3">
        <div className="relative">
          <NotchedMedia corner="br" radius={28} nw={108} nh={108} outer={24} className="aspect-[4/3] bg-ink">
            <Img photo={sectionMedia.services.film} sizes="(min-width: 768px) 45vw, 100vw" className="zoom-media absolute inset-0 h-full w-full object-cover" />
            <video
              ref={video}
              src={fine ? clip.src : undefined}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${previewing ? 'opacity-100' : 'opacity-0'}`}
            />
            <p className="eyebrow absolute left-5 top-5 rounded-full bg-ink/50 px-3 py-1.5 text-[0.6rem] text-ivory backdrop-blur">
              {previewing ? 'Preview playing' : fine ? 'Hover to preview' : 'Tap play to watch'}
            </p>
          </NotchedMedia>
          <div className="absolute bottom-0 right-0 grid h-[108px] w-[108px] place-items-center">
            <CircleButton label="Play the film" icon={<Play width={24} height={24} className="translate-x-0.5" />} onClick={onPlay} size={76} />
          </div>
        </div>
        <div className="flex flex-1 flex-col px-5 pb-6 pt-8 sm:px-8">
          <Meta service={service} />
          <h3 className="display mt-5 text-[clamp(2.4rem,4.2vw,3.6rem)]">{service.title}</h3>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">{service.summary}</p>
          <div className="mt-6">
            <Tags tags={service.tags} />
          </div>
          <div className="mt-auto flex items-center gap-5 pt-10">
            <button
              type="button"
              onClick={onExplore}
              className="group/btn inline-flex items-center gap-5 font-serif text-2xl text-ink active:scale-[0.98]"
            >
              {service.cta}
              <span className="grid h-14 w-14 place-items-center rounded-full text-ember-deep ring-1 ring-inset ring-ember/70 transition-colors duration-300 group-hover/btn:bg-ember group-hover/btn:text-white group-focus-visible/btn:bg-ember group-focus-visible/btn:text-white">
                <SlidingArrow diagonal />
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
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
