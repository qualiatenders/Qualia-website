// Packs the app into one self-contained HTML file (all images inlined).
//   node annodomini/tools/bundle.js  →  annodomini/dist/anno-domini.html
const fs = require('fs');
const path = require('path');

const app = path.resolve(__dirname, '..', 'app');
const out = path.resolve(__dirname, '..', 'dist', 'anno-domini.html');
const read = f => fs.readFileSync(path.join(app, f), 'utf8');
const mime = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
const dataUri = rel => `data:${mime[path.extname(rel)]};base64,${fs.readFileSync(path.join(app, rel)).toString('base64')}`;

// every runtime image the app loads by path
const assets = {};
assets['assets/bench.webp'] = dataUri('assets/bench.webp');
for (const dir of ['assets/pizza', 'assets/thumbs', 'assets/extras'])
  for (const f of fs.readdirSync(path.join(app, dir))) if (f.endsWith('.webp')) assets[`${dir}/${f}`] = dataUri(`${dir}/${f}`);
const manifest = read('assets/pizza/manifest.json');

let html = read('index.html');
let css = read('styles.css').replace(/url\((assets\/[^)]+)\)/g, (_, p) => `url("${dataUri(p)}")`);
html = html
  .replace(/<link rel="manifest"[^>]*>\n/, '')
  .replace(/<link rel="preload"[^>]*>\n/, '')
  .replace(/href="(assets\/icons\/[^"]+)"/g, (_, p) => `href="${dataUri(p)}"`)
  .replace(/src="(assets\/(?:pizza|oven)\/[^"]+)"/g, (_, p) => `src="${assets[p] || dataUri(p)}"`)
  .replace('<link rel="stylesheet" href="styles.css">', `<style>\n${css}</style>`)
  .replace(/<script src="([^"]+)"><\/script>/g, (_, f) => `<script>\n${read(f)}</script>`)
  .replace('<script>\n', `<script>window.AD_ASSETS=${JSON.stringify(assets)};window.AD_MANIFEST=${manifest};</script>\n<script>\n`);

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`${path.relative(process.cwd(), out)} — ${(fs.statSync(out).size / 1048576).toFixed(1)} MB`);

// claude.ai test-link variant: the host supplies the page skeleton and pads
// :root by the phone's safe areas, so the app fills 100% and skips its own insets.
const art = html
  .replace(/<!doctype html>\n<html lang="nl">\n<head>\n/, '')
  .replace(/<\/head>\n<body>\n/, '')
  .replace(/<\/body>\n<\/html>\n?$/, '')
  .replace(/<meta charset="utf-8">\n/, '')
  .replace(/<meta name="viewport"[^>]*>\n/, '')
  .replace('</style>', ':root{--st:0px;--sb:0px}\n.app{height:100%}\n@media (min-width:600px){.app{height:min(100%,900px)}}\n</style>');
const artOut = out.replace('.html', '.artifact.html');
fs.writeFileSync(artOut, art);
console.log(`${path.relative(process.cwd(), artOut)} — ${(fs.statSync(artOut).size / 1048576).toFixed(1)} MB`);
