/**
 * Maakt van out/ een preview die werkt op een willekeurig pad.
 *
 *   node scripts/build-preview.mjs <doelmap>
 *
 * De echte site staat in de hoofdmap van assaultboats.nl, dus daar kloppen
 * paden die met een slash beginnen. Een preview wordt op een diepere map
 * geserveerd en dan komt zo'n pad nergens uit. Daarom:
 *
 *   1. alle pagina's op één niveau (assault-500/index.html -> assault-500.html),
 *      zodat er geen diepteverschil meer is;
 *   2. elke interne verwijzing verliest zijn beginslash;
 *   3. de startpagina wordt "./", want die wordt op de map zelf geserveerd.
 *
 * De verwijzingen staan op drie plekken: gewoon in de HTML, backslash-ontsnapt
 * in de React-gegevens in diezelfde HTML, en nog eens in de JS-bundels. Alle
 * drie moeten mee, anders klopt de pagina tot React hem overneemt en daarna
 * niet meer — zo verdween eerder het menu in een "page not found".
 *
 * out/ zelf wordt niet aangeraakt.
 */
import fs from 'node:fs';
import path from 'node:path';

const BRON = 'out';
const DOEL = process.argv[2];
if (!DOEL) throw new Error('geef een doelmap op');

const ROUTES = ['assault-500-fish', 'assault-500', 'aluminium-visboot', 'aluminium-v-jon',
                'over-assault', 'contact', 'privacy', 'algemene-voorwaarden', 'bedankt'];
const MAPPEN = ['nextjs/', 'images/', 'icons/', 'og/'];
const LOSSE = ['favicon.ico', 'icon.png', 'robots.txt', 'sitemap.xml', 'prijslijst-assault-500-2026.pdf'];

fs.rmSync(DOEL, { recursive: true, force: true });
fs.cpSync(BRON, DOEL, { recursive: true });

const weg = (p) => fs.rmSync(path.join(DOEL, p), { recursive: true, force: true });
const alles = (d = DOEL) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? alles(path.join(d, e.name)) : [path.join(d, e.name)]);

// Wat in een preview niets doet.
for (const f of alles()) {
  const n = path.basename(f);
  if (n === 'index.txt' || n === '.gitkeep' || n === '.htaccess' || n === 'README.md'
      || n === 'manifest.webmanifest' || n.startsWith('polyfills-') || n.includes(' ')) {
    fs.rmSync(f, { force: true });
  }
}
// _next is bij de preview-dienst een gereserveerde naam.
fs.renameSync(path.join(DOEL, '_next'), path.join(DOEL, 'nextjs'));
for (const f of alles()) {
  if (/\.(html|js|css)$/.test(f)) {
    const s = fs.readFileSync(f, 'utf8');
    if (s.includes('/_next/')) fs.writeFileSync(f, s.replaceAll('/_next/', '/nextjs/'));
  }
}

// 1. Pagina's plat.
weg('404.html');
for (const r of [...ROUTES, '404']) {
  const bron = path.join(DOEL, r, 'index.html');
  if (fs.existsSync(bron)) {
    fs.renameSync(bron, path.join(DOEL, `${r}.html`));
    weg(r);
  }
}

// 2. en 3. HTML omzetten.
for (const n of fs.readdirSync(DOEL)) {
  if (!n.endsWith('.html')) continue;
  const f = path.join(DOEL, n);
  const thuis = n === 'index.html';
  let s = fs.readFileSync(f, 'utf8');
  for (const q of ['"', '\\"']) {
    for (const r of ROUTES) {
      s = s.replaceAll(`${q}/${r}/${q}`, `${q}${r}.html${q}`);
      s = s.replaceAll(`${q}/${r}/#`, `${q}${r}.html#`);
    }
    s = s.replaceAll(`${q}/${q}`, `${q}./${q}`);
    s = s.replaceAll(`${q}/#`, thuis ? `${q}#` : `${q}./#`);
    for (const m of MAPPEN) s = s.replaceAll(`${q}/${m}`, `${q}${m}`);
    for (const b of LOSSE) s = s.replaceAll(`${q}/${b}${q}`, `${q}${b}${q}`);
  }
  s = s.replaceAll('url(/', 'url(').replace(/<link rel="manifest"[^>]*>/, '');
  fs.writeFileSync(f, s);
}

// CSS meet url() tegen het CSS-bestand zelf af, niet tegen de pagina.
for (const f of alles(path.join(DOEL, 'nextjs'))) {
  if (!f.endsWith('.css')) continue;
  const naar = path.relative(path.dirname(f), DOEL).split(path.sep).join('/') + '/';
  const s = fs.readFileSync(f, 'utf8');
  fs.writeFileSync(f, s.replaceAll('/nextjs/', naar + 'nextjs/').replaceAll('/images/', naar + 'images/'));
}

// De JS-bundels: waar stukken vandaan komen, de beeldpaden, en de menulinks.
for (const f of alles(path.join(DOEL, 'nextjs'))) {
  if (!f.endsWith('.js')) continue;
  const s = fs.readFileSync(f, 'utf8');
  let t = s.replaceAll('"/nextjs/"', '"nextjs/"').replaceAll('"/images/', '"images/');
  for (const r of ROUTES) t = t.replaceAll(`href:"/${r}/"`, `href:"${r}.html"`);
  t = t.replaceAll('href:"/#', 'href:"./#').replaceAll('href:"/"', 'href:"./"');
  if (t !== s) fs.writeFileSync(f, t);
}

console.log(`preview klaar: ${alles().length} bestanden in ${DOEL}`);
