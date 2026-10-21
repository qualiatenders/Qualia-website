import 'server-only';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { dataDir, isProd } from './config';
import { absoluteUrl } from '@/lib/site';

/**
 * Newsletter provider adapter. Always double opt-in: the provider emails a
 * confirmation link and only adds the address after it is clicked.
 *
 *   NEWSLETTER_PROVIDER=mailchimp  MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID
 *   NEWSLETTER_PROVIDER=brevo      BREVO_API_KEY, BREVO_LIST_ID, BREVO_DOI_TEMPLATE_ID
 *
 * Without a provider, development stores sign-ups in storage/newsletter.jsonl;
 * production refuses with a clear message rather than silently dropping them.
 */
export type SubscribeResult = { ok: true; pending: boolean } | { ok: false; error: string; status: number };

export const newsletterProvider = () => (process.env.NEWSLETTER_PROVIDER?.trim().toLowerCase() || '') as '' | 'mailchimp' | 'brevo';

export async function subscribe(email: string, source: string): Promise<SubscribeResult> {
  const provider = newsletterProvider();
  try {
    if (provider === 'mailchimp') return await mailchimp(email, source);
    if (provider === 'brevo') return await brevo(email, source);
  } catch (e) {
    console.error('[newsletter]', e instanceof Error ? e.message : e);
    return { ok: false, status: 502, error: 'The newsletter service did not respond. Please try again in a moment.' };
  }
  if (isProd) return { ok: false, status: 503, error: 'Newsletter sign-up is temporarily unavailable. Please try again later.' };
  const dir = dataDir();
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  await fs.appendFile(path.join(dir, 'newsletter.jsonl'), JSON.stringify({ email, source, at: new Date().toISOString() }) + '\n', { mode: 0o600 });
  return { ok: true, pending: true };
}

async function mailchimp(email: string, source: string): Promise<SubscribeResult> {
  const key = process.env.MAILCHIMP_API_KEY!;
  const list = process.env.MAILCHIMP_LIST_ID!;
  const dc = key.split('-')[1];
  const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${list}/members/${hash}`, {
    method: 'PUT',
    headers: { authorization: `Basic ${Buffer.from(`any:${key}`).toString('base64')}`, 'content-type': 'application/json' },
    // status_if_new=pending → Mailchimp sends its double opt-in email. Existing members are left as they are.
    body: JSON.stringify({ email_address: email, status_if_new: 'pending', merge_fields: {}, tags: [`source:${source}`.slice(0, 100)] }),
  });
  if (res.ok) {
    const m = (await res.json()) as { status?: string };
    return { ok: true, pending: m.status !== 'subscribed' };
  }
  const err = (await res.json().catch(() => ({}))) as { title?: string };
  if (err.title === 'Invalid Resource' || err.title === 'Forgotten Email Not Subscribed')
    return { ok: false, status: 400, error: 'This address cannot be subscribed. Please check it, or use another address.' };
  throw new Error(`Mailchimp ${res.status} ${err.title ?? ''}`);
}

async function brevo(email: string, source: string): Promise<SubscribeResult> {
  const res = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY!, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      email,
      includeListIds: [Number(process.env.BREVO_LIST_ID)],
      templateId: Number(process.env.BREVO_DOI_TEMPLATE_ID),
      redirectionUrl: absoluteUrl('/newsletter/confirmed/'),
      attributes: { SOURCE: source },
    }),
  });
  if (res.ok || res.status === 204) return { ok: true, pending: true };
  if (res.status === 400) return { ok: false, status: 400, error: 'This address cannot be subscribed. Please check it.' };
  throw new Error(`Brevo ${res.status}`);
}
