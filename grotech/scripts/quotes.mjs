/**
 * Beheer van opgeslagen aanvragen vanaf de server (bijv. via cron).
 *
 *   node scripts/quotes.mjs list
 *   node scripts/quotes.mjs purge --days 730            # droge run: toont wat weg zou gaan
 *   node scripts/quotes.mjs purge --days 730 --confirm  # verwijdert echt
 *
 * "purge" verwijdert offerteaanvragen (incl. bestanden) met status nieuw of
 * afgesloten die ouder zijn dan --days, en contactberichten ouder dan
 * --contact-days (standaard 365). Aanvragen met status "in-behandeling" of
 * "geoffreerd" blijven staan; sluit die eerst af in /beheer.
 */
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve(process.env.GROTECH_DATA_DIR || 'storage');
const [cmd, ...rest] = process.argv.slice(2);
const arg = (n, d) => { const i = rest.indexOf(`--${n}`); return i >= 0 ? rest[i + 1] : d; };
const confirm = rest.includes('--confirm');
const qDir = path.join(dataDir, 'quotes');
const cDir = path.join(dataDir, 'contact');
const read = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const quotes = () => (fs.existsSync(qDir) ? fs.readdirSync(qDir) : []).filter((d) => /^GT-/.test(d)).map((d) => read(path.join(qDir, d, 'record.json'))).filter(Boolean);

if (cmd === 'list') {
  for (const q of quotes().sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
    console.log(`${q.id}  ${q.createdAt.slice(0, 10)}  ${q.status.padEnd(15)} ${String(q.files.length).padStart(2)} bestand(en)  ${q.payload.company}`);
} else if (cmd === 'purge') {
  const days = Number(arg('days', '730'));
  const cdays = Number(arg('contact-days', '365'));
  const now = Date.now();
  let n = 0;
  for (const q of quotes()) {
    const last = new Date(q.history?.at(-1)?.at ?? q.createdAt).getTime();
    if ((q.status === 'nieuw' || q.status === 'afgesloten') && now - last > days * 864e5) {
      console.log(`${confirm ? 'verwijderd' : 'zou verwijderen'}: ${q.id} (${q.status}, laatst gewijzigd ${new Date(last).toISOString().slice(0, 10)})`);
      if (confirm) fs.rmSync(path.join(qDir, q.id), { recursive: true, force: true });
      n++;
    }
  }
  for (const f of fs.existsSync(cDir) ? fs.readdirSync(cDir) : []) {
    const c = read(path.join(cDir, f));
    if (c && now - new Date(c.createdAt).getTime() > cdays * 864e5) {
      console.log(`${confirm ? 'verwijderd' : 'zou verwijderen'}: ${c.id} (contact)`);
      if (confirm) fs.rmSync(path.join(cDir, f), { force: true });
      n++;
    }
  }
  console.log(`${n} item(s)${confirm ? ' verwijderd' : ' — droge run, voeg --confirm toe om te verwijderen'}.`);
} else {
  console.log('Gebruik: node scripts/quotes.mjs list | purge --days 730 [--contact-days 365] [--confirm]');
}
