# Assault Boats

Productwebsite voor de **Assault 500** — een aluminium V-jon van 5 meter,
gebouwd in Nederland, verkrijgbaar als open uitvoering en als **Assault 500 Fish**.

## Stack

- Next.js 15 (App Router, volledig statisch geprerenderd)
- TypeScript
- Tailwind CSS 4 (CSS-first tokens in `app/globals.css`)
- Framer Motion

## Aan de slag

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # productiebuild
npm run typecheck
```

## Structuur

```
app/
  layout.tsx      fonts, metadata, skip link
  globals.css     design tokens, typografie, motion
  page.tsx        sectievolgorde
components/       één component per sectie + gedeelde primitives
lib/content.ts    alle copy, specs en beeldplekken
public/images/    beeldmateriaal (zie README daar)
```

## Content aanpassen

Alle teksten, specificaties en beeldplekken staan in `lib/content.ts`.
Layout hoeft daarvoor niet aangeraakt te worden.

## Beeldmateriaal

Beeld toevoegen vraagt geen codewijziging: zet een bestand met de juiste naam
in `public/images/renders/` of `public/images/photography/`, en
`scripts/sync-images.mjs` koppelt het automatisch (draait via `prebuild`, of
los met `npm run sync:images`).

Zolang een bestand ontbreekt rendert die plek een technische placeholder die
de aspect ratio vasthoudt — geen layout shift zodra het beeld er wel is.
Zie `public/images/README.md` voor de complete lijst met bestandsnamen.

## Design system

| Token | Waarde | Gebruik |
| --- | --- | --- |
| Hull Black | `#000000` | hero, navigatie, footer, donkere secties |
| Assault Red | `#C0272C` | CTA's, actieve states, indicators, accenten |
| Mill Aluminium | `#999999` | secundaire tekst, technische labels |
| Deck Grey | `#4A4A4A` | dividers, UI-elementen, metadata |
| Bone | `#F2F1ED` | lichte secties, lichte tekst |

Rood wordt bewust spaarzaam ingezet. De lichte secties (Uitvoeringen, Specs)
zijn afgestemd op de studiorenders, die op een witte achtergrond staan.

## Toegankelijkheid

- Semantische HTML met een sluitende heading-hiërarchie (één `h1`)
- Skip link, zichtbare focus states, volledige keyboard-bediening
- De uitvoeringkiezer is een echte `tablist` met pijltjesnavigatie
- Lightbox met Escape, pijltjestoetsen en focus-herstel
- `prefers-reduced-motion` schakelt niet-essentiële animatie uit; content is
  nooit afhankelijk van animatie om zichtbaar te worden (ook zonder JS niet)

## Productlogica

Er is één basismodel — de Assault 500 — met twee uitvoeringen. Beide worden
standaard geleverd met **tiller-besturing**; een **stuurconsole is optioneel**.
De UI geeft dat expliciet aan, ook wanneer fotografie een console toont.
