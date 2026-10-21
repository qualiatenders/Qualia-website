import 'server-only';
import crypto from 'node:crypto';
import path from 'node:path';

export const isProd = process.env.NODE_ENV === 'production';

const warned = new Set<string>();
export function warnOnce(key: string, msg: string) {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[geoinformatics] ${msg}`);
}

export const dataDir = () => path.resolve(process.env.GI_DATA_DIR?.trim() || path.join(process.cwd(), 'storage'));

let devSecret: string | null = null;
/** Signs form tokens and hashes IPs for rate limiting. */
export function formSecret() {
  const s = process.env.FORM_SECRET?.trim();
  if (s && s.length >= 32) return s;
  warnOnce('form-secret', 'FORM_SECRET is missing or shorter than 32 characters; using a temporary per-process secret.');
  devSecret ??= crypto.randomBytes(32).toString('hex');
  return devSecret;
}

/** Shared secret between this frontend and the WordPress plugin (tracking, revalidation). */
export const platformSecret = () => process.env.GI_PLATFORM_SECRET?.trim() || '';

export const wordpressUrl = () => process.env.WORDPRESS_URL?.replace(/\/$/, '') || '';

export const mailConfig = () => ({
  host: process.env.SMTP_HOST?.trim() || null,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER?.trim() || undefined,
  pass: process.env.SMTP_PASS || undefined,
  from: process.env.MAIL_FROM?.trim() || 'GeoInformatics <noreply@localhost>',
  editorialTo: list(process.env.MAIL_EDITORIAL_TO),
  advertisingTo: list(process.env.MAIL_ADVERTISING_TO),
});

const list = (v?: string) =>
  (v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
