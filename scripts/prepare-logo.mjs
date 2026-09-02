/**
 * Maakt van het aangeleverde logo een vrijstaand webp:
 * witte achtergrond weg, bijgesneden op het beeldmerk, geschaald.
 *
 * De flood fill loopt vanaf de rand naar binnen en stopt op de zwarte
 * contour, zodat de witte outline en de witte letters binnen het logo
 * blijven staan.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const [, , IN, OUT, WIDTH] = process.argv;
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const page = await (await b.newContext()).newPage();
await page.setContent('<canvas id="c"></canvas><canvas id="o"></canvas>');

const res = await page.evaluate(async ({ dataUri, target }) => {
  const img = new Image();
  img.src = dataUri;
  await img.decode();

  const c = document.getElementById('c');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);

  const W = c.width, H = c.height;
  const id = ctx.getImageData(0, 0, W, H);
  const d = id.data;
  const lum = (p) => 0.299 * d[p * 4] + 0.587 * d[p * 4 + 1] + 0.114 * d[p * 4 + 2];

  const FLOOR = 190, STEP = 16;
  const seen = new Uint8Array(W * H);
  const q = [];
  const push = (p, from) => {
    if (p < 0 || p >= W * H || seen[p]) return;
    const l = lum(p);
    if (l < FLOOR) return;
    if (Math.abs(l - from) > STEP) return;
    seen[p] = 1;
    q.push(p, l);
  };
  for (let x = 0; x < W; x++) { push(x, lum(x)); push((H - 1) * W + x, lum((H - 1) * W + x)); }
  for (let y = 0; y < H; y++) { push(y * W, lum(y * W)); push(y * W + W - 1, lum(y * W + W - 1)); }
  while (q.length) {
    const from = q.pop(), p = q.pop();
    const x = p % W;
    if (x > 0) push(p - 1, from);
    if (x < W - 1) push(p + 1, from);
    push(p - W, from);
    push(p + W, from);
  }

  for (let p = 0; p < W * H; p++) if (seen[p]) d[p * 4 + 3] = 0;
  // Randverzachting tegen de compressiehalo van de bron.
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      if (seen[p]) continue;
      const edge = (x > 0 && seen[p - 1]) || (x < W - 1 && seen[p + 1]) ||
                   (y > 0 && seen[p - W]) || (y < H - 1 && seen[p + W]);
      if (edge && lum(p) > FLOOR) d[p * 4 + 3] = Math.max(0, Math.min(255, Math.round((255 - lum(p)) * 6)));
    }
  }
  ctx.putImageData(id, 0, 0);

  // Bijsnijden op wat er nog zichtbaar is.
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (d[(y * W + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
  const o = document.getElementById('o');
  const k = Math.min(1, target / cw);
  o.width = Math.round(cw * k);
  o.height = Math.round(ch * k);
  const octx = o.getContext('2d');
  octx.imageSmoothingQuality = 'high';
  octx.drawImage(c, x0, y0, cw, ch, 0, 0, o.width, o.height);

  let cleared = 0;
  for (let p = 0; p < W * H; p++) if (seen[p]) cleared++;
  return { webp: o.toDataURL('image/webp', 0.92), src: `${W}x${H}`, crop: `${cw}x${ch}`, out: `${o.width}x${o.height}`, pct: Math.round(cleared / (W * H) * 100) };
}, { dataUri: 'data:image/png;base64,' + readFileSync(IN).toString('base64'), target: Number(WIDTH) });

const buf = Buffer.from(res.webp.split(',')[1], 'base64');
writeFileSync(OUT, buf);
console.log(`bron ${res.src} -> bijgesneden ${res.crop} -> ${res.out}  |  ${res.pct}% achtergrond weg  |  ${Math.round(buf.length / 1024)} KB`);
await b.close();
