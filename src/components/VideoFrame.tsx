import { useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { imgUrl, type Clip } from '../config/media'

type Controls = { playing: boolean; muted: boolean; togglePlay: () => void; toggleMute: () => void }

/**
 * Muted, inline, looping background video with a poster fallback.
 * Autoplays only when motion is allowed, pauses while off screen, and never
 * overrides a visitor's own pause.
 */
export function useAmbientVideo(clip: Clip) {
  const ref = useRef<HTMLVideoElement>(null)
  const reduce = useReducedMotion()
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const userPaused = useRef(!!reduce)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    userPaused.current = !!reduce
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) v.play().catch(() => setPlaying(false))
        else if (!entry.isIntersecting) v.pause()
      },
      { threshold: 0.25 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [reduce])

  const controls: Controls = {
    playing,
    muted,
    togglePlay: () => {
      const v = ref.current
      if (!v) return
      if (v.paused) {
        userPaused.current = false
        v.play().catch(() => setPlaying(false))
      } else {
        userPaused.current = true
        v.pause()
      }
    },
    toggleMute: () => {
      const v = ref.current
      if (!v) return
      v.muted = !v.muted
      setMuted(v.muted)
    },
  }

  const video = (className = '', children?: ReactNode) => (
    <>
      <video
        ref={ref}
        className={className}
        src={clip.src}
        poster={imgUrl(clip.poster, 960)}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={clip.label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        style={{ objectPosition: clip.poster.focus }}
      />
      {children}
    </>
  )

  return { video, controls }
}
