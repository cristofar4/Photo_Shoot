import { motion, useReducedMotion } from 'motion/react'
import { PillButton } from '../components/Buttons'
import { Pause, Play, VolumeOff, VolumeOn } from '../components/Icons'
import { NotchedMedia } from '../components/Notched'
import { useAmbientVideo } from '../components/VideoFrame'
import { videos } from '../config/media'
import { useMediaQuery } from '../lib/hooks'

const words = ['Moments', 'worth', 'keeping.']

export function Hero() {
  const reduce = useReducedMotion()
  const { video, controls } = useAmbientVideo(videos.hero)
  const wide = useMediaQuery('(min-width: 640px)')
  const notch = wide ? { nw: 156, nh: 88 } : { nw: 132, nh: 74 }

  return (
    <section id="top" aria-labelledby="hero-title" className="relative pt-[6.5rem] md:pt-32">
      <div className="shell grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5 lg:pb-10">
          <motion.span
            className="accent-rule mb-8 origin-left"
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          <h1 id="hero-title" className="display text-[clamp(3.6rem,9vw,7.4rem)]">
            {words.map((w, i) => (
              <span key={w} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span
                  className="inline-block pr-[0.22em]"
                  initial={reduce ? false : { y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.05, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mt-7 max-w-sm text-lg leading-relaxed text-ink/80 md:text-xl">
              Portraits, weddings, and stories told through light.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <PillButton tone="ink" href="#work">
                Explore my work
              </PillButton>
            </div>
            <p className="eyebrow mt-10 flex flex-wrap gap-x-4 gap-y-2 text-muted">
              <span>Portraits</span>
              <span aria-hidden className="text-ember">/</span>
              <span>Weddings</span>
              <span aria-hidden className="text-ember">/</span>
              <span>Lifestyle</span>
            </p>
          </motion.div>
        </div>

        <motion.div
          className="relative lg:col-span-7"
          initial={reduce ? false : { opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <NotchedMedia corner="br" radius={30} nw={notch.nw} nh={notch.nh} inner={notch.nh / 2} className="aspect-[4/5] w-full sm:aspect-[5/4] lg:aspect-auto lg:h-[min(76vh,46rem)]">
            <div className="absolute inset-0 overflow-hidden rounded-tl-[clamp(6rem,18vw,15rem)] bg-ink">
              {video('h-full w-full object-cover')}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
            </div>
          </NotchedMedia>

          <div className="absolute bottom-0 right-0 flex items-center justify-center gap-3" style={{ width: notch.nw, height: notch.nh }}>
            <button
              type="button"
              onClick={controls.togglePlay}
              aria-label={controls.playing ? 'Pause background video' : 'Play background video'}
              aria-pressed={controls.playing}
              className="grid h-14 w-14 place-items-center rounded-full bg-ink text-ivory shadow-lg transition-all duration-300 hover:scale-105 hover:bg-ember active:scale-90"
            >
              {controls.playing ? <Pause /> : <Play />}
            </button>
            <button
              type="button"
              onClick={controls.toggleMute}
              aria-label={controls.muted ? 'Unmute video' : 'Mute video'}
              aria-pressed={!controls.muted}
              className="grid h-12 w-12 place-items-center rounded-full text-ink ring-1 ring-inset ring-ink/25 transition-all duration-300 hover:bg-ink hover:text-ivory active:scale-90"
            >
              {controls.muted ? <VolumeOff /> : <VolumeOn />}
            </button>
          </div>

          <div className="pointer-events-none absolute left-5 top-5 hidden rounded-full bg-ivory/85 px-4 py-2 backdrop-blur sm:block lg:left-auto lg:right-6 lg:top-6">
            <p className="eyebrow flex items-center gap-2 text-[0.6rem] text-ink">
              <span className={`h-1.5 w-1.5 rounded-full ${controls.playing ? 'bg-ember' : 'bg-mist'}`} />
              {controls.playing ? 'Now playing' : 'Paused'}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
