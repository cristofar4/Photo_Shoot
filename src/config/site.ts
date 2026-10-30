/**
 * Studio details. Leave a value empty ('') to hide it; nothing here is
 * invented on your behalf.
 */
export const site = {
  name: 'Aurelle',
  photographer: 'Praise',
  tagline: 'Photographs for a brighter tomorrow.',

  contact: {
    email: import.meta.env.VITE_CONTACT_EMAIL ?? '',
    phone: import.meta.env.VITE_CONTACT_PHONE ?? '',
    location: import.meta.env.VITE_CONTACT_LOCATION ?? '',
  },

  social: [
    { label: 'Instagram', href: import.meta.env.VITE_INSTAGRAM_URL ?? '' },
    { label: 'TikTok', href: import.meta.env.VITE_TIKTOK_URL ?? '' },
  ],

  /**
   * Where the enquiry form POSTs JSON. Works with Formspree, Getform, Basin,
   * a serverless function, or your own API. Empty means demo mode.
   */
  enquiryEndpoint: import.meta.env.VITE_ENQUIRY_ENDPOINT ?? '',

  /** Show a small “Sample image” badge on media flagged `demo` in media.ts. */
  showDemoBadges: true,
}

export const nav = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
]
