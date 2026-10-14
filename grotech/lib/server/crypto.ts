import 'server-only';
import crypto from 'node:crypto';

/** Formaat: [12 bytes IV][16 bytes auth tag][ciphertext] — AES-256-GCM. */
export function encrypt(data: Buffer, key: Buffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(data), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]);
}

export function decrypt(blob: Buffer, key: Buffer) {
  const iv = blob.subarray(0, 12);
  const tag = blob.subarray(12, 28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(blob.subarray(28)), decipher.final()]);
}

export function sha256(data: Buffer) {
  return crypto.createHash('sha256').update(data).digest('hex');
}
