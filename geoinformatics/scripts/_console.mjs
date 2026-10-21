import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && console.log(m.type(), m.text().slice(0, 400)));
p.on('pageerror', (e) => console.log('pageerror', e.message));
for (const u of process.argv.slice(2)) { console.log('==', u); await p.goto(u, { waitUntil: 'networkidle' }); await p.waitForTimeout(800); }
await b.close();
