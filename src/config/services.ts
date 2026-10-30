import type { ChapterId } from './gallery'

export type SessionType = 'Weddings' | 'Portraits' | 'Film & storytelling' | 'Lifestyle' | 'Something else'

export const sessionTypes: SessionType[] = ['Weddings', 'Portraits', 'Film & storytelling', 'Lifestyle', 'Something else']

export type Service = {
  id: 'weddings' | 'portraits' | 'film'
  number: string
  eyebrow: string
  title: string
  summary: string
  tags: string[]
  /** What the service covers. Edit freely; shown in the detail panel. */
  includes: string[]
  approach: string
  cta: string
  session: SessionType
  chapter?: ChapterId
}

export const services: Service[] = [
  {
    id: 'weddings',
    number: '01',
    eyebrow: 'Weddings',
    title: 'For your forever.',
    summary: 'Timeless photography for a day that’s uniquely yours, where every detail matters.',
    tags: ['Wedding day', 'Destination', 'Intimate ceremonies'],
    includes: [
      'A planning conversation before the day',
      'Coverage shaped around your timeline',
      'Natural, gently directed couple portraits',
      'A private online gallery to share with family',
    ],
    approach:
      'I work quietly alongside your day, stepping in for portraits and stepping back for the moments that should simply happen.',
    cta: 'Explore weddings',
    session: 'Weddings',
    chapter: 'weddings',
  },
  {
    id: 'portraits',
    number: '02',
    eyebrow: 'Portraits',
    title: 'Simply, beautifully you.',
    summary: 'Natural, refined portraits for individuals, couples, and families. Real moments that feel like you.',
    tags: ['Individuals', 'Couples', 'Families'],
    includes: [
      'Studio or location sessions',
      'Guidance on outfits, styling and setting',
      'Relaxed direction throughout',
      'Carefully edited final images',
    ],
    approach: 'We start with a conversation, then build the session around how you want to feel in front of the lens.',
    cta: 'Explore portraits',
    session: 'Portraits',
    chapter: 'portraits',
  },
  {
    id: 'film',
    number: '03',
    eyebrow: 'Film',
    title: 'Stories in motion.',
    summary: 'Cinematic films that bring your most meaningful moments to life, with genuine emotion and a lasting story.',
    tags: ['Wedding films', 'Brand stories', 'Personal stories'],
    includes: [
      'Story planning and shot direction',
      'Cinematic capture with natural sound',
      'An edited film with licensed music',
      'Short cuts for sharing online',
    ],
    approach: 'Film lets the laughter, the vows and the small glances live on exactly as they happened.',
    cta: 'Explore films',
    session: 'Film & storytelling',
  },
]
