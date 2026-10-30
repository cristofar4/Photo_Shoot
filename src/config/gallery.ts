import { photos, type Photo } from './media'

export type ChapterId = 'weddings' | 'portraits' | 'lifestyle'

export type Chapter = {
  id: ChapterId
  number: string
  title: string
  line: string
  photos: { photo: Photo; caption: string }[]
}

/** The album shown in the book gallery. Order here is the order of the pages. */
export const chapters: Chapter[] = [
  {
    id: 'weddings',
    number: '01',
    title: 'The wedding collection.',
    line: 'Tender moments, joyful celebrations and the beginning of forever.',
    photos: [
      { photo: photos.weddingGardenWalk, caption: 'The walk, golden hour' },
      { photo: photos.weddingGardenKiss, caption: 'Among the roses' },
      { photo: photos.weddingVeilEmbrace, caption: 'Beneath the veil' },
    ],
  },
  {
    id: 'portraits',
    number: '02',
    title: 'Unmistakably you.',
    line: 'Bold, honest and beautifully real. Portraits that feel like you.',
    photos: [
      { photo: photos.studioHand, caption: 'Hold that thought' },
      { photo: photos.studioSeated, caption: 'Over the shoulder' },
      { photo: photos.studioCrouch, caption: 'Quiet confidence' },
      { photo: photos.maroonOverhead, caption: 'From above' },
      { photo: photos.rosaryBw, caption: 'Kept close' },
    ],
  },
  {
    id: 'lifestyle',
    number: '03',
    title: 'Life, beautifully lived.',
    line: 'Everyday moments, extraordinary places and a deeper connection to what matters most.',
    photos: [
      { photo: photos.trioSkateRoad, caption: 'The road out' },
      { photo: photos.trioTailgate, caption: 'Tailgate hours' },
      { photo: photos.trioSkateMist, caption: 'Into the haze' },
      { photo: photos.duoGround, caption: 'Back to back' },
      { photo: photos.coastSunset, caption: 'Coastline, last light' },
    ],
  },
]

export const chapterById = (id: ChapterId) => chapters.find((c) => c.id === id)!
