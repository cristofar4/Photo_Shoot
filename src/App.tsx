import { lazy, Suspense, useCallback, useState } from 'react'
import type { SessionType } from './config/services'
import type { OpenGallery, OpenGalleryRequest } from './lib/gallery-events'
import { About } from './sections/About'
import { Booking } from './sections/Booking'
import { Film, FilmPlayer } from './sections/Film'
import { Footer } from './sections/Footer'
import { Gallery } from './sections/Gallery'
import { Hero } from './sections/Hero'
import { Nav } from './sections/Nav'
import { Process } from './sections/Process'
import { Services } from './sections/Services'

// The page flip gallery is only downloaded when someone opens it.
const BookOverlay = lazy(() => import('./book/BookOverlay'))

export default function App() {
  const [gallery, setGallery] = useState<OpenGalleryRequest | null>(null)
  const [film, setFilm] = useState<HTMLElement | null | undefined>(undefined)
  const [preset, setPreset] = useState<{ session: SessionType | null; key: number }>({ session: null, key: 0 })
  const [bookAfterClose, setBookAfterClose] = useState(false)

  const goToEnquiry = useCallback((session?: SessionType) => {
    if (session) setPreset((p) => ({ session, key: p.key + 1 }))
    const el = document.getElementById('contact')
    el?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    window.setTimeout(() => document.getElementById('field-name')?.focus({ preventScroll: true }), 700)
  }, [])

  const openGallery: OpenGallery = useCallback((req) => setGallery(req), [])

  return (
    <>
      <a href="#work" className="sr-only z-[200] rounded-full bg-ink px-5 py-3 text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to the work
      </a>
      <Nav onBook={() => goToEnquiry()} />
      <main>
        <Hero />
        <Gallery onOpen={openGallery} />
        <About />
        <Services onEnquire={goToEnquiry} onOpenGallery={openGallery} onPlayFilm={(t) => setFilm(t)} />
        <Film onPlay={(t) => setFilm(t)} />
        <Process />
        <Booking preset={preset.session} presetKey={preset.key} />
      </main>
      <Footer />

      <FilmPlayer trigger={film} onClose={() => setFilm(undefined)} />

      {gallery && (
        <Suspense fallback={<div className="fixed inset-0 z-[90] grid place-items-center bg-[#171513]/80 text-ivory">Opening the album…</div>}>
          <BookOverlay
            request={gallery}
            onBook={() => setBookAfterClose(true)}
            onClosed={() => {
              setGallery(null)
              if (bookAfterClose) {
                setBookAfterClose(false)
                window.setTimeout(() => goToEnquiry(), 80)
              }
            }}
          />
        </Suspense>
      )}
    </>
  )
}
