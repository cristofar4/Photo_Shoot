/**
 * Vercel serverless function: receives the enquiry form and emails it to the
 * studio through Resend (https://resend.com).
 *
 * Environment variables (Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY       required  API key from resend.com
 *   ENQUIRY_TO_EMAIL     required  inbox that receives enquiries
 *   ENQUIRY_FROM_EMAIL   optional  sender on a domain verified in Resend.
 *                                  Defaults to Resend's test sender, which can
 *                                  only deliver to your own Resend account email.
 */

declare const process: { env: Record<string, string | undefined> }

const SESSIONS = ['Weddings', 'Portraits', 'Film & storytelling', 'Lifestyle', 'Something else']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Payload = { name?: unknown; email?: unknown; session?: unknown; date?: unknown; message?: unknown; company?: unknown; source?: unknown }

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Lets the form check, at page load, whether email delivery is set up. */
export function GET(): Response {
  return json(200, { configured: Boolean(process.env.RESEND_API_KEY && process.env.ENQUIRY_TO_EMAIL) })
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.ENQUIRY_TO_EMAIL
  if (!apiKey || !to) return json(503, { error: 'The enquiry service is not configured yet.' })

  let body: Payload
  try {
    body = (await request.json()) as Payload
  } catch {
    return json(400, { error: 'The request could not be read.' })
  }

  // Honeypot: real visitors never see or fill this field.
  if (str(body.company, 200)) return json(200, { ok: true })

  const name = str(body.name, 120)
  const email = str(body.email, 200)
  const session = str(body.session, 60)
  const date = str(body.date, 10)
  const message = str(body.message, 5000)
  const source = str(body.source, 300)

  if (name.length < 2) return json(400, { error: 'Please include your name.' })
  if (!EMAIL_RE.test(email)) return json(400, { error: 'Please include a valid email address.' })
  if (!SESSIONS.includes(session)) return json(400, { error: 'Please choose a session type.' })
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(400, { error: 'The preferred date is not valid.' })
  if (message.length < 10) return json(400, { error: 'Please add a short message.' })

  const rows: [string, string][] = [
    ['Name', name],
    ['Email', email],
    ['Session', session],
    ['Preferred date', date || 'Not given'],
    ['Message', message],
  ]
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + (source ? `\n\nSent from ${source}` : '')
  const html = `<h2 style="font-family:Georgia,serif">New enquiry: ${escape(session)}</h2><table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="color:#5e5a53;vertical-align:top"><b>${k}</b></td><td style="white-space:pre-wrap">${escape(v)}</td></tr>`)
    .join('')}</table>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.ENQUIRY_FROM_EMAIL || 'Brian Studio <onboarding@resend.dev>',
      to: to.split(',').map((s) => s.trim()).filter(Boolean),
      reply_to: email,
      subject: `New ${session.toLowerCase()} enquiry from ${name}`,
      text,
      html,
    }),
  })

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text().catch(() => ''))
    return json(502, { error: 'The email service did not accept the enquiry.' })
  }
  return json(200, { ok: true })
}
