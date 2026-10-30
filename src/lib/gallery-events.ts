import type { ChapterId } from '../config/gallery'

export type OpenGalleryRequest = {
  chapter: ChapterId
  /** Index of the photo within the chapter to open at. */
  photo?: number
  /** Element whose box the overlay grows out of. */
  from?: HTMLElement | null
  /** Element that receives focus again when the gallery closes. */
  trigger?: HTMLElement | null
}

export type OpenGallery = (req: OpenGalleryRequest) => void

/** Warm the lazily loaded book bundle before the visitor clicks. */
export const preloadBook = () => import('../book/BookOverlay')
