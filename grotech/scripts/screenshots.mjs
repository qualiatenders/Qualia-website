/**
 * Schermafdrukken van pagina's op desktop en mobiel.
 * Gebruik: node scripts/screenshots.mjs [baseUrl] [pad,pad,...]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const base = process.argv[2] || 'http://localhost:3000';
const paths = (process.argv[3] || '/').split(',');
const outDir = process.env.OUT || 'preview';
const only = process.env.ONLY; // 'desktop' | 'mobile'
fs.mkdirSync(outDir, { recursive: true });

const executablePath = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath });
const viewports = [
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
].filter((v) => !only || v.name === only);

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    // alles laten "revealen" en lazy images laden
    await page.evaluate(async () => {
      document.querySelectorAll('[data-reveal],[data-draw]').forEach((el) => el.classList.add('is-visible'));
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    const name = `${outDir}/${vp.name}${p === '/' ? '-home' : p.replace(/[/?=&]/g, '-')}.png`;
    await page.screenshot({ path: name, fullPage: process.env.VIEWPORT_ONLY ? false : true });
    console.log('saved', name);
  }
  if (errors.length) console.log(`[${vp.name}] console errors:\n  ` + [...new Set(errors)].join('\n  '));
  await ctx.close();
}
await browser.close();
