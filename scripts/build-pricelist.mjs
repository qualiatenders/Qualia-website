/**
 * Rendert pricelist/prijslijst.html naar public/prijslijst-assault-500-2026.pdf.
 *
 * Fonts en afbeeldingen worden als data-URI ingesloten, zodat de PDF
 * offline en identiek reproduceerbaar is.
 *
 *   node scripts/build-pricelist.mjs [--png]
 *
 * Vereist playwright + een Chromium; zet zo nodig CHROME_PATH.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'pricelist', 'prijslijst.html');
const FONTS = path.join(ROOT, 'pricelist', 'fonts-inline.css');
const OUT = path.join(ROOT, 'public', 'prijslijst-assault-500-2026.pdf');

/**
 * Zoekt een beeld op basisnaam, zodat een nieuw logo in elk formaat werkt:
 * één bestand in public/images/brand/ vervangt het overal.
 */
const EXT_ORDER = ['.svg', '.avif', '.webp', '.jpg', '.jpeg', '.png'];
function resolveImage(file) {
  if (fs.existsSync(file)) return file;
  const dir = path.dirname(file);
  const base = path.basename(file, path.extname(file));
  for (const ext of EXT_ORDER) {
    const candidate = path.join(dir, base + ext);
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Geen beeld gevonden voor ${file}`);
}

const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' };

let html = fs.readFileSync(SRC, 'utf8');

html = html.replace('/*FONTS*/', () => fs.readFileSync(FONTS, 'utf8'));

html = html.replace(/src="(\/images\/[^"]+)"/g, (_m, p) => {
  const file = resolveImage(path.join(ROOT, 'public', p));
  const b64 = fs.readFileSync(file).toString('base64');
  return `src="data:${MIME[path.extname(file).toLowerCase()]};base64,${b64}"`;
});

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

await page.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true });

/*
 * De artifact is één bestand en kan geen PDF openen, dus de prijslijst gaat
 * daar als beeld mee. Deze paginabeelden zijn de bron daarvoor.
 */
if (process.argv.includes('--pages')) {
  fs.mkdirSync(path.join(ROOT, 'pricelist', 'pages'), { recursive: true });
  const hi = await browser.newPage({ deviceScaleFactor: 2 });
  await hi.setContent(html, { waitUntil: 'load' });
  await hi.evaluate(() => document.fonts.ready);
  const sheets = await hi.$$('.page');
  for (let i = 0; i < sheets.length; i++) {
    const shot = await sheets[i].screenshot({ type: 'jpeg', quality: 92 });
    fs.writeFileSync(path.join(ROOT, 'pricelist', 'pages', `p${i + 1}.jpg`), shot);
    console.log(`pagina ${i + 1}: ${(shot.length / 1024).toFixed(0)} KB`);
  }
  await hi.close();
}

if (process.argv.includes('--png')) {
  await page.setViewportSize({ width: 794, height: 1123 });
  const pages = await page.$$('.page');
  for (let i = 0; i < pages.length; i++) {
    await pages[i].screenshot({ path: path.join(ROOT, 'pricelist', 'preview', `p${i + 1}.png`) });
  }
}

await browser.close();
console.log('PDF geschreven:', path.relative(ROOT, OUT), `${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
