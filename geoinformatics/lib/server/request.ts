import 'server-only';
import crypto from 'node:crypto';
import { formSecret } from './config';

/** Visitor IP; only read from X-Forwarded-For when the proxy is trusted (TRUST_PROXY=true). */
export function clientIp(req: Request): string {
  if (process.env.TRUST_PROXY === 'true') {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0]!.trim();
    const real = req.headers.get('x-real-ip');
    if (real) return real.trim();
  }
  return 'direct';
}

/** IPs are never stored or logged; only a keyed hash is used for rate limiting. */
export const ipKey = (ip: string) => crypto.createHmac('sha256', formSecret()).update(ip).digest('base64url').slice(0, 22);

/** Accept POSTs from our own origin only (CSRF protection). */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return req.headers.get('sec-fetch-site') === 'same-origin';
  try {
    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Known crawlers and headless tools don't count as ad impressions or reads. */
export const isBot = (req: Request) => /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|curl|wget|python|axios|node-fetch/i.test(req.headers.get('user-agent') ?? '');

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
