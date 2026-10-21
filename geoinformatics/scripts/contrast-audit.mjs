// Contrast audit: every visible text element against its real background.
// House rule: white text on dark planes, black text on white planes, red only
// as an accent; on red planes white and black may be mixed. Also WCAG AA.
// Usage: node scripts/contrast-audit.mjs http://localhost:3100 [/path,/path]
import { chromium } from 'playwright-core';

const base = process.argv[2] || 'http://localhost:3100';
const paths = (process.argv[3] || '/,/lidar-reveals-20000-amazonian-precolonial-earthworks/,/latest/,/category/lidar-3d-scanning/,/analysis/,/events/,/organizations/,/newsletter/,/advertise/,/about/,/contact/,/legal/privacy/,/search/,/nope/').split(',');
const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const HOSTILE = ':root{color-scheme:light;color:#000}body{margin:0;font:14px/1.3 system-ui,sans-serif;color:#000;background:transparent}';

const audit = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = '1'] = m[1].split(/[ ,/]+/).filter(Boolean);
    return [Number(r), Number(g), Number(b), Number(a)];
  };
  const lum = ([r, g, b]) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const isRed = ([r, g, b]) => r > 150 && g < 110 && b < 110;
  const bgOf = (el) => {
    for (let n = el; n; n = n.parentElement) {
      // A full-size, absolutely positioned layer behind the text (e.g. an active pill) is its background.
      const layer = n.parentElement && [...n.parentElement.children].find((s) => s !== n && getComputedStyle(s).position === 'absolute' && Number(getComputedStyle(s).opacity) > 0.5 && s.getBoundingClientRect().width >= n.getBoundingClientRect().width - 1 && (parse(getComputedStyle(s).backgroundColor) || [0, 0, 0, 0])[3] > 0.5);
      if (layer) return { color: parse(getComputedStyle(layer).backgroundColor), el: layer };
      const cs = getComputedStyle(n);
      const c = parse(cs.backgroundColor);
      if (c && c[3] > 0.5) return { color: c, el: n };
      if (cs.backgroundImage.includes('gradient') && n !== el) return null;
    }
    return { color: [255, 255, 255, 1], el: document.body };
  };
  const out = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'OPTION'].includes(el.tagName) || el.closest('svg')) continue; // SVG text is artwork
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!own) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (cs.clip === 'rect(0px, 0px, 0px, 0px)' || (cs.position === 'absolute' && r.width <= 1)) continue;
    let op = 1;
    for (let n = el; n; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
    if (op < 0.05) continue;
    let fg = parse(cs.color);
    const stroke = parse(cs.webkitTextStrokeColor || '');
    if (fg && fg[3] === 0 && stroke && parseFloat(cs.webkitTextStrokeWidth) > 0) fg = stroke;
    if (!fg) continue;
    const bg = bgOf(el);
    if (!bg) continue; // text over gradients/imagery: checked visually
    const B = bg.color;
    const Lb = lum(B);
    const Lf = lum(fg);
    const plane = isRed(B) ? 'red' : Lb < 0.2 ? 'dark' : Lb > 0.55 ? 'light' : 'mid';
    const effectiveAlpha = fg[3] * op;
    let ok;
    if (plane === 'red') ok = Lf > 0.9 || Lf < 0.02;
    else if (plane === 'dark') ok = (Lf > 0.9 || isRed(fg)) && effectiveAlpha > 0.95;
    else if (plane === 'light') ok = (Lf < 0.02 || isRed(fg)) && effectiveAlpha > 0.95;
    else ok = false;
    const size = parseFloat(cs.fontSize);
    const bold = Number(cs.fontWeight) >= 700;
    const cr = ratio(fg, B);
    const aa = cr >= (size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5);
    if (ok && aa) continue;
    const text = el.textContent.trim().replace(/\s+/g, ' ').slice(0, 60);
    const key = `${plane}|${cs.color}|${text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ plane, color: cs.color, bg: `rgb(${B.slice(0, 3).join(',')})`, ratio: cr.toFixed(2), alpha: effectiveAlpha.toFixed(2), rule: ok, aa, text, cls: (el.className?.toString?.() || '').slice(0, 80), tag: el.tagName });
  }
  return out;
};

const browser = await chromium.launch({ executablePath });
let total = 0;
for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-visible')));
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    // Simulate a hostile host wrapper (like an embedding viewer): an unlayered reset
    // that turns default text black. Inherited text must survive it.
    await page.addStyleTag({ content: HOSTILE });
    await page.waitForTimeout(600);
    const issues = await page.evaluate(audit);
    if (issues.length) {
      console.log(`\n${name} ${p} — ${issues.length}`);
      issues.slice(0, 25).forEach((i) => console.log(`  [${i.plane}] ${i.ratio}:1 a${i.alpha} ${i.rule ? '' : 'RULE '}${i.aa ? '' : 'AA '}${i.color} on ${i.bg} <${i.tag} ${i.cls}> “${i.text}”`));
    }
    total += issues.length;
  }
  // Open-state UI
  if (name === 'desktop') {
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: HOSTILE });
    for (const label of ['Industries', 'Search']) {
      await page.getByRole('button', { name: label }).click();
      await page.waitForTimeout(700);
      const issues = await page.evaluate(audit);
      if (issues.length) console.log(`\n${name} [${label} open] — ${issues.length}`), issues.slice(0, 15).forEach((i) => console.log(`  [${i.plane}] ${i.ratio}:1 ${i.color} on ${i.bg} “${i.text}”`));
      total += issues.length;
      await page.getByRole('button', { name: label }).click().catch(() => {});
      await page.waitForTimeout(400);
    }
  } else {
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: HOSTILE });
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.waitForTimeout(900);
    const issues = await page.evaluate(audit);
    if (issues.length) console.log(`\n${name} [menu open] — ${issues.length}`), issues.slice(0, 15).forEach((i) => console.log(`  [${i.plane}] ${i.ratio}:1 ${i.color} on ${i.bg} “${i.text}”`));
    total += issues.length;
  }
  await page.close();
}
await browser.close();
console.log(`\nTotal issues: ${total}`);
process.exit(total ? 1 : 0);
