/**
 * Controleert de map out/ voordat hij naar TransIP gaat.
 *
 *   npm run build && npm run deploy:check
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out');
const fouten = [];

if (!fs.existsSync(OUT)) {
  console.error('out/ bestaat niet — draai eerst: npm run build');
  process.exit(1);
}

// 1. De bestanden die er sowieso moeten zijn.
for (const f of ['index.html', '404.html', '.htaccess', 'icon.png', 'prijslijst-assault-500-2026.pdf', '_next']) {
  if (!fs.existsSync(path.join(OUT, f))) fouten.push(`ontbreekt: ${f}`);
}

const html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');

// 2. Geen enkele verwijzing mag naar een server wijzen die er niet is.
if (html.includes('/_next/image?')) fouten.push('index.html vraagt om /_next/image — dat vereist een Node.js-server');
for (const m of html.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
  const url = m[1].split('?')[0].split('#')[0];
  if (url.startsWith('/_next/') || url === '/') continue;
  if (!fs.existsSync(path.join(OUT, decodeURIComponent(url)))) fouten.push(`verwijst naar een bestand dat niet in out/ staat: ${url}`);
}

// 3. Alle gebundelde scripts en stylesheets moeten bestaan.
for (const m of html.matchAll(/(?:src|href)="(\/_next\/[^"]+)"/g)) {
  if (!fs.existsSync(path.join(OUT, m[1]))) fouten.push(`ontbrekende bundel: ${m[1]}`);
}

const tel = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .reduce((n, e) => n + (e.isDirectory() ? tel(path.join(dir, e.name)) : 1), 0);

if (fouten.length) {
  console.error('NIET IN ORDE:\n' + fouten.map((f) => ' - ' + f).join('\n'));
  process.exit(1);
}
console.log(`out/ is in orde — ${tel(OUT)} bestanden, klaar om naar /www/ te uploaden.`);
