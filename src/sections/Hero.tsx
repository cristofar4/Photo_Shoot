import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { PillButton, RotatingText } from '../components/Buttons'
import { ArrowRight, Pause, Play, VolumeOff, VolumeOn } from '../components/Icons'
import { Img } from '../components/Img'
import { NotchedMedia } from '../components/Notched'
import { useAmbientVideo } from '../components/VideoFrame'
import { chapters } from '../config/gallery'
import { videos } from '../config/media'
import { preloadBook, type OpenGallery } from '../lib/gallery-events'
import { useMediaQuery } from '../lib/hooks'

const words = ['Moments', 'worth', 'keeping.']
const ease = [0.22, 1, 0.36, 1] as const

export function Hero({ onOpen, onPlayFilm }: { onOpen: OpenGallery; onPlayFilm: (t: HTMLElement | null) => void }) {
  const reduce = useReducedMotion()
  const { video, controls, progress } = useAmbientVideo(videos.hero)
  const smooth = useSpring(progress, { stiffness: 80, damping: 20 })
  const bar = useTransform(smooth, (v) => `scaleX(${v})`)
  const wide = useMediaQuery('(min-width: 768px)')
  const notch = wide ? { nw: 172, nh: 172 } : { nw: 118, nh: 118 }

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease },
  })

  return (
    <section id="top" aria-labelledby="hero-title" className="relative px-3 pt-3 sm:px-5 sm:pt-4">
      <motion.div
        className="relative h-[calc(100svh-1.5rem)] min-h-[40rem] sm:h-[calc(100svh-2rem)]"
        initial={reduce ? false : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease }}
      >
        <NotchedMedia corner="br" radius={wide ? 44 : 30} {...notch} outer={wide ? 30 : 22} className="h-full w-full bg-espresso">
          {video('absolute inset-0 h-full w-full object-cover')}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso via-espresso/30 to-espresso/10" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-espresso/70 via-transparent to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end px-6 pb-8 sm:px-10 sm:pb-12 lg:px-16 lg:pb-16" style={wide ? { paddingRight: notch.nw + 24 } : { paddingBottom: notch.nh + 8 }}>
            <motion.p {...rise(0.2)} className="eyebrow mb-6 flex w-max items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-ivory ring-1 ring-inset ring-white/20 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-70 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
              </span>
              Portraits · Weddings · Film
            </motion.p>

            <h1 id="hero-title" className="display max-w-5xl text-[clamp(3.6rem,10.5vw,10rem)] text-ivory">
              {words.map((w, i) => (
                <span key={w} className="inline-block overflow-hidden pb-[0.1em] align-bottom">
                  <motion.span
                    className={`inline-block pr-[0.2em] ${i === 2 ? 'italic text-[#f3c9a6]' : ''}`}
                    initial={reduce ? false : { y: '110%', rotate: 4 }}
                    animate={{ y: 0, rotate: 0 }}
                    transition={{ duration: 1.1, delay: 0.25 + i * 0.1, ease }}
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.div {...rise(0.6)} className="mt-6 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <p className="max-w-sm text-lg leading-relaxed text-ivory/85 md:text-xl">Portraits, weddings, and stories told through light.</p>
              <div className="flex flex-wrap items-center gap-3">
                <PillButton tone="ember" size="lg" href="#work">
                  Explore my work
                </PillButton>
                <PillButton tone="glass" size="lg" onClick={(e) => onPlayFilm(e.currentTarget)} aria-label="Watch the film">
                  Watch the film
                </PillButton>
              </div>
            </motion.div>
          </div>

          {/* Video controls */}
          <motion.div {...rise(0.8)} className="absolute right-4 top-24 flex items-center gap-2 rounded-full bg-espresso/40 p-1.5 ring-1 ring-inset ring-white/15 backdrop-blur-md sm:right-8 sm:top-28">
            <button
              type="button"
              onClick={controls.togglePlay}
              aria-label={controls.playing ? 'Pause background video' : 'Play background video'}
              aria-pressed={controls.playing}
              className="grid h-10 w-10 place-items-center rounded-full bg-ivory text-ink transition-transform duration-300 hover:scale-105 active:scale-90"
            >
              {controls.playing ? <Pause width={16} height={16} /> : <Play width={16} height={16} className="translate-x-px" />}
            </button>
            <span aria-hidden className="relative mx-1 hidden h-[2px] w-20 overflow-hidden rounded-full bg-white/25 sm:block">
              <motion.span className="absolute inset-0 origin-left bg-ember" style={{ transform: bar }} />
            </span>
            <button
              type="button"
              onClick={controls.toggleMute}
              aria-label={controls.muted ? 'Unmute video' : 'Mute video'}
              aria-pressed={!controls.muted}
              className="grid h-10 w-10 place-items-center rounded-full text-ivory transition-colors duration-300 hover:bg-white/15 active:scale-90"
            >
              {controls.muted ? <VolumeOff width={18} height={18} /> : <VolumeOn width={18} height={18} />}
            </button>
          </motion.div>

          {/* Album index */}
          <motion.nav
            {...rise(0.9)}
            aria-label="Open the album at a chapter"
            className="absolute right-8 top-1/2 hidden w-[19rem] -translate-y-1/2 rounded-[1.75rem] bg-espresso/45 p-3 text-ivory ring-1 ring-inset ring-white/15 backdrop-blur-xl xl:block"
            onPointerEnter={() => void preloadBook()}
          >
            <p className="eyebrow px-3 pb-2 pt-2 text-ivory/60">The album</p>
            <ul>
              {chapters.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={(e) => onOpen({ chapter: c.id, from: e.currentTarget, trigger: e.currentTarget })}
                    className="group/row flex w-full items-center gap-4 rounded-2xl p-2.5 text-left transition-colors duration-300 hover:bg-white/10"
                  >
                    <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl">
                      <Img photo={c.photos[0].photo} sizes="48px" badge={false} className="h-full w-full object-cover transition-transform duration-700 group-hover/row:scale-110" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="eyebrow block text-[0.6rem] text-ember">{c.number}</span>
                      <span className="block truncate font-serif text-xl capitalize">{c.id}</span>
                    </span>
                    <span className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-inset ring-white/25 transition-all duration-300 group-hover/row:bg-ember group-hover/row:ring-ember">
                      <ArrowRight width={15} height={15} className="transition-transform duration-300 group-hover/row:-rotate-45" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.nav>
        </NotchedMedia>

        {/* Scroll badge sits in the sculpted corner recess */}
        <div className="absolute bottom-0 right-0 grid place-items-center" style={{ width: notch.nw, height: notch.nh }}>
          <a href="#intro" aria-label="Scroll to the introduction" className="group relative grid place-items-center" style={{ width: wide ? 142 : 96, height: wide ? 142 : 96 }}>
            {wide && <RotatingText text="Scroll to explore · Praise Studio · " size={142} className="text-ink/60" />}
            <span
              className="relative grid place-items-center overflow-hidden rounded-full bg-ink text-ivory shadow-[0_18px_34px_-18px_rgb(25_25_25/0.7)] transition-[background-color,transform] duration-300 group-hover:bg-ember group-active:scale-90"
              style={{ width: wide ? 92 : 72, height: wide ? 92 : 72 }}
            >
              <ArrowRight width={24} height={24} className="rotate-90 transition-transform duration-500 ease-[var(--ease-lux)] group-hover:translate-y-[160%]" />
              <ArrowRight width={24} height={24} className="absolute rotate-90 -translate-y-[160%] transition-transform duration-500 ease-[var(--ease-lux)] group-hover:translate-y-0" />
            </span>
          </a>
        </div>
      </motion.div>
    </section>
  )
}
