/**
 * End-to-end tests tegen een draaiende server (dev of productie).
 *
 *   BASE=http://localhost:3000 ADMIN_USER=… ADMIN_PASSWORD=… \
 *   DATA_DIR=./storage SMTP_INBOX=/pad/naar/inbox node scripts/e2e.mjs
 *
 * Let op: de rate limiter is per proces. Start de server vers voor een
 * volledige run (de test verstuurt bewust 6 offerteverzoeken).
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE || 'http://localhost:3000';
const DATA_DIR = process.env.DATA_DIR || path.resolve('storage');
const INBOX = process.env.SMTP_INBOX;
const SHOTS = process.env.SHOTS;
const FX = path.resolve('scripts/fixtures');
const exe = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

let passed = 0;
let failed = 0;
const results = [];
async function test(name, fn) {
  try {
    await fn();
    passed++;
    results.push(`  ✓ ${name}`);
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    results.push(`  ✗ ${name}\n      ${e.message}`);
    console.log(`  ✗ ${name}\n      ${e.message}`);
  }
}
const assert = (c, m) => {
  if (!c) throw new Error(m);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const origin = { origin: BASE };
const token = async (kind) => (await (await fetch(`${BASE}/api/form-token?kind=${kind}`)).json()).token;
const inboxCount = () => (INBOX && fs.existsSync(INBOX) ? fs.readdirSync(INBOX).length : 0);
const shot = async (page, name) => SHOTS && page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });

const validPayload = {
  techniques: ['frezen', 'laswerk'],
  material: 'aluminium',
  materialDetail: '6082-T6',
  quantity: 25,
  surface: 'anodiseren',
  surfaceDetail: '',
  tolerances: 'Volgens tekening',
  deliveryDate: '2027-01-15',
  deliveryFlexible: false,
  remarks: 'API-test',
  company: 'Test BV',
  contactName: 'Sam Tester',
  email: 'sam@example.com',
  phone: '+31 6 12345678',
  reference: 'PO-1',
  extra: '',
  privacy: true,
};
function form(payload, tok, files = [], website = '') {
  const fd = new FormData();
  fd.append('payload', JSON.stringify(payload));
  fd.append('token', tok);
  fd.append('website', website);
  for (const f of files) fd.append('files', new Blob([fs.readFileSync(path.join(FX, f))]), f);
  return fd;
}

const browser = await chromium.launch({ executablePath: exe });
let wizardRef = null;

console.log('\nOfferteflow in de browser');
await test('wizard: volledige aanvraag via de dienstenpagina, met uploads en validatie', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const before = inboxCount();

  await page.goto(`${BASE}/diensten`);
  await page.getByRole('link', { name: 'CNC-frezen aanvragen' }).click();
  await page.waitForURL(/offerte-aanvragen\?techniek=cnc-frezen/);
  await page.getByRole('heading', { name: 'Productietechniek', exact: true }).waitFor();
  assert(await page.getByRole('checkbox', { name: /CNC-frezen/ }).isChecked(), 'CNC-frezen niet voorgeselecteerd');
  await page.getByText('Laswerk', { exact: true }).click();
  await shot(page, 'wizard-1');
  await page.getByRole('button', { name: 'Volgende stap' }).click();

  // stap 2: validatie
  await page.getByRole('heading', { name: 'Specificaties', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Volgende stap' }).click();
  await page.getByText('Kies een materiaal.').waitFor();
  await page.getByText('Kies een datum of vink "flexibel" aan.').waitFor();
  await page.getByText('Aluminium', { exact: true }).click();
  await page.locator('#q-materialDetail').fill('6082-T6');
  await page.locator('#q-quantity').fill('25');
  await page.locator('#q-deliveryDate').fill('2027-03-01');
  await page.getByText('Anodiseren', { exact: true }).click();
  await page.locator('#q-tolerances').fill('ISO 2768-m, kritische maten volgens tekening');
  await page.locator('#q-remarks').fill('Zichtzijde vrij van krassen.');
  await shot(page, 'wizard-2');
  await page.getByRole('button', { name: 'Volgende stap' }).click();

  // stap 3: uploads incl. geweigerd type
  await page.getByRole('heading', { name: 'Technische bestanden', exact: true }).waitFor();
  await page.locator('input[type=file]').setInputFiles([path.join(FX, 'behuizing-01.step'), path.join(FX, 'tekening-rev-a.pdf'), path.join(FX, 'script.exe')]);
  await page.getByText('behuizing-01.step', { exact: true }).waitFor();
  await page.getByText('tekening-rev-a.pdf', { exact: true }).waitFor();
  await page.getByText(/script\.exe: bestandstype niet toegestaan/).waitFor();
  await shot(page, 'wizard-3');
  await page.getByRole('button', { name: 'Volgende stap' }).click();

  // stap 4
  await page.getByRole('heading', { name: 'Contactgegevens', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Volgende stap' }).click();
  await page.getByText('Vul de bedrijfsnaam in.').waitFor();
  await page.locator('#q-company').fill('Machinebouw Test BV');
  await page.locator('#q-contactName').fill('Jordan de Vries');
  await page.locator('#q-email').fill('jordan@example.com');
  await page.locator('#q-phone').fill('+31 6 1234 5678');
  await page.locator('#q-privacy').check();
  await shot(page, 'wizard-4');
  await page.getByRole('button', { name: 'Volgende stap' }).click();

  // stap 5: overzicht
  await page.getByRole('heading', { name: 'Controleren & verzenden', exact: true }).waitFor();
  for (const t of ['CNC-frezen, Laswerk', 'Aluminium — 6082-T6', 'Machinebouw Test BV', 'behuizing-01.step']) await page.getByText(t).first().waitFor();
  await shot(page, 'wizard-5');
  await sleep(6500); // menselijke invultijd t.o.v. het formuliertoken
  await page.getByRole('button', { name: 'Aanvraag definitief verzenden' }).click();
  await page.getByRole('heading', { name: /Aanvraag ontvangen/ }).waitFor({ timeout: 20000 });
  wizardRef = (await page.locator('.font-mono.text-lg').textContent())?.trim();
  assert(/^GT-\d{6}-[A-Z2-9]{5}$/.test(wizardRef ?? ''), `ongeldige referentie: ${wizardRef}`);
  await page.getByText('jordan@example.com').waitFor();
  await shot(page, 'wizard-success');
  assert(!errors.length, `pagefouten: ${errors.join('; ')}`);

  // opslag
  const dir = path.join(DATA_DIR, 'quotes', wizardRef);
  const rec = JSON.parse(fs.readFileSync(path.join(dir, 'record.json'), 'utf8'));
  assert(rec.files.length === 2, `verwacht 2 bestanden, kreeg ${rec.files.length}`);
  assert(rec.payload.quantity === 25 && rec.payload.techniques.join() === 'frezen,laswerk', 'payload niet correct opgeslagen');
  for (const f of rec.files) {
    const raw = fs.readFileSync(path.join(dir, 'files', f.id));
    assert(f.encrypted, 'bestand niet gemarkeerd als versleuteld');
    assert(!raw.includes('ISO-10303-21') && !raw.includes('%PDF'), 'bestand staat leesbaar (onversleuteld) op schijf');
    assert((fs.statSync(path.join(dir, 'files', f.id)).mode & 0o077) === 0, 'bestandsrechten te ruim');
  }
  assert(rec.mail.notify === 'sent' && rec.mail.confirmation === 'sent', `mailstatus: ${JSON.stringify(rec.mail)}`);
  if (INBOX) {
    await sleep(500);
    const after = inboxCount();
    assert(after - before === 2, `verwacht 2 e-mails, kreeg ${after - before}`);
    const mails = fs.readdirSync(INBOX).sort().slice(-2).map((f) => JSON.parse(fs.readFileSync(path.join(INBOX, f), 'utf8')));
    const notify = mails.find((m) => m.subject.startsWith('Offerteaanvraag'));
    const conf = mails.find((m) => m.subject.startsWith('Je offerteaanvraag'));
    assert(notify && conf, 'notificatie of bevestiging ontbreekt');
    assert(notify.attachments === 0, 'notificatie bevat bijlagen (tekeningen horen niet in e-mail)');
    assert(notify.replyTo?.includes('jordan@example.com'), 'reply-to van notificatie is niet de klant');
    assert(conf.to.includes('jordan@example.com') && conf.text.includes(wizardRef), 'bevestiging klopt niet');
  }
  await ctx.close();
});

await test('homepage-dropzone geeft bestanden door aan de offerteflow', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.locator('input[type=file][aria-label="Tekeningen kiezen"]').setInputFiles([path.join(FX, 'plaat-3mm.dxf')]);
  await page.waitForURL(/offerte-aanvragen\?bestanden=1/);
  await page.getByText('1 bestand klaargezet.').waitFor();
  await page.getByText('Snijwerk', { exact: true }).click();
  await page.getByRole('button', { name: 'Volgende stap' }).click();
  await page.getByText('Aluminium', { exact: true }).click();
  await page.getByText('Leverdatum is flexibel').click();
  await page.getByText('Geen / onbehandeld', { exact: true }).click();
  await page.getByRole('button', { name: 'Volgende stap' }).click();
  await page.getByText('plaat-3mm.dxf', { exact: true }).waitFor();
  await ctx.close();
});

await test('menu: navigatie op desktop en mobiel menu is zichtbaar en werkt', async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.getByRole('navigation', { name: 'Hoofdnavigatie' }).getByRole('link', { name: 'Diensten' }).click();
  await page.waitForURL(/\/diensten/);
  await page.getByRole('heading', { name: 'CNC-frezen', exact: true }).waitFor();
  await ctx.close();
  const m = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  await m.goto(BASE);
  await m.getByRole('button', { name: 'Menu openen' }).click();
  const dialog = m.getByRole('dialog', { name: 'Menu' });
  const box = await dialog.boundingBox();
  assert(box && box.height > 400, `mobiel menu is niet zichtbaar (hoogte ${box?.height})`);
  await dialog.getByRole('link', { name: 'Contact', exact: true }).click();
  await m.waitForURL(/\/contact/);
});

console.log('\nAPI-beveiliging');
await test('verzoek zonder Origin wordt geweigerd (CSRF)', async () => {
  const r = await fetch(`${BASE}/api/offerte`, { method: 'POST', body: form(validPayload, 'x') });
  assert(r.status === 403, `status ${r.status}`);
});

await test('geldige API-aanvraag met bestanden wordt opgeslagen', async () => {
  const t = await token('quote');
  await sleep(6200);
  const r = await fetch(`${BASE}/api/offerte`, { method: 'POST', headers: origin, body: form(validPayload, t, ['behuizing-01.step', 'plaat-3mm.dxf']) });
  const j = await r.json();
  assert(r.status === 200 && j.ok && /^GT-/.test(j.reference), `status ${r.status} ${JSON.stringify(j)}`);
});

await test('vermomd uitvoerbaar bestand (.step met MZ-header) wordt geweigerd', async () => {
  const t = await token('quote');
  await sleep(6200);
  const r = await fetch(`${BASE}/api/offerte`, { method: 'POST', headers: origin, body: form(validPayload, t, ['malware.step']) });
  const j = await r.json();
  assert(r.status === 422 && /malware\.step/.test(j.error), `status ${r.status} ${JSON.stringify(j)}`);
});

await test('ongeldige invoer geeft 422 met veldfouten (server-side validatie)', async () => {
  const t = await token('quote');
  await sleep(6200);
  const bad = { ...validPayload, email: 'geen-email', techniques: [], quantity: 0, privacy: false };
  const r = await fetch(`${BASE}/api/offerte`, { method: 'POST', headers: origin, body: form(bad, t) });
  const j = await r.json();
  assert(r.status === 422 && j.fields.email && j.fields.techniques && j.fields.quantity && j.fields.privacy, `status ${r.status} ${JSON.stringify(j)}`);
});

await test('te snel verzonden formulier (bot) wordt geweigerd', async () => {
  const t = await token('quote');
  const r = await fetch(`${BASE}/api/offerte`, { method: 'POST', headers: origin, body: form(validPayload, t) });
  const j = await r.json();
  assert(r.status === 400 && j.code === 'token-too-fast', `status ${r.status} ${JSON.stringify(j)}`);
});

await test('rate limiting: 6e aanvraag binnen 15 minuten krijgt 429', async () => {
  const r = await fetch(`${BASE}/api/offerte`, { method: 'POST', headers: origin, body: form(validPayload, 'x') });
  assert(r.status === 429 && r.headers.get('retry-after'), `status ${r.status}`);
});

await test('vervalst token wordt geweigerd (contact)', async () => {
  const r = await fetch(`${BASE}/api/contact`, { method: 'POST', headers: { ...origin, 'content-type': 'application/json' }, body: JSON.stringify({ token: 'contact.1.abc.def', payload: {} }) });
  assert(r.status === 400, `status ${r.status}`);
});

await test('honeypot: bot krijgt neutraal antwoord, niets opgeslagen', async () => {
  const dir = path.join(DATA_DIR, 'contact');
  const n = fs.existsSync(dir) ? fs.readdirSync(dir).length : 0;
  const r = await fetch(`${BASE}/api/contact`, { method: 'POST', headers: { ...origin, 'content-type': 'application/json' }, body: JSON.stringify({ website: 'http://spam', token: 'x', payload: {} }) });
  assert(r.status === 200, `status ${r.status}`);
  const n2 = fs.existsSync(dir) ? fs.readdirSync(dir).length : 0;
  assert(n === n2, 'honeypot-bericht is toch opgeslagen');
});

await test('contactformulier in de browser', async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/contact`);
  await page.getByRole('button', { name: 'Bericht versturen' }).click();
  await page.getByText('Vul je naam in.').waitFor();
  await page.locator('#c-name').fill('Robin Jansen');
  await page.locator('#c-email').fill('robin@example.com');
  await page.locator('#c-message').fill('Kunnen jullie ook RVS 316 zetten in 4 mm?');
  await page.locator('#c-privacy').check();
  await sleep(3200);
  await page.getByRole('button', { name: 'Bericht versturen' }).click();
  await page.getByRole('heading', { name: 'Bericht ontvangen', exact: true }).waitFor({ timeout: 15000 });
  await ctx.close();
});

console.log('\nVertrouwelijkheid & beheer');
await test('opslag is niet publiek bereikbaar', async () => {
  for (const p of ['/storage/quotes', `/storage/quotes/${wizardRef}/record.json`, '/../storage/quotes', `/beheer/bestand/${wizardRef}/abc`]) {
    const r = await fetch(BASE + p, { redirect: 'manual' });
    assert([401, 404, 307, 308].includes(r.status), `${p} gaf ${r.status}`);
  }
});

await test('download zonder sessie geeft 401; met sessie de originele bytes', async () => {
  const rec = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'quotes', wizardRef, 'record.json'), 'utf8'));
  const f = rec.files.find((x) => x.name === 'behuizing-01.step');
  const r = await fetch(`${BASE}/beheer/bestand/${wizardRef}/${f.id}`);
  assert(r.status === 401, `zonder sessie: ${r.status}`);
  assert(process.env.ADMIN_USER, 'ADMIN_USER niet gezet voor de test');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/beheer`);
  await page.waitForURL(/beheer\/login/);
  await page.locator('#user').fill(process.env.ADMIN_USER);
  await page.locator('#password').fill('fout-wachtwoord');
  await page.getByRole('button', { name: 'Inloggen' }).click();
  await page.getByText('Onjuiste gebruikersnaam of wachtwoord.').waitFor();
  await page.locator('#password').fill(process.env.ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Inloggen' }).click();
  await page.getByRole('heading', { name: 'Offerteaanvragen', exact: true }).waitFor();
  await page.getByRole('link', { name: wizardRef }).click();
  await page.getByText('behuizing-01.step').waitFor();
  await shot(page, 'admin-detail');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator(`a[href$="${f.id}"]`).click()]);
  const got = fs.readFileSync(await dl.path());
  assert(got.equals(fs.readFileSync(path.join(FX, 'behuizing-01.step'))), 'gedownload bestand wijkt af van het origineel');
  await page.locator('select[name=status]').selectOption('in-behandeling');
  await page.getByRole('button', { name: 'Opslaan' }).click();
  await page.waitForTimeout(800);
  const rec2 = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'quotes', wizardRef, 'record.json'), 'utf8'));
  assert(rec2.status === 'in-behandeling', `status niet bijgewerkt: ${rec2.status}`);
  await ctx.close();
});

await browser.close();
console.log(`\n${passed} geslaagd, ${failed} mislukt\n`);
if (process.env.REPORT) fs.writeFileSync(process.env.REPORT, `${results.join('\n')}\n\n${passed} geslaagd, ${failed} mislukt\n`);
process.exit(failed ? 1 : 0);
