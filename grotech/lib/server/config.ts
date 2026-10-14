import 'server-only';
import path from 'node:path';
import crypto from 'node:crypto';

const isProd = process.env.NODE_ENV === 'production';
const warned = new Set<string>();
function warnOnce(key: string, msg: string) {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[grotech] ${msg}`);
}

export function dataDir() {
  const dir = process.env.GROTECH_DATA_DIR?.trim();
  return dir ? path.resolve(dir) : path.resolve(process.cwd(), 'storage');
}

let devSecret: string | null = null;
export function formSecret() {
  const s = process.env.FORM_SECRET?.trim();
  if (s && s.length >= 32) return s;
  warnOnce('form-secret', 'FORM_SECRET ontbreekt of is te kort; er wordt een tijdelijk geheim per proces gebruikt.');
  devSecret ??= crypto.randomBytes(32).toString('hex');
  return devSecret;
}

/** 32-byte sleutel voor AES-256-GCM, of null als versleuteling niet is ingesteld. */
export function encryptionKey(): Buffer | null {
  const raw = process.env.FILE_ENCRYPTION_KEY?.trim();
  if (!raw) {
    warnOnce('enc', isProd ? 'FILE_ENCRYPTION_KEY ontbreekt: uploads worden ONVERSLEUTELD opgeslagen. Stel dit in productie in.' : 'FILE_ENCRYPTION_KEY niet ingesteld (ontwikkeling): uploads worden onversleuteld opgeslagen.');
    return null;
  }
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new Error('FILE_ENCRYPTION_KEY moet 32 bytes (base64) zijn.');
  return key;
}

export const mailConfig = () => ({
  host: process.env.SMTP_HOST?.trim() || null,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER?.trim() || undefined,
  pass: process.env.SMTP_PASS || undefined,
  from: process.env.MAIL_FROM?.trim() || 'GROTECH <noreply@localhost>',
  notifyTo: (process.env.MAIL_NOTIFY_TO || '').split(',').map((s) => s.trim()).filter(Boolean),
});

export const adminConfig = () => {
  const user = process.env.ADMIN_USER?.trim();
  const password = process.env.ADMIN_PASSWORD;
  return user && password ? { user, password } : null;
};

export const trustProxy = () => process.env.TRUST_PROXY === 'true';
export { isProd };
