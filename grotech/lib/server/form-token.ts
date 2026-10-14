import 'server-only';
import crypto from 'node:crypto';
import { formSecret } from './config';

/**
 * Ondertekend formuliertoken: bewijst dat het formulier via onze pagina is
 * geladen en dat er een menselijke invultijd tussen laden en verzenden zit.
 */
const MIN_AGE_MS = { quote: 6_000, contact: 3_000 } as const;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
export type FormKind = keyof typeof MIN_AGE_MS;

function sign(payload: string) {
  return crypto.createHmac('sha256', formSecret()).update(payload).digest('base64url');
}

export function issueToken(kind: FormKind) {
  const payload = `${kind}.${Date.now()}.${crypto.randomBytes(8).toString('base64url')}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: unknown, kind: FormKind): { ok: true } | { ok: false; reason: 'invalid' | 'too-fast' | 'expired' } {
  if (typeof token !== 'string' || token.length > 200) return { ok: false, reason: 'invalid' };
  const parts = token.split('.');
  if (parts.length !== 4) return { ok: false, reason: 'invalid' };
  const [k, ts, nonce, sig] = parts as [string, string, string, string];
  const expected = sign(`${k}.${ts}.${nonce}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b) || k !== kind) return { ok: false, reason: 'invalid' };
  const age = Date.now() - Number(ts);
  if (!Number.isFinite(age) || age < 0) return { ok: false, reason: 'invalid' };
  if (age < MIN_AGE_MS[kind]) return { ok: false, reason: 'too-fast' };
  if (age > MAX_AGE_MS) return { ok: false, reason: 'expired' };
  return { ok: true };
}
