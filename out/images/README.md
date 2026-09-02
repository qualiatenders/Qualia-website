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

De acht werffoto's dragen de gallery. Ze zijn teruggeschaald naar 1800 px op
de lange zijde en als WebP opgeslagen; de EXIF-rotatie is daarbij vastgelegd,
anders staan ze in sommige viewers gekanteld. De originelen (5–6 MB per stuk)
staan bewust niet in `public/` — die worden anders zo uitgeserveerd — maar
zijn terug te halen uit de git-historie.

| Bestandsnaam | Waar het verschijnt |
| --- | --- |
| `detail-laswerk` | Sectie 01, detailplaat ✓ |
| `foto-op-de-werf` | Gallery ✓ |
| `foto-achterkwartier` | Gallery ✓ |
| `foto-vanaf-de-spiegel` | Gallery ✓ |
| `foto-dekindeling` | Gallery ✓ |
| `foto-volle-lengte` | Gallery ✓ |
| `foto-boeg` | Gallery ✓ |
| `foto-spiegel` | Gallery ✓ |
| `foto-werkplaats` | Gallery ✓ |

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
