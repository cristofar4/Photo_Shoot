/**
 * Every image and video used on the site lives here, so swapping media is a
 * one file change.
 *
 * Images
 *   1. Drop the original into media-source/photos (yours) or media-source/demo.
 *   2. Run `npm run media` to create /public/media/img/<file>-<width>.webp.
 *   3. Add or edit an entry below: `file` is the original file name without
 *      extension, `width`/`height` are the original pixel size (printed by the
 *      script) and `widths` the variants it reported.
 *
 * Entries marked `demo: true` are sample images cropped from the design
 * references. They carry a small "Sample image" badge until replaced.
 */

export type Photo = {
  file: string
  width: number
  height: number
  widths: number[]
  alt: string
  /** CSS object-position used when the photo is cropped into a frame. */
  focus?: string
  credit?: string
  demo?: boolean
}

const photo = (p: Photo) => p

export const photos = {
  // Weddings (sample images until real wedding work is added)
  weddingGardenKiss: photo({
    file: 'wedding-garden-kiss', width: 603, height: 362, widths: [480, 603],
    alt: 'Groom kissing the bride on the cheek in a sunlit rose garden', focus: '50% 35%', demo: true,
  }),
  weddingGardenWalk: photo({
    file: 'wedding-garden-walk', width: 672, height: 480, widths: [480, 672],
    alt: 'Bride and groom walking hand in hand through a garden at golden hour', focus: '50% 40%', demo: true,
  }),
  weddingVeilEmbrace: photo({
    file: 'wedding-veil-embrace', width: 508, height: 204, widths: [480, 508],
    alt: 'Couple touching foreheads beneath a flowing veil at sunset', focus: '50% 40%', demo: true,
  }),

  // Portraits
  studioSeated: photo({
    file: 'studio-seated', width: 1599, height: 2000, widths: [480, 960, 1599],
    alt: 'Woman in an olive bandana seated on a white studio floor, looking back over her shoulder',
    focus: '50% 55%', credit: '@thelightuser',
  }),
  studioCrouch: photo({
    file: 'studio-crouch', width: 1600, height: 2000, widths: [480, 960, 1600],
    alt: 'Woman crouching in a white studio wearing a denim skirt and sneakers, chin resting on her hand',
    focus: '45% 50%', credit: '@thelightuser',
  }),
  studioHand: photo({
    file: 'studio-hand', width: 1600, height: 2000, widths: [480, 960, 1600],
    alt: 'Close portrait of a woman holding an open hand toward the lens, face in sharp focus behind it',
    focus: '40% 40%', credit: '@thelightuser',
  }),
  maroonOverhead: photo({
    file: 'maroon-overhead', width: 864, height: 1184, widths: [480, 864],
    alt: 'Man in a maroon sweater photographed from above, hand raised to his face, on textured asphalt',
    focus: '50% 35%', credit: '@amani_visuals',
  }),
  rosaryBw: photo({
    file: 'rosary-bw', width: 1440, height: 1140, widths: [480, 960, 1440],
    alt: 'Black and white close up of hands holding a rosary, face softly out of focus behind',
    focus: '50% 60%', credit: '@ghost.thecinematographer',
  }),

  // Lifestyle
  trioSkateRoad: photo({
    file: 'trio-skate-road', width: 1500, height: 2000, widths: [480, 960, 1500],
    alt: 'Three friends in school uniform styling on a tree lined road, one holding a skateboard behind her head',
    focus: '50% 40%', credit: '@amani_visuals',
  }),
  trioTailgate: photo({
    file: 'trio-tailgate', width: 1500, height: 2000, widths: [480, 960, 1500],
    alt: 'Three friends resting on the tailgate of a truck beneath green trees',
    focus: '50% 50%', credit: '@amani_visuals',
  }),
  trioSkateMist: photo({
    file: 'trio-skate-mist', width: 1500, height: 2000, widths: [480, 960, 1500],
    alt: 'Three friends posing together in warm misty light, a skateboard over one shoulder',
    focus: '50% 40%', credit: '@amani_visuals',
  }),
  duoGround: photo({
    file: 'duo-ground', width: 1500, height: 2000, widths: [480, 960, 1500],
    alt: 'Two friends sitting back to back on the ground in a parking lot',
    focus: '45% 55%', credit: '@amani_visuals',
  }),
  coastSunset: photo({
    file: 'lifestyle-coast-sunset', width: 928, height: 215, widths: [480, 928],
    alt: 'Woman in sunglasses smiling above a coastal town at sunset',
    focus: '45% 50%', demo: true,
  }),

  // Studio and behind the scenes (stills from the supplied clips)
  photographer: photo({
    file: 'photographer-still', width: 2560, height: 1440, widths: [480, 960, 1600],
    alt: 'Photographer raising a camera toward the viewer', focus: '55% 45%',
  }),
  cameraRig: photo({
    file: 'camera-rig-still', width: 2560, height: 1440, widths: [480, 960, 1600],
    alt: 'Cinema camera rig carried through a bright studio', focus: '60% 50%',
  }),
  nightWindow: photo({
    file: 'night-window-still', width: 2580, height: 1440, widths: [480, 960, 1600],
    alt: 'City lights blurring past a tram window at night', focus: '30% 50%',
  }),
  eyesFilm: photo({
    file: 'eyes-film-still', width: 776, height: 576, widths: [480, 776],
    alt: 'Extreme close up of eyes lit in warm low light', focus: '50% 50%', credit: '@jeremiah.wv',
  }),
} satisfies Record<string, Photo>

export type PhotoKey = keyof typeof photos

export type Clip = { src: string; poster: Photo; label: string; credit?: string }

export const videos = {
  /** Hero loop beside “Moments worth keeping.” */
  hero: { src: '/media/video/photographer.mp4', poster: photos.photographer, label: 'A photographer framing a portrait' },
  /** Film section preview and full player. */
  film: { src: '/media/video/camera-rig.mp4', poster: photos.cameraRig, label: 'Behind the scenes with the cinema camera' },
  /** Full film opened by every “Watch the film” button (has sound). */
  filmFull: { src: '/media/video/eyes-film.mp4', poster: photos.eyesFilm, label: 'A short film in close up', credit: '@jeremiah.wv' },
  /** Service card preview for Film. */
  filmService: { src: '/media/video/night-window.mp4', poster: photos.nightWindow, label: 'City lights through a tram window at night' },
} satisfies Record<string, Clip>

/** Imagery used by individual sections. */
export const sectionMedia = {
  aboutPortrait: photos.photographer,
  booking: photos.trioSkateMist,
  services: {
    weddings: photos.weddingGardenWalk,
    portraits: photos.studioHand,
    film: photos.nightWindow,
  },
  gallery: {
    weddings: photos.weddingGardenKiss,
    portraits: photos.studioCrouch,
    lifestyle: [photos.trioSkateRoad, photos.maroonOverhead, photos.duoGround],
  },
}

export const imgUrl = (p: Photo, w: number) => `/media/img/${p.file}-${w}.webp`
