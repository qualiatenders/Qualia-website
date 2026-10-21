// Exports a self-contained, clickable preview of the site (all pages rendered
// by the running app, plus a small vanilla script for the interactions) into
// a folder that can be hosted anywhere as static files.
// Usage: node scripts/export-preview.mjs http://localhost:3100 <outDir>
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const base = process.argv[2] || 'http://localhost:3100';
const out = path.resolve(process.argv[3] || 'preview-site');
const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'assets'), { recursive: true });

/** URL (path + search) → file path inside the export. */
function fileFor(u) {
  const url = new URL(u, base);
  let p = url.pathname;
  if (!p.endsWith('/')) p += '/';
  const page = url.searchParams.get('page');
  if (page && page !== '1') p += `page-${page}/`;
  return (p.slice(1) + 'index.html').replace(/^index\.html$/, 'index.html');
}

const SKIP = /^\/(api|_next|og)\//;
const ASSETS = new Set(['/media-kit.pdf', '/feed.xml', '/icon.svg']);

function normalise(href) {
  if (!href || !href.startsWith('/') || href.startsWith('//')) return null;
  const url = new URL(href, base);
  if (SKIP.test(url.pathname) || ASSETS.has(url.pathname)) return null;
  // Only pagination survives as a separate page; other query strings collapse onto the page.
  const page = url.searchParams.get('page');
  return url.pathname + (page && page !== '1' && !url.pathname.startsWith('/search') ? `?page=${page}` : '');
}

const browser = await chromium.launch({ executablePath });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
const page = await ctx.newPage();

const queue = ['/', '/search/', '/does-not-exist/', '/newsletter/confirmed/'];
const seen = new Set();
const pages = new Map(); // key → html
const cssHrefs = new Set();

while (queue.length) {
  const key = queue.shift();
  if (seen.has(key)) continue;
  seen.add(key);
  const res = await page.goto(base + key, { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  const data = await page.evaluate(() => {
    const links = [...document.querySelectorAll('a[href], form[action]')].map((a) => a.getAttribute('href') ?? a.getAttribute('action'));
    const css = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute('href'));
    return { links, css, html: '<!DOCTYPE html>' + document.documentElement.outerHTML };
  });
  data.css.forEach((c) => cssHrefs.add(c));
  pages.set(key, { html: data.html, status: res?.status() });
  for (const l of data.links) {
    const n = normalise(l);
    if (n && !seen.has(n)) queue.push(n);
  }
  process.stdout.write(`${res?.status()} ${key}\n`);
}

/* ── Snapshots of client-only UI states ─────────────────────────────────── */
const snap = {};
await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Industries' }).click();
await page.waitForTimeout(900);
snap.mega = await page.evaluate(() => document.querySelector('header').lastElementChild.outerHTML);
await page.getByRole('button', { name: 'Industries' }).click();
await page.waitForTimeout(600);
await page.getByRole('button', { name: 'Search' }).click();
await page.waitForTimeout(700);
snap.search = await page.evaluate(() => document.querySelector('header').lastElementChild.outerHTML);

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(base + '/', { waitUntil: 'networkidle' });
await mobile.getByRole('button', { name: 'Menu' }).click();
await mobile.waitForTimeout(1200);
snap.mobile = await mobile.evaluate(() => document.querySelector('header').lastElementChild.outerHTML);
await mobile.close();

// Placement explorer: one snapshot per placement (the view follows the placement).
await page.goto(base + '/advertise/', { waitUntil: 'networkidle' });
const explorerSel = () => document.querySelector('[role=tablist][aria-label="Page type"]').closest('.grid').outerHTML;
const placementNames = await page.evaluate(() => [...document.querySelectorAll('[role=tablist][aria-label="Page type"] ~ ul button')].map((b) => b.querySelector('.font-display').textContent));
snap.explorer = {};
for (const name of placementNames) {
  await page.locator('[role=tablist][aria-label="Page type"] ~ ul button', { hasText: name }).first().click();
  await page.waitForTimeout(700);
  snap.explorer[name] = await page.evaluate(explorerSel);
}

// Success states of the forms, rendered by the real components.
snap.newsletterDone = `<div class="flex gap-4 border-l-2 border-red py-2 pl-5" data-nl-done><svg viewBox="0 0 24 24" class="mt-0.5 size-6 flex-none text-red" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m5 12 5 5 9-10"></path></svg><div><p class="font-display text-xl font-semibold">Check your inbox.</p><p class="mt-1 text-sm">We have sent you a confirmation link. Your subscription starts once you click it. <em>(Preview: nothing was sent.)</em></p></div></div>`;
await browser.close();

/* ── Stylesheets and fonts ──────────────────────────────────────────────── */
const cssMap = new Map();
fs.mkdirSync(path.join(out, 'assets/media'), { recursive: true });
for (const href of cssHrefs) {
  let css = await (await fetch(new URL(href, base))).text();
  const media = [...css.matchAll(/url\((\/_next\/static\/media\/[^)]+)\)/g)].map((m) => m[1]);
  for (const m of new Set(media)) {
    const buf = Buffer.from(await (await fetch(new URL(m, base))).arrayBuffer());
    fs.writeFileSync(path.join(out, 'assets/media', path.basename(m)), buf);
    css = css.replaceAll(m, `media/${path.basename(m)}`);
  }
  // The dev server serves the same stylesheet under many URLs; store each content once.
  const name = `style-${crypto.createHash('sha1').update(css).digest('hex').slice(0, 10)}.css`;
  fs.writeFileSync(path.join(out, 'assets', name), css);
  cssMap.set(href, name);
}
fs.cpSync(new URL('../public/preview', import.meta.url), path.join(out, 'preview'), { recursive: true });
for (const a of ASSETS) {
  const r = await fetch(new URL(a, base));
  if (r.ok) fs.writeFileSync(path.join(out, a.slice(1)), Buffer.from(await r.arrayBuffer()));
}

/* ── Rewrite and write pages ────────────────────────────────────────────── */
const geoFx = fs.readFileSync(new URL('../lib/geo-fx.js', import.meta.url), 'utf8').replace('export function initGeoFx', 'function initGeoFx');
const previewJs = fs.readFileSync(new URL('./preview/preview.js', import.meta.url), 'utf8') + `\n${geoFx}\ninitGeoFx();`;
const previewCss = fs.readFileSync(new URL('./preview/preview.css', import.meta.url), 'utf8');
function rel(fromFile, toFile) {
  const r = path.posix.relative(path.posix.dirname(fromFile), toFile);
  return r || path.posix.basename(toFile);
}

for (const [key, { html }] of pages) {
  const file = key === '/does-not-exist/' ? '404.html' : fileFor(key);
  const root = rel(file, 'index.html').replace(/index\.html$/, '');
  let h = html;
  h = h.replace(/<script\b(?![^>]*application\/(ld\+)?json)[^>]*>[\s\S]*?<\/script>/g, '');
  // Reset the geo layer to its start state; it runs again in the preview.
  h = h.replace(/\sdata-(tiles|coord|contour|globe)-ready=""/g, '');
  h = h.replace(/<div class="geo-tiles[^"]*" aria-hidden="true">(<span[^>]*><\/span>)*<\/div>/g, '');
  h = h.replace(/<div class="geo-cursor[^"]*"[\s\S]*?<\/span><\/span><\/div>/g, '');
  h = h.replace(/(<svg[^>]*data-contour[^>]*class="[^"]*?)\s*\barmed\b\s*(drawn)?/g, '$1');
  h = h.replace(/(<span data-coord="(-?[\d.]+)"[^>]*>)[^<]*(<\/span>)/g, (m, open, v, close) => `${open}${Math.abs(Number(v)).toFixed(4)}${close}`);
  h = h.replace(/<link\b[^>]*rel="(preload|modulepreload|prefetch|preconnect|dns-prefetch)"[^>]*>/g, '');
  h = h.replace(/<nextjs-portal[\s\S]*?<\/nextjs-portal>/g, '').replace(/<next-route-announcer[\s\S]*?<\/next-route-announcer>/g, '');
  h = h.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (m, href) => (cssMap.has(href) ? `<link rel="stylesheet" href="${root}assets/${cssMap.get(href)}">` : ''));
  h = h.replace(/<link\b[^>]*href="\/icon\.svg[^"]*"[^>]*>/g, `<link rel="icon" href="${root}icon.svg" type="image/svg+xml">`);
  h = h.replace(/\s(href|action)="(\/[^"]*)"/g, (m, attr, href) => {
    const url = new URL(href.replaceAll('&amp;', '&'), base);
    if (ASSETS.has(url.pathname)) return ` ${attr}="${root}${url.pathname.slice(1)}"`;
    if (SKIP.test(url.pathname)) return m;
    const n = normalise(href.replaceAll('&amp;', '&'));
    if (!n) return m;
    const target = pages.has(n) ? fileFor(n) : '404.html';
    return ` ${attr}="${rel(file, target)}${url.hash}"`;
  });
  // next/image URLs point at the optimiser, which a static copy doesn't have: use the files directly.
  h = h.replace(/<img\b[^>]*>/g, (tag) =>
    tag
      .replace(/\ssrcset="[^"]*\/_next\/image[^"]*"/g, '')
      .replace(/\ssizes="[^"]*"/g, '')
      .replace(/\ssrc="\/_next\/image\/?\?url=([^&"]+)[^"]*"/, (m, u) => ` src="${root}${decodeURIComponent(u).replace(/^\//, '')}"`),
  );
  h = h.replace(/\bis-visible\b/g, '');
  h = h.replace(
    /Preview mode: articles shown are sample content for design review\.[\s\S]*?to publish live news\./,
    'Interactive preview with sample content. Forms and sign-ups are simulated; nothing is sent.',
  );
  // The artifact viewer only runs inline scripts, so interactions and the
  // snapshots they need are inlined into every page.
  const pageSnap = { mega: snap.mega, search: snap.search, mobile: snap.mobile, newsletterDone: snap.newsletterDone, ...(key === '/advertise/' ? { explorer: snap.explorer } : {}) };
  const data = `window.GI_ROOT=${JSON.stringify(root)};window.GI_SNAP=${JSON.stringify(pageSnap).replace(/</g, '\\u003c')};${key === '/search/' ? '__INDEX__' : ''}`;
  h = h.replace('</head>', () => `<script>document.documentElement.classList.add('js')</script><style>${previewCss}</style></head>`);
  h = h.replace('</body>', () => `<script>${data}</script><script>${previewJs}</script></body>`);
  fs.mkdirSync(path.join(out, path.dirname(file)), { recursive: true });
  fs.writeFileSync(path.join(out, file), h);
}

// Search index for the client-side search page (inlined into the search page).
const index = [];
for (const [key, { html }] of pages) {
  const isArticle = /"@type":"(News|Analysis|Opinion)?(NewsArticle|Article|AnalysisNewsArticle|OpinionNewsArticle)"/.test(html) && /<article>/.test(html);
  if (!isArticle) continue;
  const title = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g, '') ?? '';
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const cat = html.match(/class="cat-tag[^"]*"[^>]*>([^<]+)</)?.[1] ?? '';
  index.push({ file: fileFor(key), title, desc, cat });
}
const searchFile = path.join(out, 'search/index.html');
fs.writeFileSync(searchFile, fs.readFileSync(searchFile, 'utf8').replace('__INDEX__', () => `window.GI_INDEX=${JSON.stringify(index).replace(/</g, '\\u003c')};`));
console.log(`\n${pages.size} pages → ${out}`);
