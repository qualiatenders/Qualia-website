/**
 * Volledige-paginapreview.
 *
 * Twee valkuilen: een viewport zo hoog als de pagina blaast de 100vh-hero op,
 * en fullPage laat lagen vallen zolang framer-motion nog transforms aanstuurt.
 * Dus: normale viewport, reveals eerst op hun eindtoestand vastzetten, dan
 * fullPage.
 */
import { chromium } from 'playwright';
const OUT = '/home/user/Qualia-website/preview';
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });

for (const [name, width, height, dpr] of [['desktop', 1440, 900, 1], ['mobiel', 390, 844, 2]]) {
  const ctx = await b.newContext({ viewport: { width, height }, deviceScaleFactor: dpr });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3275/', { waitUntil: 'networkidle' });
  // De galerij is een horizontale rail: wat buiten beeld ligt wordt lui
  // geladen en zou in een stilstaand beeld leeg blijven.
  await p.evaluate(() => {
    for (const img of document.images) { img.loading = 'eager'; img.removeAttribute('loading'); }
  });
  await p.evaluate(async () => {
    const rail = document.querySelector('#gallery ul');
    if (rail) {
      for (let x = 0; x < rail.scrollWidth; x += 200) {
        rail.scrollLeft = x;
        await new Promise((r) => setTimeout(r, 60));
      }
      rail.scrollLeft = 0;
    }
  });
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await p.addStyleTag({
    content: '[data-reveal]{opacity:1!important;transform:none!important}' +
             '.fixed.inset-x-0.bottom-0{display:none!important}',
  });
  await p.waitForTimeout(1600);
  await p.evaluate(() => Promise.all([...document.images].filter((i) => !i.complete).map((i) => i.decode().catch(() => {}))));
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(name, JSON.stringify(await p.evaluate(() => ({
    hoogte: document.body.scrollHeight,
    specs: document.querySelectorAll('#specs dl > *').length,
    verborgen: [...document.querySelectorAll('[data-reveal]')].filter((e) => +getComputedStyle(e).opacity < 0.9).length,
  }))));
  await ctx.close();
}
await b.close();
