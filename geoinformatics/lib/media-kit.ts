import { LOGO_PATHS, LOGO_VIEWBOX } from './brand-paths';
import 'server-only';
import fs from 'node:fs/promises';
import zlib from 'node:zlib';
import path from 'node:path';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { otherFormats, placements, targetingOptions } from './ads/placements';
import { audienceStats, creativeSpecs, rateCard } from './ads/commercial';
import { categories } from './taxonomy';
import { absoluteUrl, site } from './site';

/**
 * Media kit PDF, generated on request from the same data as the Advertise
 * page: placement registry, configured rates (or "on request") and verified
 * audience figures (only when configured). Update a rate or slot and the PDF
 * follows — no design file to keep in sync.
 */

const W = 595.28;
const H = 841.89;
const M = 48;
const ink = rgb(0.043, 0.051, 0.063);
const red = rgb(0.843, 0.098, 0.125);
const white = rgb(1, 1, 1);
// House rule: white text on dark, black text on white — no grey text.
const fog = white;
const stone = ink;
const line = rgb(0.85, 0.85, 0.83);
const paper = rgb(0.96, 0.96, 0.953);

type Fonts = { display: PDFFont; displayBold: PDFFont; body: PDFFont; bodyBold: PDFFont };

/**
 * fontkit can't read WOFF directly, and the self-hosted fonts ship as WOFF.
 * WOFF 1.0 is just zlib-compressed sfnt tables, so unwrap it to a TTF.
 */
function woffToSfnt(woff: Buffer) {
  const numTables = woff.readUInt16BE(12);
  const flavor = woff.readUInt32BE(4);
  const tables = Array.from({ length: numTables }, (_, i) => {
    const o = 44 + i * 20;
    const tag = woff.readUInt32BE(o);
    const off = woff.readUInt32BE(o + 4);
    const compLen = woff.readUInt32BE(o + 8);
    const origLen = woff.readUInt32BE(o + 12);
    const checksum = woff.readUInt32BE(o + 16);
    const raw = woff.subarray(off, off + compLen);
    return { tag, checksum, data: compLen < origLen ? zlib.inflateSync(raw) : raw };
  });
  let entrySelector = 0;
  while (2 ** (entrySelector + 1) <= numTables) entrySelector++;
  const searchRange = 2 ** entrySelector * 16;
  const header = Buffer.alloc(12 + numTables * 16);
  header.writeUInt32BE(flavor, 0);
  header.writeUInt16BE(numTables, 4);
  header.writeUInt16BE(searchRange, 6);
  header.writeUInt16BE(entrySelector, 8);
  header.writeUInt16BE(numTables * 16 - searchRange, 10);
  let offset = header.length;
  const bodies: Buffer[] = [];
  tables.forEach((t, i) => {
    header.writeUInt32BE(t.tag, 12 + i * 16);
    header.writeUInt32BE(t.checksum, 16 + i * 16);
    header.writeUInt32BE(offset, 20 + i * 16);
    header.writeUInt32BE(t.data.length, 24 + i * 16);
    const padded = Buffer.alloc((t.data.length + 3) & ~3);
    t.data.copy(padded);
    bodies.push(padded);
    offset += padded.length;
  });
  return Buffer.concat([header, ...bodies]);
}

const font = async (p: string) => woffToSfnt(await fs.readFile(path.join(process.cwd(), 'node_modules', p)));

function wrap(text: string, f: PDFFont, size: number, max: number) {
  const out: string[] = [];
  let cur = '';
  for (const w of text.split(/\s+/)) {
    const next = cur ? `${cur} ${w}` : w;
    if (f.widthOfTextAtSize(next, size) > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
}

function para(page: PDFPage, text: string, x: number, y: number, o: { font: PDFFont; size: number; max: number; color?: ReturnType<typeof rgb>; leading?: number }) {
  const lines = wrap(text, o.font, o.size, o.max);
  const lead = o.leading ?? o.size * 1.45;
  lines.forEach((l, i) => page.drawText(l, { x, y: y - i * lead, size: o.size, font: o.font, color: o.color ?? ink }));
  return y - lines.length * lead;
}

/** Official logo from its vector paths: "GEO" red, "Informatics" white on dark pages and black on white pages. */
function logo(page: PDFPage, x: number, y: number, height: number, word = white) {
  const k = height / LOGO_VIEWBOX.h;
  const at = { x: x - LOGO_VIEWBOX.x * k, y: y + height + LOGO_VIEWBOX.y * k, scale: k };
  page.drawSvgPath(LOGO_PATHS.grey, { ...at, color: rgb(0xbb / 255, 0xbe / 255, 0xc1 / 255) });
  page.drawSvgPath(LOGO_PATHS.red, { ...at, color: red });
  page.drawSvgPath(LOGO_PATHS.word, { ...at, color: word });
}

function footer(page: PDFPage, f: Fonts, n: number) {
  logo(page, W - M - 88, H - 48, 18, ink);
  page.drawLine({ start: { x: M, y: 36 }, end: { x: W - M, y: 36 }, thickness: 0.5, color: line });
  page.drawText(`${site.name} · Media kit ${new Date().getFullYear()}`, { x: M, y: 22, size: 7.5, font: f.body, color: stone });
  page.drawText(String(n).padStart(2, '0'), { x: W - M - 10, y: 22, size: 7.5, font: f.bodyBold, color: red });
}

function heading(page: PDFPage, f: Fonts, idx: string, title: string, y: number) {
  page.drawText(idx, { x: M, y: y + 4, size: 8, font: f.bodyBold, color: red });
  page.drawText(title.toUpperCase(), { x: M + 24, y, size: 22, font: f.displayBold, color: ink });
  page.drawLine({ start: { x: M, y: y - 12 }, end: { x: W - M, y: y - 12 }, thickness: 1, color: ink });
  return y - 36;
}

export async function buildMediaKit() {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const f: Fonts = {
    display: await doc.embedFont(await font('@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff'), { features: { liga: false, kern: false, calt: false } }),
    displayBold: await doc.embedFont(await font('@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff'), { features: { liga: false, kern: false, calt: false } }),
    body: await doc.embedFont(await font('@fontsource/inter/files/inter-latin-400-normal.woff'), { features: { liga: false, kern: false, calt: false } }),
    bodyBold: await doc.embedFont(await font('@fontsource/inter/files/inter-latin-600-normal.woff'), { features: { liga: false, kern: false, calt: false } }),
  };
  doc.setTitle(`${site.name} — Media kit ${new Date().getFullYear()}`);
  doc.setAuthor(site.name);
  doc.setSubject('Advertising and partnership opportunities');
  doc.setCreationDate(new Date());

  const rates = rateCard();
  const stats = audienceStats();
  const year = new Date().getFullYear();

  // ── 1. Cover ────────────────────────────────────────────────────────────
  {
    const p = doc.addPage([W, H]);
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: ink });
    for (let x = 0; x < W; x += 48) p.drawLine({ start: { x, y: 0 }, end: { x, y: H }, thickness: 0.3, color: rgb(0.12, 0.13, 0.15) });
    for (let y = 0; y < H; y += 48) p.drawLine({ start: { x: 0, y }, end: { x: W, y }, thickness: 0.3, color: rgb(0.12, 0.13, 0.15) });
    // orbit motif
    p.drawEllipse({ x: W * 0.62, y: -260, xScale: 520, yScale: 520, borderColor: rgb(0.35, 0.37, 0.4), borderWidth: 0.6 });
    p.drawEllipse({ x: W * 0.7, y: -220, xScale: 640, yScale: 560, borderColor: red, borderWidth: 1.2 });
    logo(p, M, H - M - 34, 34, white);
    p.drawText(`MEDIA KIT ${year}`, { x: M, y: H - 190, size: 9, font: f.bodyBold, color: red });
    let y = H - 240;
    for (const l of ['PUT YOUR BRAND', 'AT THE CENTER OF', 'GEOSPATIAL', 'INNOVATION.']) {
      p.drawText(l, { x: M, y, size: 46, font: f.displayBold, color: white });
      y -= 48;
    }
    para(p, 'Display, sponsored content, newsletter and event partnerships alongside independent journalism for the geospatial industry.', M, y - 20, { font: f.body, size: 12, max: 380, color: fog, leading: 18 });
    p.drawText(absoluteUrl('/advertise/').replace(/^https?:\/\//, ''), { x: M, y: M, size: 9, font: f.bodyBold, color: white });
  }

  // ── 2. Platform & audience ──────────────────────────────────────────────
  {
    const p = doc.addPage([W, H]);
    let y = heading(p, f, '01', 'The platform', H - 80);
    y = para(p, site.description, M, y, { font: f.display, size: 15, max: W - 2 * M, leading: 21 });
    y -= 14;
    y = para(p, 'Readers come to GeoInformatics for news, analysis and interviews across ten industry desks. Advertising sits inside a calm, editorial layout: every slot is designed into the page and labelled, so brands appear next to journalism people trust.', M, y, { font: f.body, size: 10, max: W - 2 * M, color: stone, leading: 15 });
    y -= 24;
    p.drawText('INDUSTRY DESKS', { x: M, y, size: 8, font: f.bodyBold, color: red });
    y -= 18;
    categories.forEach((c, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = M + col * ((W - 2 * M) / 2);
      const yy = y - row * 20;
      p.drawText(c.code, { x, y: yy, size: 8, font: f.bodyBold, color: red });
      p.drawText(c.name, { x: x + 36, y: yy, size: 10, font: f.body, color: ink });
    });
    y -= Math.ceil(categories.length / 2) * 20 + 30;

    y = heading(p, f, '02', 'Who you reach', y);
    const groups = [
      ['Surveyors & engineers', 'Professionals who specify and use measurement technology.'],
      ['GIS & data teams', 'Analysts and developers building spatial data infrastructure.'],
      ['Researchers & EO specialists', 'Remote sensing scientists and the downstream EO sector.'],
      ['Decision-makers', 'Directors and founders who set budgets and choose platforms.'],
    ];
    groups.forEach(([t, b], i) => {
      const x = M + (i % 2) * ((W - 2 * M) / 2);
      const yy = y - Math.floor(i / 2) * 54;
      p.drawText(t!, { x, y: yy, size: 11, font: f.displayBold, color: ink });
      para(p, b!, x, yy - 15, { font: f.body, size: 9, max: (W - 2 * M) / 2 - 16, color: stone, leading: 13 });
    });
    y -= 2 * 54 + 16;
    if (stats.length) {
      const cw = (W - 2 * M) / Math.min(stats.length, 4);
      stats.slice(0, 4).forEach((s, i) => {
        const x = M + i * cw;
        p.drawRectangle({ x, y: y - 70, width: cw - 8, height: 78, color: paper });
        p.drawText(s.label.toUpperCase(), { x: x + 10, y: y - 6, size: 6.5, font: f.bodyBold, color: stone });
        p.drawText(s.value, { x: x + 10, y: y - 36, size: 22, font: f.displayBold, color: ink });
        para(p, `Source: ${s.source}`, x + 10, y - 52, { font: f.body, size: 6.5, max: cw - 28, color: stone, leading: 9 });
      });
    } else {
      p.drawRectangle({ x: M, y: y - 36, width: W - 2 * M, height: 44, borderColor: line, borderWidth: 0.8, borderDashArray: [3, 3] });
      p.drawText('Verified audience and traffic figures are available on request, with source and measurement period.', { x: M + 12, y: y - 18, size: 9, font: f.body, color: stone });
    }
    footer(p, f, 2);
  }

  // ── 3. Display placements ───────────────────────────────────────────────
  {
    const p = doc.addPage([W, H]);
    let y = heading(p, f, '03', 'Display placements', H - 80);
    const cols = [M, M + 190, M + 268, M + 340];
    ['PLACEMENT', 'DESKTOP', 'MOBILE', 'RATE'].forEach((h, i) => p.drawText(h, { x: cols[i]!, y, size: 7, font: f.bodyBold, color: stone }));
    y -= 10;
    for (const pl of placements) {
      p.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.5, color: line });
      y -= 16;
      p.drawText(pl.name, { x: cols[0]!, y, size: 10, font: f.bodyBold, color: ink });
      p.drawText(`${pl.desktop.w}×${pl.desktop.h}`, { x: cols[1]!, y, size: 9, font: f.body, color: ink });
      p.drawText('mobile' in pl && pl.mobile ? `${pl.mobile.w}×${pl.mobile.h}` : '—', { x: cols[2]!, y, size: 9, font: f.body, color: ink });
      p.drawText(rates[pl.id] ?? 'On request', { x: cols[3]!, y, size: 9, font: f.body, color: rates[pl.id] ? ink : stone });
      y = para(p, pl.where, cols[0]!, y - 14, { font: f.body, size: 8, max: W - 2 * M - 40, color: stone, leading: 11 }) - 8;
    }
    y -= 20;
    p.drawRectangle({ x: M, y: y - 150, width: W - 2 * M, height: 160, color: ink });
    p.drawText('CREATIVE SPECIFICATIONS', { x: M + 18, y: y - 14, size: 8, font: f.bodyBold, color: red });
    let sy = y - 34;
    for (const s of creativeSpecs) {
      p.drawRectangle({ x: M + 18, y: sy + 2, width: 4, height: 4, color: red });
      sy = para(p, s, M + 30, sy, { font: f.body, size: 8.5, max: W - 2 * M - 60, color: white, leading: 12 }) - 6;
    }
    footer(p, f, 3);
  }

  // ── 4. Beyond display, reporting, contact ───────────────────────────────
  {
    const p = doc.addPage([W, H]);
    let y = heading(p, f, '04', 'Beyond display', H - 80);
    for (const o of otherFormats) {
      p.drawText(o.title, { x: M, y, size: 12, font: f.displayBold, color: ink });
      y = para(p, o.body, M, y - 16, { font: f.body, size: 9, max: W - 2 * M, color: stone, leading: 13 }) - 14;
    }
    y -= 6;
    y = heading(p, f, '05', 'Targeting & reporting', y);
    for (const t of targetingOptions) {
      p.drawText(t.title, { x: M, y, size: 10, font: f.bodyBold, color: ink });
      y = para(p, t.body, M + 110, y, { font: f.body, size: 9, max: W - 2 * M - 110, color: stone, leading: 13 }) - 8;
    }
    y = para(p, 'Every campaign comes with reporting from our own ad platform: impressions, viewable impressions (IAB/MRC: 50% of pixels in view for at least one second), clicks, CTR and device split, exportable as CSV.', M, y - 6, { font: f.body, size: 9, max: W - 2 * M, color: stone, leading: 13 });
    y -= 16;
    y = para(p, 'Editorial independence: advertisers never influence news coverage. Sponsored content is always labelled and kept separate from journalism.', M, y, { font: f.bodyBold, size: 9, max: W - 2 * M, color: ink, leading: 13 });

    p.drawRectangle({ x: 0, y: 36 + 12, width: W, height: 150, color: red });
    p.drawText("LET'S TALK.", { x: M, y: 36 + 120, size: 30, font: f.displayBold, color: white });
    const contactLine = site.email.advertising ? site.email.advertising : absoluteUrl('/advertise/#enquire').replace(/^https?:\/\//, '');
    p.drawText(contactLine, { x: M, y: 36 + 88, size: 13, font: f.bodyBold, color: white });
    p.drawText('Request a proposal, availability and rates.', { x: M, y: 36 + 68, size: 10, font: f.body, color: white });
    footer(p, f, 4);
  }

  return doc.save();
}
