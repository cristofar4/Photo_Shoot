import { useState } from 'react'
import { CircleButton } from '../components/Buttons'
import { Dialog } from '../components/Dialog'
import { Pause, Play } from '../components/Icons'
import { NotchedMedia } from '../components/Notched'
import { Reveal } from '../components/Reveal'
import { useAmbientVideo } from '../components/VideoFrame'
import { imgUrl, videos } from '../config/media'
import { useMediaQuery } from '../lib/hooks'

export function Film({ onPlay }: { onPlay: (trigger: HTMLElement | null) => void }) {
  const { video, controls } = useAmbientVideo(videos.film)
  const wide = useMediaQuery('(min-width: 768px)')
  const notch = wide ? { nw: 168, nh: 168 } : { nw: 116, nh: 116 }

  return (
    <section aria-labelledby="film-title" className="py-10 md:py-16">
      <div className="shell">
        <Reveal className="relative">
          <NotchedMedia corner="br" radius={36} {...notch} outer={28} className="aspect-[4/5] bg-ink sm:aspect-[16/9] lg:aspect-[21/9]">
            {video('absolute inset-0 h-full w-full object-cover')}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/35 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-7 sm:justify-center sm:p-12 lg:p-16">
              <span className="accent-rule mb-6" />
              <p className="eyebrow mb-4 text-ivory/75">Film</p>
              <h2 id="film-title" className="display max-w-lg text-[clamp(2.8rem,6.4vw,5.6rem)] text-ivory">
                Real people. Lasting stories.
              </h2>
              <button
                type="button"
                onClick={(e) => onPlay(e.currentTarget)}
                className="group/btn mt-8 hidden items-center gap-4 self-start text-ivory sm:inline-flex"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full ring-1 ring-inset ring-ivory/60 transition-all duration-300 group-hover/btn:bg-ivory group-hover/btn:text-ink group-active/btn:scale-90">
                  <Play className="translate-x-0.5" />
                </span>
                <span className="eyebrow">Watch the film</span>
              </button>
            </div>
            <button
              type="button"
              onClick={controls.togglePlay}
              aria-label={controls.playing ? 'Pause preview' : 'Play preview'}
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-ink/45 text-ivory ring-1 ring-inset ring-white/25 backdrop-blur-md transition hover:bg-ink/70 active:scale-90"
            >
              {controls.playing ? <Pause width={16} height={16} /> : <Play width={16} height={16} />}
            </button>
          </NotchedMedia>
          <div className="absolute bottom-0 right-0 grid place-items-center" style={{ width: notch.nw, height: notch.nh }}>
            <CircleButton
              label="Open the film player"
              icon={<Play width={wide ? 30 : 24} height={wide ? 30 : 24} className="translate-x-0.5" />}
              onClick={(e) => onPlay(e.currentTarget)}
              size={wide ? 104 : 76}
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** Accessible full player, opened from the film section and the services. */
export function FilmPlayer({ trigger, onClose }: { trigger: HTMLElement | null | undefined; onClose: () => void }) {
  const [ready, setReady] = useState(false)
  const clip = videos.film
  return (
    <Dialog open={trigger !== undefined} onClose={onClose} title="Real people. Lasting stories." variant="cinema" returnTo={trigger}>
      <div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-black">
        {!ready && <img src={imgUrl(clip.poster, 1600)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
        <video
          className="relative h-full w-full"
          src={clip.src}
          poster={imgUrl(clip.poster, 1600)}
          controls
          autoPlay
          playsInline
          onCanPlay={() => setReady(true)}
          aria-label={clip.label}
        />
      </div>
      <p className="mt-4 text-sm text-ivory/70">{clip.label}. Press Escape to close.</p>
    </Dialog>
  )
}
