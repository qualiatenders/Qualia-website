import { z } from 'zod';
import { subscribe } from '@/lib/server/newsletter';
import { clientIp, ipKey, isSameOrigin, json } from '@/lib/server/request';
import { limits, rateLimit } from '@/lib/server/rate-limit';

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  consent: z.literal(true),
  website: z.string().max(0).optional().or(z.literal('')).nullable(),
  source: z.string().max(80).regex(/^[\w:-]+$/).default('unknown'),
});

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ ok: false, error: 'Invalid request.' }, 403);
  const rl = rateLimit(`nl:${ipKey(clientIp(req))}`, limits.newsletter);
  if (!rl.ok) return json({ ok: false, error: 'Too many attempts. Please try again later.' }, 429, { 'retry-after': String(rl.retryAfter) });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    const error = field === 'consent' ? 'Please confirm you agree to receive the newsletter.' : field === 'email' ? 'Please enter a valid email address.' : 'Please check the form and try again.';
    return json({ ok: false, error }, 400);
  }
  // Honeypot filled → pretend success, store nothing.
  if (parsed.data.website) return json({ ok: true, pending: true });

  const r = await subscribe(parsed.data.email, parsed.data.source);
  return r.ok ? json({ ok: true, pending: r.pending }) : json({ ok: false, error: r.error }, r.status);
}
