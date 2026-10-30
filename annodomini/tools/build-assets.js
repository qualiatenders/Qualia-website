// Re-renders all pizza artwork into app/assets.
//   node annodomini/tools/build-assets.js
// Needs Playwright with Chromium available.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'app', 'assets');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', e => { console.error(e); process.exitCode = 1; });
  await page.setContent('<!doctype html><body></body>');
  for (const f of ['tools/engine.js', 'tools/oven.js', 'tools/bench.js', 'app/catalog.js', 'tools/build-page.js'])
    await page.addScriptTag({ path: path.join(root, f) });

  const t0 = Date.now();
  const { files, manifest } = await page.evaluate(() => window.buildAll());
  for (const [rel, url] of Object.entries(files)) {
    const file = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  }
  fs.writeFileSync(path.join(outDir, 'pizza', 'manifest.json'), JSON.stringify(manifest));
  console.log(`${Object.keys(files).length} files in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await browser.close();
})();
