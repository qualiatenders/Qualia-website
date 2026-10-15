/**
 * Audit van alle publieke pagina's: toegankelijkheid (axe-core, WCAG 2.1 AA),
 * horizontale overflow op mobiel, console-fouten, één h1, alt-teksten,
 * canonical/meta-description en interne links (geen 404's).
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:3000';
const pages = ['/', '/diensten', '/offerte-aanvragen', '/contact', '/privacyverklaring', '/disclaimer'];
const axe = fs.readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
let problems = 0;
const links = new Set();

for (const vp of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 375, height: 740, isMobile: true }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, reducedMotion: 'reduce' });
  for (const p of pages) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    await page.goto(BASE + p, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('[data-reveal],[data-draw]').forEach((el) => el.classList.add('is-visible')));
    const out = [];
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: document.querySelectorAll('h1').length,
      noAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
      canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href'),
      desc: document.querySelector('meta[name=description]')?.getAttribute('content')?.length ?? 0,
      title: document.title,
      links: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')),
      wide: [...document.querySelectorAll('body *')].filter((el) => { const r = el.getBoundingClientRect(); return r.right > document.documentElement.clientWidth + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('[class*="overflow-x-auto"],[class*="snap-x"],.sr-only,[aria-hidden="true"]'); }).slice(0, 3).map((el) => el.tagName + '.' + String(el.className).slice(0, 60)),
    }));
    info.links.forEach((l) => links.add(l.split('#')[0]));
    if (info.overflow > 0) out.push(`horizontale overflow ${info.overflow}px`);
    if (info.wide.length) out.push(`elementen buiten viewport: ${info.wide.join(' | ')}`);
    if (info.h1 !== 1) out.push(`${info.h1} h1-elementen`);
    if (info.noAlt) out.push(`${info.noAlt} img zonder alt`);
    if (vp.name === 'desktop' && (!info.canonical || info.desc < 70)) out.push(`SEO: canonical=${info.canonical} description=${info.desc} tekens`);
    await page.addScriptTag({ content: axe });
    const res = await page.evaluate(async () => await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] }));
    for (const v of res.violations) out.push(`axe ${v.impact} ${v.id}: ${v.help} (${v.nodes.length}×) → ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' ; ')}`);
    if (errs.length) out.push(`console: ${[...new Set(errs)].join(' | ').slice(0, 300)}`);
    problems += out.length;
    console.log(`${out.length ? '✗' : '✓'} [${vp.name}] ${p}  — ${info.title}`);
    out.forEach((o) => console.log('    ' + o));
    await page.close();
  }
  await ctx.close();
}

console.log(`\nInterne links controleren (${links.size})`);
for (const l of links) {
  const r = await fetch(BASE + l, { redirect: 'manual' });
  if (![200, 307, 308].includes(r.status)) {
    problems++;
    console.log(`  ✗ ${l} → ${r.status}`);
  }
}
await browser.close();
console.log(problems ? `\n${problems} aandachtspunten` : '\nGeen problemen gevonden');
process.exit(problems ? 1 : 0);
