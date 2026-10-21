import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { dataDir, isProd, mailConfig } from './config';

type Mail = { to: string[]; subject: string; text: string; replyTo?: string };

let transport: nodemailer.Transporter | null = null;
function smtp() {
  const cfg = mailConfig();
  if (!cfg.host) return null;
  transport ??= nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
    requireTLS: !cfg.secure && process.env.SMTP_REQUIRE_TLS !== 'false',
    tls: { minVersion: 'TLSv1.2' },
  });
  return transport;
}

export const mailReady = () => Boolean(mailConfig().host);

/**
 * Sends via SMTP. Without SMTP in development, the message is written to
 * storage/outbox/*.eml so the flow can be tested end to end. In production
 * without SMTP, sending fails loudly instead of pretending.
 */
export async function sendMail(mail: Mail): Promise<'sent' | 'outbox'> {
  const cfg = mailConfig();
  const t = smtp();
  if (t && mail.to.length) {
    await t.sendMail({ from: cfg.from, to: mail.to, subject: mail.subject, text: mail.text, replyTo: mail.replyTo });
    return 'sent';
  }
  if (isProd) throw new Error('SMTP is not configured (SMTP_HOST and MAIL_*_TO).');
  const dir = path.join(dataDir(), 'outbox');
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const eml = `From: ${cfg.from}\nTo: ${mail.to.join(', ') || 'unconfigured@localhost'}\n${mail.replyTo ? `Reply-To: ${mail.replyTo}\n` : ''}Subject: ${mail.subject}\nContent-Type: text/plain; charset=utf-8\n\n${mail.text}\n`;
  await fs.writeFile(path.join(dir, `${Date.now()}.eml`), eml, { mode: 0o600 });
  return 'outbox';
}

/** Inquiries are also kept on disk (outside the web root), so nothing is lost if mail fails. */
export async function storeInquiry(kind: string, data: Record<string, unknown>) {
  const dir = dataDir();
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  await fs.appendFile(path.join(dir, 'inquiries.jsonl'), JSON.stringify({ kind, at: new Date().toISOString(), ...data }) + '\n', { mode: 0o600 });
}
