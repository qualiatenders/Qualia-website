# Beeldmateriaal

**Je hoeft geen code aan te passen.** Zet een bestand met de juiste naam in
`renders/` of `photography/` en de site pakt het automatisch op bij de
volgende build (`npm run build` draait `sync-images` vanzelf; los draaien kan
met `npm run sync:images`).

Zolang een bestand ontbreekt, rendert die plek een technische placeholder die
de aspect ratio vasthoudt — er is dus geen layout shift zodra het beeld er wel is.

Ondersteunde extensies: `.avif`, `.webp`, `.jpg`, `.jpeg`, `.png`.
Staan er meerdere formaten met dezelfde naam, dan wint het modernste.

## Renders → `public/images/renders/`

Deze dragen de productpresentatie. Ze staan op een witte studio-achtergrond,
worden nooit bijgesneden en krijgen een expliciete witte plaat met haarlijn.

| Bestandsnaam | Waar het verschijnt |
| --- | --- |
| `render-aft-quarter` | Uitvoeringen (Assault 500) + gallery |
| `render-bow-quarter` | Gallery |
| `render-top-down` | Specificaties (als technische tekening) + gallery |
| `render-stern-on` | Gallery |
| `render-fish` | Uitvoeringen (Assault 500 Fish) — **bestaat nog niet** |

## Fotografie → `public/images/photography/`

De renders dragen de site; de huidige werffoto's staan bewust alleen in de
gallery-slider tot er betere fotografie is. Zodra `hero-action`,
`romp-side-profile` en `detail-laswerk` bestaan, vullen die vanzelf de hero
en sectie 01 — daar staat nu een placeholder.

| Bestandsnaam | Waar het verschijnt |
| --- | --- |
| `hero-action` | Hero, volledig beeldvullend — **nog leeg** |
| `romp-side-profile` | Sectie 01, groot staand beeld — **nog leeg** |
| `detail-laswerk` | Sectie 01, klein detailbeeld — **nog leeg** |
| `werkplaats` | Contactsectie — nog leeg |
| `gal-op-de-trailer` | Gallery · Exterieur ✓ |
| `gal-voordek` | Gallery · Exterieur ✓ |
| `gal-open-dek` | Gallery · Dek ✓ |
| `gal-antislip` | Gallery · Dek |
| `gal-werpdek` | Gallery · Fish |
| `gal-hengelberging` | Gallery · Fish |
| `gal-lasdetail` | Gallery · Details |
| `gal-spiegel-motor` | Gallery · Details |
| `gal-tiller` | Gallery · Details |
| `gal-varend` | Gallery · On the water |
| `gal-anker` | Gallery · On the water |
| `merch-cap`, `merch-tee`, `merch-hoodie` | Merch |

## Logo → `public/images/brand/`

| Bestandsnaam | Waar het verschijnt |
| --- | --- |
| `logo` | Header en footer — **nog leeg** |

Bij voorkeur `.svg`, in een lichte/witte uitvoering: het staat op een zwarte
achtergrond. Zonder dit bestand blijft het getypte woordmerk staan.

## Een beeldplek toevoegen of hernoemen

Pas de `media(...)`-aanroep in `lib/content.ts` aan; het eerste argument is de
bestandsnaam. `lib/media-manifest.json` wordt gegenereerd — die niet met de
hand bewerken.

## Let op

Waar fotografie een console-uitvoering toont, blijft de UI aangeven dat
tiller-besturing standaard is en de stuurconsole optioneel.
