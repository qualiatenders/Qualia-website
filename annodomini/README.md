# Anno Domini — Pizza Atelier (mobiele web-app)

Klanten stellen zelf hun Napolitaanse pizza samen: basis Margherita € 9,95, elk
beleg wordt live op de pizza gelegd, daarna afrekenen (Apple Pay, iDEAL, PayPal),
met desserts en drankjes als aanvulling. Na het betalen volgt een bedankscherm
met afhaaltijd en stempelkaart (10e pizza gratis).

```
annodomini/
  app/                 de app (statisch, geen build-stap nodig)
    index.html         schermen: intro · samenstellen · afrekenen · bedankt
    styles.css
    app.js             compositor, bestelling, desserts/dranken, stempelkaart
    catalog.js         menu: beleg, prijzen, categorieën (hier prijzen aanpassen)
    payments.js        betaal-adapter (demo / Mollie)
    manifest.webmanifest  installeerbaar op het beginscherm (PWA)
    assets/
      logo/mark.svg    gevectoriseerd 47-logo
      pizza/           HD-sprites per beleg + manifest.json met posities
      thumbs/          menu-afbeeldingen
      icons/           app-iconen
  tools/
    engine.js          pizza-renderer (heightmap, licht, schaduw)
    extras.js          desserts en dranken
    bench.js           bebloemde werkbank
    bundle.js          alles in één HTML-bestand (dist/)
    build-assets.js    rendert alle HD-afbeeldingen opnieuw
  preview/             eerdere ontwerp-previews
```

## Lokaal draaien

```bash
cd annodomini/app && python3 -m http.server 8047
# open http://localhost:8047 op je telefoon (zelfde wifi) of in de browser
# ?fast versnelt de oven-timer voor testen
```

Beleg of prijzen wijzigen: pas `app/catalog.js` aan. Nieuw beleg of andere
look → daarna `node annodomini/tools/build-assets.js` (Playwright + Chromium).

## Betalen via Mollie

`payments.js` staat op `mode: 'demo'`: er wordt niets afgeschreven. Voor echte
betalingen zet je `mode: 'mollie'` en maak je een endpoint `/api/payments` dat
een Mollie-betaling aanmaakt:

```js
// bijv. Vercel/Netlify function — MOLLIE_API_KEY alleen op de server
export default async (req, res) => {
  const o = req.body; // { pizza, toppings, amount, method, pickup, no }
  // Herbereken het bedrag uit catalog.js op de server; vertrouw o.amount niet.
  const r = await fetch('https://api.mollie.com/v2/payments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: { currency: 'EUR', value: amount.toFixed(2) },
      description: `Anno Domini #${o.no} — ${o.pizza}`,
      method: o.method,                       // 'ideal' | 'applepay' | 'paypal'
      redirectUrl: 'https://<jouw-domein>/#oven',
      webhookUrl: 'https://<jouw-domein>/api/mollie-webhook',
      metadata: o,
    }),
  });
  const p = await r.json();
  res.json({ checkoutUrl: p._links.checkout.href });
};
```

- Apple Pay vraagt in het Mollie-dashboard om domeinverificatie.
- PayPal moet je in het Mollie-dashboard koppelen.
- De keuken krijgt de bestelling via de webhook (status `paid`).

## Beeld

De pizza en het beleg worden nu door de computer gerenderd. Voor een
fotorealistisch resultaat vervang je de sprites in `assets/pizza/` door
uitgeknipte foto's van bovenaf (zelfde bestandsnamen, transparante webp).


## Stempelkaart

De stempels worden nu per toestel in de browser bewaard (localStorage). Voor een
stempelkaart die over toestellen heen werkt en niet te omzeilen is, moeten de
stempels later aan een klantaccount of telefoonnummer op de server hangen.
