/**
 * artifact/assault-500.src.html -> artifact/assault-500.html
 * Sluit elke afbeelding in als data-URI, zodat de artifact één bestand is.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const SP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'artifact');
const PUB = path.resolve(SP, '..', 'public', 'images');
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

const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };

const uri = (f0) => { const f = resolveImage(f0); return `data:${MIME[path.extname(f).toLowerCase()]};base64,${fs.readFileSync(f).toString('base64')}`; };

/* Ingesloten beeld hoeft niet groter te zijn dan het op scherm wordt getoond;
   dit houdt het ene bestand hanteerbaar. Alpha blijft behouden (WebP). */
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const shrinkPage = await browser.newPage();
async function shrink(f, max) {
  return shrinkPage.evaluate(async ([src, max]) => {
    const i = new Image();
    i.src = src;
    await i.decode();
    const k = Math.min(1, max / Math.max(i.naturalWidth, i.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(i.naturalWidth * k);
    c.height = Math.round(i.naturalHeight * k);
    c.getContext('2d').drawImage(i, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.82);
  }, [uri(f), max]);
}

// Alle .webp uit renders/ en photography/, op basisnaam.
const images = {};
for (const dir of ['renders', 'photography']) {
  for (const f of fs.readdirSync(path.join(PUB, dir))) {
    if (!f.endsWith('.webp')) continue;
    images[path.basename(f, '.webp')] = await shrink(path.join(PUB, dir, f), 1400);
  }
}

const markSrc = await shrink(path.join(PUB, 'brand', 'logo.webp'), 900) /* elke extensie werkt */;

/* De prijslijst gaat als beeld mee: één bestand kan geen PDF openen.
   Hogere kwaliteit dan de foto's, want dit is tekst. */
const PAGES = path.resolve(SP, '..', 'pricelist', 'pages');
const pricelist = [];
for (const f of fs.readdirSync(PAGES).sort()) {
  if (/\.(jpe?g|png|webp)$/i.test(f)) pricelist.push(await shrink(path.join(PAGES, f), 1400, 0.9));
}

let html = fs.readFileSync(path.join(SP, 'assault-500.src.html'), 'utf8');
html = html.replace('__IMAGES__', () => JSON.stringify(images));
html = html.replace('__PRICELIST__', () => JSON.stringify(pricelist));
html = html.replace('__IMG_mark__', () => markSrc);
await browser.close();

const out = path.join(SP, 'assault-500.html');
fs.writeFileSync(out, html);
console.log('geschreven:', out, `${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB`, '| beelden:', Object.keys(images).length, '| prijslijst:', pricelist.length + " pagina's");
