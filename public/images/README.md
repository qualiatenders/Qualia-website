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

Deze staan op een witte achtergrond en worden nooit bijgesneden.

| Bestandsnaam | Waar het verschijnt |
| --- | --- |
| `render-aft-quarter` | Uitvoeringen (Assault 500) + gallery |
| `render-bow-quarter` | Uitvoeringen (Assault 500 Fish) + gallery |
| `render-top-down` | Specificaties (als technische tekening) + gallery |
| `render-bow-on` | Gallery |

## Fotografie → `public/images/photography/`

| Bestandsnaam | Waar het verschijnt |
| --- | --- |
| `hero-action` | Hero, volledig beeldvullend |
| `romp-side-profile` | Sectie 01, groot staand beeld |
| `detail-laswerk` | Sectie 01, klein detailbeeld |
| `werkplaats` | Contactsectie |
| `gal-side-profile` | Gallery · Exterieur |
| `gal-boeg` | Gallery · Exterieur |
| `gal-open-dek` | Gallery · Dek |
| `gal-antislip` | Gallery · Dek |
| `gal-werpdek` | Gallery · Fish |
| `gal-hengelberging` | Gallery · Fish |
| `gal-lasdetail` | Gallery · Details |
| `gal-spiegel-motor` | Gallery · Details |
| `gal-tiller` | Gallery · Details |
| `gal-varend` | Gallery · On the water |
| `gal-anker` | Gallery · On the water |
| `merch-cap`, `merch-tee`, `merch-hoodie` | Merch |

## Een beeldplek toevoegen of hernoemen

Pas de `media(...)`-aanroep in `lib/content.ts` aan; het eerste argument is de
bestandsnaam. `lib/media-manifest.json` wordt gegenereerd — die niet met de
hand bewerken.

## Let op

Waar fotografie een console-uitvoering toont, blijft de UI aangeven dat
tiller-besturing standaard is en de stuurconsole optioneel.
