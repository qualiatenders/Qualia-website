import 'server-only';
import crypto from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { adminConfig, formSecret, isProd } from './config';

const COOKIE = 'gt_admin';
const TTL_MS = 8 * 60 * 60 * 1000;

function key() {
  const cfg = adminConfig();
  // Wachtwoord wijzigen maakt bestaande sessies direct ongeldig.
  return crypto.createHash('sha256').update(`${formSecret()}|${cfg?.user}|${cfg?.password}`).digest();
}

function sign(v: string) {
  return crypto.createHmac('sha256', key()).update(v).digest('base64url');
}

function safeEqual(a: string, b: string) {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function checkCredentials(user: string, password: string) {
  const cfg = adminConfig();
  if (!cfg) return false;
  // beide altijd vergelijken (geen vroege return) tegen timing-analyse
  const u = safeEqual(user, cfg.user);
  const p = safeEqual(password, cfg.password);
  return u && p;
}

export async function startSession() {
  const exp = String(Date.now() + TTL_MS);
  const nonce = crypto.randomBytes(8).toString('base64url');
  const value = `${exp}.${nonce}.${sign(`${exp}.${nonce}`)}`;
  (await cookies()).set(COOKIE, value, { httpOnly: true, secure: isProd, sameSite: 'strict', path: '/', maxAge: TTL_MS / 1000 });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!adminConfig()) return false;
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, nonce, sig] = v.split('.');
  if (!exp || !nonce || !sig || !safeEqual(sig, sign(`${exp}.${nonce}`))) return false;
  return Number(exp) > Date.now();
}

/** Beheer is volledig onzichtbaar (404) als er geen beheerdersaccount is ingesteld. */
export function assertAdminEnabled() {
  if (!adminConfig()) notFound();
}

export async function requireAdmin() {
  assertAdminEnabled();
  if (!(await isAdmin())) redirect('/beheer/login');
}

export async function requestIp() {
  const h = await headers();
  return process.env.TRUST_PROXY === 'true' ? (h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'direct') : 'direct';
}
