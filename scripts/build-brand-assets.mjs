/**
 * Genereert het deelbeeld en de icon-set uit bestaand merkmateriaal.
 *
 *   node scripts/build-brand-assets.mjs
 *
 * Uitvoer:
 *   public/og/assault-boats.jpg   1200x630, wat WhatsApp/LinkedIn/Facebook tonen
 *   public/favicon.ico            16 + 32 + 48, voor oude browsers en Google
 *   public/icons/*.png            apple-touch-icon en de manifest-iconen
 *
 * Bron voor de iconen is app/icon.png. Vervang dat bestand en draai dit
 * script opnieuw, dan is de hele set in één keer bijgewerkt.
 *
 * Vereist playwright + een Chromium; zet zo nodig CHROME_PATH.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uri = (p, mime) => `data:${mime};base64,${fs.readFileSync(path.join(ROOT, p)).toString('base64')}`;

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });

/* ------------------------------------------------------------------
   1. Deelbeeld — 1200x630
------------------------------------------------------------------ */
const fonts = fs.readFileSync(path.join(ROOT, 'pricelist', 'fonts-inline.css'), 'utf8');
const render = uri('public/images/renders/render-aft-quarter.webp', 'image/webp');
const logo = uri('public/images/brand/logo.webp', 'image/webp');

const ogPage = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await ogPage.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
${fonts}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#000;color:#f2f1ed;
  font-family:'Inter',Arial,sans-serif;position:relative;display:flex;align-items:center}
/* De render ligt half over de rechterhelft heen en loopt de rand uit. */
.boat{position:absolute;right:-60px;top:50%;transform:translateY(-46%);width:760px;opacity:.95}
.body{position:relative;z-index:2;padding:0 64px;max-width:660px}
.rule{display:block;width:56px;height:4px;background:#c0272c}
.label{display:block;margin-top:26px;font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:500;
  letter-spacing:.22em;text-transform:uppercase;color:#999}
h1{margin-top:20px;font-family:'Archivo',Arial,sans-serif;font-weight:800;font-size:104px;line-height:.84;
  letter-spacing:-.045em;text-transform:uppercase}
p{margin-top:26px;font-size:22px;line-height:1.5;color:#999;max-width:480px}
.mark{position:absolute;left:64px;bottom:44px;height:44px;z-index:2}
/* Zachte zwarte val links, zodat de tekst altijd op rustige grond staat. */
.veil{position:absolute;inset:0;z-index:1;
  background:linear-gradient(90deg,#000 0%,#000 42%,rgba(0,0,0,.55) 62%,rgba(0,0,0,0) 88%)}
</style></head><body>
  <img class="boat" src="${render}" alt="">
  <div class="veil"></div>
  <div class="body">
    <span class="rule"></span>
    <span class="label">Aluminium V-jon &middot; Gebouwd in Nederland</span>
    <h1>Assault<br>500</h1>
    <p>5 meter, 4 mm aluminium. Open of als Fish met vast werpdek.</p>
  </div>
  <img class="mark" src="${logo}" alt="">
</body></html>`);
await ogPage.evaluate(() => document.fonts.ready);
await ogPage.waitForTimeout(300);
fs.mkdirSync(path.join(ROOT, 'public', 'og'), { recursive: true });
const ogPath = path.join(ROOT, 'public', 'og', 'assault-boats.jpg');
await ogPage.screenshot({ path: ogPath, type: 'jpeg', quality: 88 });
await ogPage.close();
console.log(`og-beeld: 1200x630, ${(fs.statSync(ogPath).size / 1024).toFixed(0)} KB`);

/* ------------------------------------------------------------------
   2. Iconen — uit app/icon.png
------------------------------------------------------------------ */
const iconSrc = uri('app/icon.png', 'image/png');
const iconPage = await browser.newPage();
await iconPage.setContent('<canvas id="c"></canvas>');

/**
 * @param size    kantlengte in pixels
 * @param inset   marge rondom, als fractie — maskable iconen worden door
 *                Android bijgesneden, dus die krijgen extra lucht
 * @param bg      achtergrond, of null voor transparant
 */
async function icon(size, { inset = 0, bg = null } = {}) {
  const dataUrl = await iconPage.evaluate(async ([src, size, inset, bg]) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.getElementById('c');
    c.width = c.height = size;
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    if (bg) {
      x.fillStyle = bg;
      x.fillRect(0, 0, size, size);
    }
    const box = size * (1 - inset * 2);
    const k = Math.min(box / img.naturalWidth, box / img.naturalHeight);
    const w = img.naturalWidth * k;
    const h = img.naturalHeight * k;
    x.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    return c.toDataURL('image/png');
  }, [iconSrc, size, inset, bg]);
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

fs.mkdirSync(path.join(ROOT, 'public', 'icons'), { recursive: true });
const schrijf = (naam, buf) => {
  const p = path.join(ROOT, 'public', naam);
  fs.writeFileSync(p, buf);
  return `${naam} (${(buf.length / 1024).toFixed(0)} KB)`;
};

const gemaakt = [];
// Apple zet zelf geen achtergrond achter een doorzichtig icoon: dat wordt
// zwart op een zwart beginscherm. Dus hier expliciet de merkkleur.
gemaakt.push(schrijf('icons/apple-touch-icon.png', await icon(180, { inset: 0.08, bg: '#000000' })));
gemaakt.push(schrijf('icons/icon-192.png', await icon(192)));
gemaakt.push(schrijf('icons/icon-512.png', await icon(512)));
gemaakt.push(schrijf('icons/maskable-512.png', await icon(512, { inset: 0.14, bg: '#000000' })));

/* ------------------------------------------------------------------
   3. favicon.ico — 16, 32 en 48 in één bestand
------------------------------------------------------------------ */
const maten = [16, 32, 48];
const pngs = [];
for (const m of maten) pngs.push(await icon(m));

// ICO-container: 6 bytes kop, 16 bytes per afbeelding, daarna de PNG's zelf.
const kop = Buffer.alloc(6);
kop.writeUInt16LE(0, 0);
kop.writeUInt16LE(1, 2); // type 1 = icoon
kop.writeUInt16LE(maten.length, 4);
let offset = 6 + 16 * maten.length;
const items = maten.map((m, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(m === 256 ? 0 : m, 0);
  e.writeUInt8(m === 256 ? 0 : m, 1);
  e.writeUInt8(0, 2); // kleurenpalet: geen
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); // kleurvlakken
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(pngs[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  return e;
});
gemaakt.push(schrijf('favicon.ico', Buffer.concat([kop, ...items, ...pngs])));

console.log('iconen:', gemaakt.join(', '));
await browser.close();
