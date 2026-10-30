import { chapters, type ChapterId } from '../config/gallery'
import type { Photo } from '../config/media'

export type BookPage =
  | { kind: 'cover' }
  | { kind: 'endpaper'; side: 'front' | 'back' }
  | { kind: 'backcover' }
  | { kind: 'chapter'; chapter: ChapterId; number: string; title: string; line: string; count: number }
  | { kind: 'photo'; chapter: ChapterId; photo: Photo; caption: string; indexInChapter: number }
  | { kind: 'end' }

/** Flattens the chapters config into the page sequence of the album. */
export function buildPages(): BookPage[] {
  const pages: BookPage[] = [{ kind: 'cover' }, { kind: 'endpaper', side: 'front' }]
  for (const c of chapters) {
    pages.push({ kind: 'chapter', chapter: c.id, number: c.number, title: c.title, line: c.line, count: c.photos.length })
    c.photos.forEach((p, i) => pages.push({ kind: 'photo', chapter: c.id, photo: p.photo, caption: p.caption, indexInChapter: i }))
  }
  pages.push({ kind: 'end' }, { kind: 'backcover' })
  return pages
}

export const pageIndexOf = (pages: BookPage[], chapter: ChapterId, photo?: number) => {
  if (photo !== undefined) {
    const i = pages.findIndex((p) => p.kind === 'photo' && p.chapter === chapter && p.indexInChapter === photo)
    if (i >= 0) return i
  }
  return pages.findIndex((p) => p.kind === 'chapter' && p.chapter === chapter)
}

export const chapterAt = (pages: BookPage[], index: number): ChapterId | null => {
  for (let i = Math.min(index, pages.length - 1); i >= 0; i--) {
    const p = pages[i]
    if (p.kind === 'chapter' || p.kind === 'photo') return p.chapter
  }
  return null
}

/*
 * Two page layout: spread 0 shows the cover alone on the right. Spread k
 * shows page 2k-1 on the left and page 2k on the right.
 */
export const spreadCount = (n: number) => Math.floor(n / 2) + 1
export const spreadOfPage = (i: number) => Math.ceil(i / 2)
export const leftOf = (s: number) => (s === 0 ? null : 2 * s - 1)
export const rightOf = (s: number, n: number) => (2 * s < n ? 2 * s : null)
