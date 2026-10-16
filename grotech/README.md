# GROTECH — Precision Manufacturing

Website + offertesysteem voor GROTECH. Nederlandstalig, voorbereid op Engels.

**Positionering:** specialist in aluminium. Snijwerk, zetwerk en laswerk uitsluitend in aluminium; CNC-frezen en -draaien in alle materialen (aluminium, RVS, staal, messing, koper, kunststof). Het offerteformulier wijst hierop als iemand een andere combinatie kiest.

- **Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Zod · Nodemailer (animaties in CSS, geen animatiebibliotheek)
- **Pagina's (6):** home (met werkwijze en over GROTECH), diensten (alle vijf technieken), offerte aanvragen, contact, privacyverklaring (incl. cookies), disclaimer, 404
- **Vormgeving:** donkere header, hero en footer; inhoud op witte en lichtgrijze vlakken via `.theme-light` (draait de kleurtokens om, zie `app/globals.css`)
- **Backend:** offerte-API met beveiligde uploads, contact-API, versleutelde opslag, e-mailnotificaties, beheeromgeving (`/beheer`)

---

## 1. Lokaal starten

```bash
cd grotech
npm install
cp .env.example .env.local     # vul minimaal FORM_SECRET, FILE_ENCRYPTION_KEY, ADMIN_USER, ADMIN_PASSWORD
npm run dev                    # http://localhost:3000
```

Zonder SMTP-instellingen werkt alles, maar worden e-mails in ontwikkeling als
`.eml`-bestand opgeslagen in `storage/outbox/` in plaats van verzonden. De
bevestigingspagina meldt dat dan expliciet.

| Commando | Doel |
| --- | --- |
| `npm run build` / `npm start` | productiebuild en -server |
| `npm run typecheck` | TypeScript-controle |
| `npm run test:e2e` | end-to-end tests (server moet draaien, zie §7) |
| `node scripts/audit.mjs` | toegankelijkheid (axe, WCAG 2.1 AA), mobiele overflow, SEO-basics, interne links |
| `npm run screenshots -- http://localhost:3000 /,/contact` | schermafdrukken desktop + mobiel naar `preview/` |
| `npm run quotes -- list` | opgeslagen aanvragen tonen |

## 2. Configuratie

Alle instellingen staan in `.env.example`, met uitleg per variabele. Samengevat:

| Groep | Variabelen | Opmerking |
| --- | --- | --- |
| Site | `NEXT_PUBLIC_SITE_URL` | canonical, sitemap, Open Graph, links in e-mails |
| Bedrijfsgegevens | `NEXT_PUBLIC_COMPANY_*` | worden **alleen getoond als ze zijn ingevuld** |
| Opslag | `GROTECH_DATA_DIR`, `FILE_ENCRYPTION_KEY` | map buiten de webroot; sleutel is in productie verplicht |
| Spam | `FORM_SECRET` | ondertekent formuliertokens |
| E-mail | `SMTP_*`, `MAIL_FROM`, `MAIL_NOTIFY_TO` | SMTP met STARTTLS of TLS |
| Beheer | `ADMIN_USER`, `ADMIN_PASSWORD` | zonder beide is `/beheer` volledig uitgeschakeld (404) |
| Netwerk | `TRUST_PROXY=true` | achter nginx; nodig voor rate limiting per bezoeker |
| Analytics | `NEXT_PUBLIC_ANALYTICS_SRC`, `…_DOMAIN` | optioneel, cookieloos (Plausible EU / Umami) |

> `NEXT_PUBLIC_*`-waarden worden tijdens `npm run build` in de pagina's gezet.
> Na het wijzigen van bedrijfsgegevens opnieuw builden.

### Nog aan te leveren door GROTECH

Deze gegevens ontbreken en worden daarom nergens getoond of verzonnen:

1. **Bedrijfsgegevens:** e-mailadres, telefoonnummer, adres, KvK- en btw-nummer, eventueel LinkedIn.
2. **Domein** (bijv. `grotech.nl`) en een **mailbox/SMTP-account** voor verzending (met SPF/DKIM/DMARC op het domein).
3. **Ontvanger(s)** van offertenotificaties.
4. **Hostingkeuze** (zie §4) — nog niet ingericht, eerst afstemmen.
5. **Juridische controle** van privacyverklaring, cookieverklaring en disclaimer. De teksten beschrijven de werkelijke werking van de site (opslag, versleuteling, bewaartermijnen, delen met productiepartners), maar zijn geen juridisch advies. Algemene voorwaarden zijn bewust niet verzonnen.
6. **Eigen fotografie** (optioneel): zie §6.

## 3. De offerteflow

`/offerte-aanvragen` — vijf stappen: productietechniek (meerdere te combineren) → specificaties → technische bestanden → contactgegevens → controle & verzenden.

- Voorselectie via dienstpagina's (`?techniek=cnc-frezen`); bestanden die op de homepage worden neergezet, gaan mee naar stap 3.
- Concept (zonder bestanden en zonder privacy-akkoord) blijft bewaard in de sessie-opslag van de browser.
- Uploadvoortgang zichtbaar; fouten van de server springen terug naar de juiste stap.
- **Geen automatische prijsberekening** — elke aanvraag wordt handmatig beoordeeld.

### Beveiliging

| Maatregel | Waar |
| --- | --- |
| Server-side validatie (zelfde Zod-schema als de UI) | `lib/quote/schema.ts`, `app/api/offerte/route.ts` |
| Bestandscontrole: extensie-allowlist, max. 10 bestanden / 25 MB per stuk / 100 MB totaal, **inhoudscontrole op signatuur** (een `.step` met een EXE-header wordt geweigerd) | `lib/server/files.ts` |
| Opslag buiten de webroot, willekeurige bestandsnamen, rechten `0600/0700` | `lib/server/storage.ts` |
| **Versleuteling at rest** (AES-256-GCM); in productie weigert de server onversleutelde opslag | `lib/server/crypto.ts` |
| Bestanden nooit als e-mailbijlage; alleen downloadbaar na inloggen in `/beheer` | `lib/server/mail.ts`, `app/beheer/bestand/…` |
| Spam: honeypot + ondertekend token met minimale invultijd | `lib/server/form-token.ts` |
| Rate limiting (5 per 15 min, 20 per dag per IP; login 5 per 15 min) | `lib/server/rate-limit.ts` |
| CSRF: alleen same-origin POST; server actions met ingebouwde origin-check | `lib/server/request.ts` |
| Logs bevatten alleen referentienummers en aantallen — geen namen, e-mailadressen of bestandsnamen; IP-adressen alleen gehasht in het geheugen | — |
| Security headers: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy | `next.config.mjs` |
| Beheer: sessiecookie (httpOnly, SameSite=strict, 8 uur), timing-safe vergelijking, `noindex` | `lib/server/admin-auth.ts` |

Aanbevolen aanvulling in productie: een virusscanner (bijv. ClamAV) op de datamap, en versleutelde back-ups (§4).

## 4. Hosting en publicatie (nog af te stemmen)

De site heeft een **Node.js-server** nodig (voor uploads, opslag en e-mail). Gewone
TransIP-webhosting draait geen Node.js en is daarom niet geschikt.

**Aanbevolen:** een **TransIP VPS** (datacenter in Nederland — tekeningen blijven in de EU) met Ubuntu LTS, Node.js 20+, nginx en Let's Encrypt.

```bash
# op de server, als niet-root gebruiker
git clone … && cd grotech
npm ci && npm run build
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
# start met systemd of pm2:
GROTECH_DATA_DIR=/var/lib/grotech NODE_ENV=production PORT=3000 node .next/standalone/server.js
```

nginx (uittreksel):

```nginx
server {
  server_name www.grotech.nl;
  client_max_body_size 110m;                 # 100 MB uploads + formulier
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;   # overschrijven, niet aanvullen
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_request_buffering off;
  }
}
```

Zet daarbij `TRUST_PROXY=true`. Checklist vóór livegang:

- [ ] Alle variabelen uit §2 gezet, `FILE_ENCRYPTION_KEY` veilig bewaard (zonder sleutel zijn bestanden onleesbaar)
- [ ] `GROTECH_DATA_DIR` buiten de app-map, eigenaar = de service-gebruiker, `chmod 700`
- [ ] Dagelijkse, versleutelde back-up van de datamap
- [ ] Testaanvraag verstuurd en ontvangst van **beide** e-mails bevestigd; e2e-tests tegen de live URL (§7)
- [ ] Bewaartermijn-opschoning ingepland (§5)

Alternatief (Vercel e.d.) kan, maar vraagt externe opslag (bijv. EU-object storage) omdat die platforms geen blijvende schijf hebben. Dit is bewust nog niet ingericht.

## 5. Beheer

- **`/beheer`** — inloggen met `ADMIN_USER` / `ADMIN_PASSWORD`. Overzicht van aanvragen met statusfilter, detailpagina met alle specificaties, download van bestanden, status wijzigen (nieuw → in behandeling → geoffreerd → afgesloten) en definitief verwijderen. Contactberichten staan onderaan.
- **E-mail:** bij elke aanvraag ontvangt GROTECH een notificatie (antwoordadres = klant, link naar `/beheer`); de klant ontvangt een bevestiging met referentienummer (`GT-JJMMDD-XXXXX`).
- **Bewaartermijnen** (zoals in de privacyverklaring): plan dagelijks
  `node scripts/quotes.mjs purge --days 730 --contact-days 365 --confirm`
  (zonder `--confirm` is het een droge run).

## 6. Content en beeld aanpassen

| Wat | Bestand |
| --- | --- |
| Diensten (teksten, specs, FAQ, SEO) | `lib/content/nl/services.ts` |
| Materialen (lijst op de homepage) | `lib/content/nl/materials.ts` |
| Werkwijze in vier stappen | `lib/content/nl/process.ts` |
| Keuzes en uploadlimieten offerteformulier | `lib/quote/options.ts` |
| Routes / slugs | `lib/i18n/routes.ts` |
| Kleuren, typografie | `app/globals.css` (`@theme`) |

**Beeldmateriaal**

- Logo, monogram en woordmerk (`public/brand/`) zijn vectorbestanden die één-op-één zijn overgetrokken uit het originele brandbook-logo (niet nagetekend). Kleur: GROTECH Red `#F10A1D`.
- Fotografie (`public/images/spindle.jpg`, `part-housing.jpg`, `milling-chips.jpg`) komt uit het GROTECH-brandbook. Controleer dat de rechten hiervan bij GROTECH liggen.
- Productbeelden (`public/images/renders/`) zijn **fotorealistische 3D-renders** (Blender Cycles), voor deze site gemaakt; de scènes staan in `scripts/renders/`. Ze worden op de site als "illustratieve render" gelabeld; er worden nergens fabrieksfoto's of klantprojecten gesuggereerd.
- Eigen foto's toevoegen: vervang het bestand met dezelfde naam (4:3 voor dienstbeelden).

**Merkafwijkingen, bewust:** kleine rode tekst gebruikt de tint `#FF4655` en foutmeldingen `#FF6B77`, omdat GROTECH Red op charcoal niet aan WCAG AA (4.5:1) voldoet. De primaire knop is off-white met een rood accentblok: witte tekst op rood haalt 4.37:1 en dat is te laag voor knoptekst.

## 7. Testen

```bash
npm run build && npm start &                    # verse server (rate limiter zit in het geheugen)
ADMIN_USER=… ADMIN_PASSWORD=… SMTP_INBOX=… npm run test:e2e
node scripts/audit.mjs
```

De e2e-suite (14 tests) doorloopt de volledige offerteflow in een echte browser (validatie, uploads, geweigerd bestandstype, verzenden), controleert opslag (versleuteld, juiste rechten), e-mails (geen bijlagen, juiste reply-to), CSRF, vermomde bestanden, server-side validatie, botdetectie, rate limiting, honeypot, het contactformulier, de menu's op desktop en mobiel, ontoegankelijkheid van de opslag en inloggen + downloaden in `/beheer` (byte-voor-byte gelijk aan het origineel).

## 8. Engels toevoegen

De structuur is voorbereid (`lib/i18n/`): routes per taal in `routes.ts`, teksten per taal in `lib/content/<taal>`. Stappen staan bovenaan `lib/i18n/config.ts`. hreflang-koppelingen worden via `buildMetadata` in `lib/seo.ts` gezet.

## Structuur

```
app/                      routes (App Router), API in app/api, beheer in app/beheer
components/               UI; home/, quote/, forms/
lib/content/nl/           alle teksten
lib/quote/                keuzes + validatieschema (gedeeld client/server)
lib/server/               opslag, versleuteling, mail, rate limiting, tokens, auth
lib/i18n/                 taal- en routeconfiguratie
public/brand, public/images
scripts/                  e2e, audit, screenshots, beheer van aanvragen
storage/                  (gitignored) aanvragen + bestanden in ontwikkeling
```
