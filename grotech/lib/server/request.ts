import 'server-only';
import crypto from 'node:crypto';
import { trustProxy, formSecret } from './config';

/** IP-adres van de bezoeker; alleen uit X-Forwarded-For als de proxy vertrouwd is. */
export function clientIp(req: Request): string {
  if (trustProxy()) {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0]!.trim();
    const real = req.headers.get('x-real-ip');
    if (real) return real.trim();
  }
  // Zonder vertrouwde proxy zijn headers te vervalsen en is er in een route handler geen
  // socket-adres. Dan geldt één gedeelde emmer: strenger, maar niet te omzeilen.
  return 'direct';
}

/** IP wordt nooit opgeslagen of gelogd; alleen een gezouten hash voor rate limiting. */
export function ipKey(ip: string) {
  return crypto.createHmac('sha256', formSecret()).update(ip).digest('base64url').slice(0, 22);
}

/** Alleen POST-verzoeken van onze eigen origin accepteren (CSRF-bescherming). */
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

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
}
