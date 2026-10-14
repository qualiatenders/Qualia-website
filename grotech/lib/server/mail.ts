import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { mailConfig, isProd } from './config';
import { outboxDir, ensureDir, type QuoteRecord, type ContactRecord, type DeliveryState } from './storage';
import { site } from '@/lib/site';
import { techniques, materialOptions, surfaceOptions, labelFor, formatBytes } from '@/lib/quote/options';

type Mail = { to: string | string[]; subject: string; text: string; html: string; replyTo?: string };

let transport: nodemailer.Transporter | null = null;
function smtp() {
  const cfg = mailConfig();
  if (!cfg.host) return null;
  transport ??= nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
    // STARTTLS verplicht, tenzij expliciet uitgezet (alleen voor een lokale testserver).
    requireTLS: !cfg.secure && process.env.SMTP_REQUIRE_TLS !== 'false',
    tls: { minVersion: 'TLSv1.2' },
  });
  return transport;
}

export function mailIsConfigured() {
  const cfg = mailConfig();
  return Boolean(cfg.host && cfg.notifyTo.length);
}

/**
 * Verstuurt via SMTP. Zonder SMTP-configuratie wordt het bericht in ontwikkeling
 * als .eml in de outbox gezet (om te bekijken), en in productie overgeslagen.
 * Er wordt nooit gelogd wát er in een bericht staat.
 */
async function send(mail: Mail, tag: string): Promise<DeliveryState> {
  const cfg = mailConfig();
  const msg = { from: cfg.from, ...mail, subject: mail.subject.replace(/[\r\n]+/g, ' ') };
  const t = smtp();
  if (t) {
    try {
      await t.sendMail(msg);
      return 'sent';
    } catch (e) {
      console.error(`[grotech] e-mail (${tag}) mislukt: ${(e as Error).message}`);
      return 'failed';
    }
  }
  if (isProd) return 'skipped';
  const stream = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
  const info = await stream.sendMail(msg);
  await ensureDir(outboxDir());
  await fs.writeFile(path.join(outboxDir(), `${new Date().toISOString().replace(/[:.]/g, '-')}-${tag}.eml`), info.message as Buffer, { mode: 0o600 });
  return 'outbox';
}

// ── templates ────────────────────────────────────────────────────────────────

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const nl2br = (s: string) => esc(s).replace(/\r?\n/g, '<br>');
const dateNl = (iso: string) => new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' });

function quoteRows(r: QuoteRecord): [string, string][] {
  const p = r.payload;
  const rows: [string, string][] = [
    ['Referentie', r.id],
    ['Productietechniek(en)', p.techniques.map((t) => labelFor(techniques, t)).join(', ')],
    ['Materiaal', [labelFor(materialOptions, p.material), p.materialDetail].filter(Boolean).join(' — ')],
    ['Aantal', String(p.quantity)],
    ['Oppervlaktebehandeling', [labelFor(surfaceOptions, p.surface), p.surfaceDetail].filter(Boolean).join(' — ')],
    ['Toleranties', p.tolerances || '—'],
    ['Gewenste leverdatum', p.deliveryFlexible ? 'Flexibel' + (p.deliveryDate ? ` (bij voorkeur ${dateNl(p.deliveryDate)})` : '') : dateNl(p.deliveryDate)],
    ['Opmerkingen', p.remarks || '—'],
    ['Bestanden', r.files.length ? r.files.map((f) => `${f.name} (${formatBytes(f.size)})`).join('\n') : 'Geen bestanden bijgevoegd'],
    ['Bedrijf', p.company],
    ['Contactpersoon', p.contactName],
    ['E-mail', p.email],
    ['Telefoon', p.phone],
  ];
  if (p.reference) rows.push(['Eigen referentie', p.reference]);
  if (p.extra) rows.push(['Aanvullende informatie', p.extra]);
  return rows;
}

function layout(title: string, intro: string, rows: [string, string][], outro: string) {
  const htmlRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 16px 10px 0;border-bottom:1px solid #e3e5e8;color:#5b636d;font-size:13px;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:10px 0;border-bottom:1px solid #e3e5e8;color:#090b0e;font-size:14px;vertical-align:top">${nl2br(v)}</td></tr>`,
    )
    .join('');
  const html = `<!doctype html><html lang="nl"><body style="margin:0;background:#f6f7f8;font-family:Lato,Segoe UI,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f8;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:6px;overflow:hidden">
<tr><td style="background:#090b0e;padding:22px 28px;border-top:4px solid #f10a1d"><span style="color:#f6f7f8;font-weight:900;letter-spacing:4px;font-size:18px">GROTECH</span><span style="color:#9aa1aa;font-size:11px;letter-spacing:3px;padding-left:12px">PRECISION MANUFACTURING</span></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 12px;font-size:22px;color:#090b0e">${esc(title)}</h1>
<p style="margin:0 0 20px;color:#333a43;font-size:15px;line-height:1.6">${intro}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${htmlRows}</table>
<p style="margin:24px 0 0;color:#333a43;font-size:14px;line-height:1.6">${outro}</p>
</td></tr></table></td></tr></table></body></html>`;
  const plain = (h: string) => h.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  const text = `${title}\n\n${plain(intro)}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${plain(outro)}\n\n— GROTECH | Precision Manufacturing`;
  return { html, text };
}

export async function sendQuoteMails(r: QuoteRecord) {
  const cfg = mailConfig();
  const rows = quoteRows(r);
  const adminUrl = `${site.url}/beheer/aanvragen/${r.id}`;

  let notify: DeliveryState = 'skipped';
  if (cfg.notifyTo.length || !isProd) {
    const n = layout(
      `Nieuwe offerteaanvraag ${r.id}`,
      `Ontvangen op ${dateNl(r.createdAt)} van <strong>${esc(r.payload.company)}</strong>. Bestanden zijn veilig opgeslagen en niet als bijlage meegestuurd.`,
      rows,
      `Open de aanvraag en bestanden in de beheeromgeving: <a href="${esc(adminUrl)}">${esc(adminUrl)}</a>`,
    );
    notify = await send({ to: cfg.notifyTo.length ? cfg.notifyTo : 'grotech@localhost', replyTo: r.payload.email, subject: `Offerteaanvraag ${r.id} — ${r.payload.company}`, ...n }, `${r.id}-intern`);
  }

  const c = layout(
    'Bedankt voor je aanvraag',
    `Beste ${esc(r.payload.contactName)},<br><br>We hebben je offerteaanvraag in goede orde ontvangen onder referentie <strong>${esc(r.id)}</strong>. Een technisch medewerker beoordeelt je tekeningen en specificaties. Hebben we aanvullende informatie nodig, dan nemen we contact met je op. Daarna ontvang je een offerte.`,
    rows.filter(([k]) => !['E-mail', 'Telefoon'].includes(k)),
    'Je technische bestanden worden vertrouwelijk behandeld. Heb je nog een aanvulling of een nieuwe revisie? Antwoord dan op deze e-mail en vermeld je referentienummer.',
  );
  const confirmation = await send({ to: r.payload.email, replyTo: cfg.notifyTo[0], subject: `Je offerteaanvraag bij GROTECH — ${r.id}`, ...c }, `${r.id}-klant`);
  return { notify, confirmation };
}

export async function sendContactMail(r: ContactRecord) {
  const cfg = mailConfig();
  const p = r.payload;
  const rows: [string, string][] = [
    ['Naam', p.name],
    ['Bedrijf', p.company || '—'],
    ['E-mail', p.email],
    ['Telefoon', p.phone || '—'],
    ['Onderwerp', p.subject || '—'],
    ['Bericht', p.message],
  ];
  const n = layout(`Nieuw contactbericht ${r.id}`, `Ontvangen via het contactformulier op ${dateNl(r.createdAt)}.`, rows, 'Beantwoord dit bericht rechtstreeks; het antwoordadres is dat van de afzender.');
  if (!cfg.notifyTo.length && isProd) return 'skipped' as DeliveryState;
  return send({ to: cfg.notifyTo.length ? cfg.notifyTo : 'grotech@localhost', replyTo: p.email, subject: `Contactbericht ${r.id} — ${p.name}`, ...n }, `${r.id}-contact`);
}
