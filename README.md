# Praise Studio

A responsive photography site for portraits, weddings and film, built with React, TypeScript, Tailwind CSS v4 and Motion.
The signature feature is a page turning photo album that opens out of the gallery cards and folds into a bird that flies away when closed.

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type checks and builds to dist/
npm run preview    # serves the production build
npm run lint
```

Requires Node 20 or newer.

## Page structure

| Section | Design |
| --- | --- |
| Nav | Floating glass pill that tightens on scroll, sliding hover highlight, circular reveal mobile menu |
| Hero | Full screen cinematic video frame, glass album index that opens any chapter, video play, mute and progress controls |
| Intro | A manifesto whose words light up as you scroll, with photographs set into the sentence |
| Gallery | Segmented filter with counts. On desktop, chapter cards stack over one another as you scroll (normal scrolling, no hijacking). Each card has its own design (ivory notched, espresso arched, clay panoramic) plus a fan of prints that open the album at that photo |
| About | Pinned arched portrait with parallax and a rotating badge beside a scrolling story and numbered benefits |
| Services | Photographic panels that widen on hover or tap (desktop) or grow taller (phone), with Enquire, details and an album or film button in the curved recess |
| Film | Frame that grows to full size as it scrolls into view, with a play button in the recess opening an accessible player |
| Process | Espresso band where the timeline fills and each step lights up as you scroll |
| Booking | Split layout: photograph panel and a form with session chips |
| Footer | Espresso card with a call to action, links, a large outline wordmark and a back to top button ringed by scroll progress |

A thin ember reading progress bar runs across the top. On mouse devices an "Open album" bubble follows the cursor over gallery images.

## Project structure

```
src/
  config/          All content you are likely to edit
    media.ts       Every image and video (start here to swap media)
    gallery.ts     Album chapters, photo order and captions
    services.ts    Service cards, details and session types
    site.ts        Studio name, contact details, social links, form endpoint
  sections/        Homepage sections (Nav, Hero, Intro, Gallery, About, Services, Film, Process, Booking, Footer)
  components/      Shared UI: buttons, notched cards, dialog, responsive image, cursor bubble
  book/            The page flip album (lazy loaded only when opened)
  lib/             Notch path maths, hooks, scroll lock, focus trap
media-source/      Original images (yours in photos/, samples in demo/)
public/media/      Generated responsive images and web encoded videos
scripts/           Media helpers
```

## Replacing images and videos

All references live in `src/config/media.ts`.

**Images**

1. Put the original in `media-source/photos/` (for example `bride-portrait.jpg`).
2. Run `npm run media`. This writes `public/media/img/<name>-480.webp`, `-960.webp` and `-1600.webp` and prints each image's size.
3. Add or edit the entry in `media.ts` with that `file`, `width`, `height`, `widths`, alt text and optional `focus` (CSS object position) and `credit`.
4. Use it in a chapter in `gallery.ts`, or in a section through `sectionMedia`.

Entries with `demo: true` show a small "Sample image" badge. Remove the flag once you replace them, or turn badges off with `showDemoBadges` in `site.ts`.

**Videos**

Encode a master clip with `scripts/encode-video.sh media-source/video/my-clip.mp4`, which needs ffmpeg. Then point `videos.hero`, `videos.film` or `videos.filmService` in `media.ts` at `/media/video/my-clip.mp4` and choose a poster photo. Raw masters in `media-source/video/` are git ignored.

### What is supplied and what is sample content

| Media | Source |
| --- | --- |
| Studio portraits, maroon sweater portrait, rosary black and white, all lifestyle group photos | Your uploads. Credits come from the original watermarks: `@thelightuser`, `@amani_visuals`, `@ghost.thecinematographer` |
| Hero, film preview and service videos, plus their poster stills | Your three clean clips (photographer, camera rig, night window) |
| Full film in the “Watch the film” player | Your landscape TikTok clip, credited `@jeremiah.wv`, with its watermark left in place |
| **Wedding photos and the coastal sunset photo** | **Samples** cropped from the design reference images, because no wedding photos were supplied. Marked `demo: true` |
| About portrait | A still from the photographer clip. Replace it with a real portrait of Praise |
| Booking background | `trio-skate-mist`, used as warm light stand in. Swap it for a sunset photograph when you have one |

The vertical TikTok clip (`@tasha_2000xx`) is not used. The supplied photos still contain their burned in watermarks. Replace them with clean exports if you have them.

## The book gallery

**Why a custom implementation.** The usual libraries (StPageFlip and react-pageflip) have not been actively maintained for several years. They also draw pages to their own canvas or DOM, which makes reduced motion handling, focus management and controlled wheel input hard to add. The album is therefore built directly on Motion, with no extra dependency.

**How the turn works** (`src/book/Leaf.tsx`). A turning page is cut into 10 to 16 vertical strips nested inside one another. Each strip rotates slightly further than its parent, so the sheet curls as it lifts from the spine. Every strip shades itself from its own angle, which produces the moving shadow. A soft highlight travels across the crest of the curl. The page beneath gets a cast shadow, the spine has its own gradient, and stacked page edges show how much of the album is left on each side. Front and back faces use `backface-visibility`, and the back face is offset so the reverse page reads correctly.

**Behaviour** (`src/book/BookOverlay.tsx`):

- The overlay grows out of the clicked card, then the cover opens straight to the chosen chapter or photo.
- Two page spreads at 760px stage width and above, a single page on phones. The current page is kept when the layout switches.
- **Drag or swipe:** the page follows your finger. Release past the midpoint, or flick, to turn it, otherwise it falls back.
- **Other controls:** previous and next buttons, arrow, Page Up, Page Down, Home and End keys, chapter tabs, and thumbnails.
- **Mouse wheel:** one page per gesture. Further wheel events are ignored until the turn finishes and the wheel has been quiet for 260ms, so trackpad inertia cannot skip pages.
- Tap or click a photograph to enlarge it. The lightbox has its own arrows and Escape key.
- **Closing:** Escape or the close button folds the album along its spine. The pages become wings and it flaps away as a bird.
- Background scrolling is locked only while the overlay is open. The page behind is made `inert`, focus is trapped inside, and the scroll position and focus on the original button are restored afterwards.
- With `prefers-reduced-motion`, or if 3D transforms are unsupported, pages change instantly with a short fade and the album simply fades out. The book stays fully usable.
- The album code is a separate bundle loaded on first open, and preloaded when the pointer enters the gallery.

## Integrations that still need configuring

Copy `.env.example` to `.env.local`, or set these in your host's environment settings:

| Variable | Purpose |
| --- | --- |
| `VITE_ENQUIRY_ENDPOINT` | URL the enquiry form POSTs JSON to: name, email, session, date, message, source. Works with Formspree, Getform, Basin or your own function. **Without it the form runs in labelled demo mode and sends nothing.** A success message appears only when the endpoint returns a 2xx response. |
| `VITE_CONTACT_EMAIL`, `VITE_CONTACT_PHONE`, `VITE_CONTACT_LOCATION` | Shown in the footer and the form's error message. Hidden when empty. |
| `VITE_INSTAGRAM_URL`, `VITE_TIKTOK_URL` | Footer social links. Hidden when empty. |

Also review the privacy notice text in `src/sections/Footer.tsx` once you know which form provider you use. No contact details, testimonials, awards or statistics have been invented.

## Testing notes

Checked in headless Chromium at 1440×900 and at 390×844 with touch:

- no horizontal overflow and no console errors
- mobile menu, gallery filters, and the services detail panels with session preselection
- form validation and demo state, film player focus return
- album: cover opening, keyboard, a 25 event wheel burst (one page), mouse drag, touch swipes both ways, chapter tabs, thumbnails, lightbox, focus trap, bird close, focus and scroll restoration, reopening, and reduced motion mode
