import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { dataDir, encryptionKey, isProd } from './config';
import { encrypt, decrypt, sha256 } from './crypto';
import type { QuotePayload, ContactPayload } from '@/lib/quote/schema';

export const quoteStatuses = ['nieuw', 'in-behandeling', 'geoffreerd', 'afgesloten'] as const;
export type QuoteStatus = (typeof quoteStatuses)[number];

export type StoredFile = { id: string; name: string; ext: string; size: number; sha256: string; encrypted: boolean };
export type DeliveryState = 'sent' | 'outbox' | 'failed' | 'skipped';
export type QuoteRecord = {
  id: string;
  createdAt: string;
  status: QuoteStatus;
  payload: QuotePayload;
  files: StoredFile[];
  mail: { notify: DeliveryState; confirmation: DeliveryState };
  history: { at: string; status: QuoteStatus }[];
};
export type ContactRecord = { id: string; createdAt: string; payload: ContactPayload; mail: { notify: DeliveryState } };

const DIR_MODE = 0o700;
const FILE_MODE = 0o600;
const ID_RE = /^GT-\d{6}-[A-Z2-9]{5}$/;
const CONTACT_RE = /^CT-\d{6}-[A-Z2-9]{5}$/;
const FILE_ID_RE = /^[a-f0-9]{24}$/;

const quotesDir = () => path.join(dataDir(), 'quotes');
const contactDir = () => path.join(dataDir(), 'contact');
export const outboxDir = () => path.join(dataDir(), 'outbox');

export async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true, mode: DIR_MODE });
}

async function writeAtomic(file: string, data: Buffer | string) {
  const tmp = `${file}.${crypto.randomBytes(6).toString('hex')}.tmp`;
  await fs.writeFile(tmp, data, { mode: FILE_MODE });
  await fs.rename(tmp, file);
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function code(n: number) {
  const bytes = crypto.randomBytes(n);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}
function datePart() {
  const d = new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', year: '2-digit', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const get = (t: string) => d.find((p) => p.type === t)?.value ?? '00';
  return `${get('year')}${get('month')}${get('day')}`;
}

export function isQuoteId(id: string) {
  return ID_RE.test(id);
}

export async function createQuote(payload: QuotePayload, files: { name: string; ext: string; data: Buffer }[]): Promise<QuoteRecord> {
  await ensureDir(quotesDir());
  let id = '';
  let dir = '';
  for (let i = 0; i < 5; i++) {
    id = `GT-${datePart()}-${code(5)}`;
    dir = path.join(quotesDir(), id);
    try {
      await fs.mkdir(dir, { mode: DIR_MODE });
      break;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e;
      id = '';
    }
  }
  if (!id) throw new Error('Kon geen uniek referentienummer maken.');

  const key = encryptionKey();
  if (!key && isProd && files.length) {
    await fs.rm(dir, { recursive: true, force: true });
    throw new Error('FILE_ENCRYPTION_KEY ontbreekt in productie; bestanden worden niet onversleuteld opgeslagen.');
  }
  const filesDir = path.join(dir, 'files');
  await ensureDir(filesDir);
  const stored: StoredFile[] = [];
  try {
    for (const f of files) {
      const fileId = crypto.randomBytes(12).toString('hex');
      await writeAtomic(path.join(filesDir, fileId), key ? encrypt(f.data, key) : f.data);
      stored.push({ id: fileId, name: f.name, ext: f.ext, size: f.data.length, sha256: sha256(f.data), encrypted: Boolean(key) });
    }
    const now = new Date().toISOString();
    const record: QuoteRecord = { id, createdAt: now, status: 'nieuw', payload, files: stored, mail: { notify: 'skipped', confirmation: 'skipped' }, history: [{ at: now, status: 'nieuw' }] };
    await writeAtomic(path.join(dir, 'record.json'), JSON.stringify(record, null, 2));
    return record;
  } catch (e) {
    await fs.rm(dir, { recursive: true, force: true });
    throw e;
  }
}

export async function getQuote(id: string): Promise<QuoteRecord | null> {
  if (!isQuoteId(id)) return null;
  try {
    return JSON.parse(await fs.readFile(path.join(quotesDir(), id, 'record.json'), 'utf8')) as QuoteRecord;
  } catch {
    return null;
  }
}

export async function saveQuote(record: QuoteRecord) {
  await writeAtomic(path.join(quotesDir(), record.id, 'record.json'), JSON.stringify(record, null, 2));
}

export async function listQuotes(): Promise<QuoteRecord[]> {
  let entries: string[] = [];
  try {
    entries = await fs.readdir(quotesDir());
  } catch {
    return [];
  }
  const records = await Promise.all(entries.filter(isQuoteId).map(getQuote));
  return records.filter((r): r is QuoteRecord => Boolean(r)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  const rec = await getQuote(id);
  if (!rec) return null;
  rec.status = status;
  rec.history.push({ at: new Date().toISOString(), status });
  await saveQuote(rec);
  return rec;
}

export async function deleteQuote(id: string) {
  if (!isQuoteId(id)) return false;
  await fs.rm(path.join(quotesDir(), id), { recursive: true, force: true });
  return true;
}

export async function readQuoteFile(id: string, fileId: string): Promise<{ file: StoredFile; data: Buffer } | null> {
  if (!isQuoteId(id) || !FILE_ID_RE.test(fileId)) return null;
  const rec = await getQuote(id);
  const file = rec?.files.find((f) => f.id === fileId);
  if (!file) return null;
  const raw = await fs.readFile(path.join(quotesDir(), id, 'files', fileId));
  if (!file.encrypted) return { file, data: raw };
  const key = encryptionKey();
  if (!key) throw new Error('Bestand is versleuteld maar FILE_ENCRYPTION_KEY ontbreekt.');
  return { file, data: decrypt(raw, key) };
}

export async function createContact(payload: ContactPayload): Promise<ContactRecord> {
  await ensureDir(contactDir());
  const id = `CT-${datePart()}-${code(5)}`;
  const record: ContactRecord = { id, createdAt: new Date().toISOString(), payload, mail: { notify: 'skipped' } };
  await writeAtomic(path.join(contactDir(), `${id}.json`), JSON.stringify(record, null, 2));
  return record;
}

export async function saveContact(record: ContactRecord) {
  await writeAtomic(path.join(contactDir(), `${record.id}.json`), JSON.stringify(record, null, 2));
}

export async function listContacts(): Promise<ContactRecord[]> {
  let entries: string[] = [];
  try {
    entries = await fs.readdir(contactDir());
  } catch {
    return [];
  }
  const out: ContactRecord[] = [];
  for (const e of entries) {
    if (!CONTACT_RE.test(e.replace(/\.json$/, ''))) continue;
    try {
      out.push(JSON.parse(await fs.readFile(path.join(contactDir(), e), 'utf8')));
    } catch {}
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteContact(id: string) {
  if (!CONTACT_RE.test(id)) return false;
  await fs.rm(path.join(contactDir(), `${id}.json`), { force: true });
  return true;
}
