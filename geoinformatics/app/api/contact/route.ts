import { advertiseSchema, budgetLabels, contactSchema, contactTopics } from '@/lib/forms';
import { verifyToken } from '@/lib/server/form-token';
import { mailConfig } from '@/lib/server/config';
import { sendMail, storeInquiry } from '@/lib/server/mail';
import { clientIp, ipKey, isSameOrigin, json } from '@/lib/server/request';
import { limits, rateLimit } from '@/lib/server/rate-limit';
import { placementById } from '@/lib/ads/placements';

/** Contact and advertising enquiries. ?kind=contact | advertise */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ ok: false, error: 'Invalid request.' }, 403);
  const rl = rateLimit(`form:${ipKey(clientIp(req))}`, limits.form);
  if (!rl.ok) return json({ ok: false, error: 'Too many messages. Please try again later.' }, 429, { 'retry-after': String(rl.retryAfter) });

  const kind = new URL(req.url).searchParams.get('kind') === 'advertise' ? 'advertise' : 'contact';
  const body = await req.json().catch(() => null);
  const parsed = (kind === 'advertise' ? advertiseSchema : contactSchema).safeParse(body);
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return json({ ok: false, error: 'Please check the highlighted fields.', fields }, 400);
  }
  const d = parsed.data;
  if (d.website) return json({ ok: true });
  const tok = verifyToken(d.token, kind);
  if (!tok.ok) return json({ ok: false, error: tok.reason === 'expired' ? 'This form has expired. Please reload the page.' : 'Please try again in a moment.' }, 400);

  const cfg = mailConfig();
  let subject: string;
  let text: string;
  let to: string[];
  if (kind === 'advertise') {
    const a = d as typeof advertiseSchema._output;
    subject = `Advertising enquiry — ${a.company}`;
    to = cfg.advertisingTo.length ? cfg.advertisingTo : cfg.editorialTo;
    text = [
      `Name: ${a.name}`,
      `Email: ${a.email}`,
      `Company: ${a.company}`,
      a.role && `Role: ${a.role}`,
      `Interested in: ${a.interests.map((i) => placementById(i)?.name ?? i).join(', ') || '—'}`,
      `Budget: ${budgetLabels[a.budget]}`,
      a.timing && `Timing: ${a.timing}`,
    ]
      .filter(Boolean)
      .concat('', a.message || '(no message)')
      .join('\n');
  } else {
    const c = d as typeof contactSchema._output;
    subject = `${contactTopics[c.topic]} — ${c.name}`;
    to = c.topic === 'advertising' && cfg.advertisingTo.length ? cfg.advertisingTo : cfg.editorialTo;
    text = [`Topic: ${contactTopics[c.topic]}`, `Name: ${c.name}`, `Email: ${c.email}`, c.organization && `Organization: ${c.organization}`].filter(Boolean).concat('', c.message).join('\n');
  }

  const { token: _t, website: _w, consent: _c, ...stored } = d;
  await storeInquiry(kind, stored);
  try {
    const via = await sendMail({ to, subject, text, replyTo: d.email });
    return json({ ok: true, delivered: via === 'sent' });
  } catch (e) {
    console.error('[contact] mail failed', e instanceof Error ? e.message : e);
    // Stored on disk; tell the sender honestly that email notification failed.
    return json({ ok: true, delivered: false });
  }
}
