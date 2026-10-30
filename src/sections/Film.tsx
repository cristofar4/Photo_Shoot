import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { CircleButton, PillButton } from '../components/Buttons'
import { Dialog } from '../components/Dialog'
import { Pause, Play } from '../components/Icons'
import { NotchedMedia } from '../components/Notched'
import { useAmbientVideo } from '../components/VideoFrame'
import { imgUrl, videos } from '../config/media'
import { useMediaQuery } from '../lib/hooks'

export function Film({ onPlay }: { onPlay: (trigger: HTMLElement | null) => void }) {
  const { video, controls } = useAmbientVideo(videos.film)
  const wide = useMediaQuery('(min-width: 768px)')
  const reduce = useReducedMotion()
  const notch = wide ? { nw: 176, nh: 176 } : { nw: 116, nh: 116 }
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1])
  const textY = useTransform(scrollYProgress, [0, 1], [60, 0])

  return (
    <section aria-labelledby="film-title" className="overflow-hidden py-10 md:py-16">
      <div className="px-3 sm:px-5">
        <motion.div ref={ref} className="relative mx-auto max-w-[96rem]" style={reduce ? undefined : { scale }}>
          <NotchedMedia corner="br" radius={wide ? 44 : 30} {...notch} outer={30} className="aspect-[4/5] bg-espresso sm:aspect-[16/9] lg:aspect-[21/9]">
            {video('absolute inset-0 h-full w-full object-cover')}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-espresso/85 via-espresso/35 to-transparent" />
            <motion.div className="absolute inset-0 flex flex-col justify-end p-7 sm:justify-center sm:p-14 lg:p-20" style={reduce ? undefined : { y: textY }}>
              <p className="eyebrow mb-5 flex items-center gap-3 text-ivory/75">
                <span className="h-px w-10 bg-ember" /> Film
              </p>
              <h2 id="film-title" className="display max-w-2xl text-[clamp(3rem,7.4vw,7rem)] text-ivory">
                Real people. <span className="italic text-[#f3c9a6]">Lasting stories.</span>
              </h2>
              <div className="mt-9 hidden sm:block">
                <PillButton tone="glass" size="lg" onClick={(e) => onPlay(e.currentTarget)}>
                  Watch the film
                </PillButton>
              </div>
            </motion.div>
            <button
              type="button"
              onClick={controls.togglePlay}
              aria-label={controls.playing ? 'Pause preview' : 'Play preview'}
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-espresso/45 text-ivory ring-1 ring-inset ring-white/25 backdrop-blur-md transition hover:bg-espresso/70 active:scale-90"
            >
              {controls.playing ? <Pause width={16} height={16} /> : <Play width={16} height={16} />}
            </button>
          </NotchedMedia>
          <div className="absolute bottom-0 right-0 grid place-items-center" style={{ width: notch.nw, height: notch.nh }}>
            <CircleButton
              label="Open the film player"
              icon={<Play width={wide ? 30 : 24} height={wide ? 30 : 24} className="translate-x-0.5" />}
              onClick={(e) => onPlay(e.currentTarget)}
              size={wide ? 108 : 76}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/** Accessible full player, opened from the film section and the services. */
export function FilmPlayer({ trigger, onClose }: { trigger: HTMLElement | null | undefined; onClose: () => void }) {
  const [ready, setReady] = useState(false)
  const clip = videos.filmFull
  return (
    <Dialog open={trigger !== undefined} onClose={onClose} title="Real people. Lasting stories." variant="cinema" returnTo={trigger}>
      <div className="relative mx-auto overflow-hidden rounded-[1.5rem] bg-black" style={{ aspectRatio: `${clip.poster.width} / ${clip.poster.height}`, width: `min(100%, calc(75dvh * ${clip.poster.width / clip.poster.height}))` }}>
        {!ready && <img src={imgUrl(clip.poster, clip.poster.widths.at(-1)!)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
        <video
          className="relative h-full w-full"
          src={clip.src}
          poster={imgUrl(clip.poster, clip.poster.widths.at(-1)!)}
          controls
          autoPlay
          playsInline
          onCanPlay={() => setReady(true)}
          aria-label={clip.label}
        />
      </div>
      <p className="mt-4 text-center text-sm text-ivory/70">
        {clip.label}
        {clip.credit && <> · Film {clip.credit}</>}. Press Escape to close.
      </p>
    </Dialog>
  )
}
