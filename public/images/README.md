# Beeldmateriaal

Elke beeldplek in de site staat in `lib/content.ts` met `src: null`. Zolang
`src` leeg is rendert de site een technische placeholder die de aspect ratio
vasthoudt en benoemt welk beeld er hoort. Er is dus geen layout shift wanneer
het echte beeld later wordt toegevoegd.

## Toevoegen

1. Plaats het bestand in `public/images/renders/` of `public/images/photography/`.
2. Zet in `lib/content.ts` het bijbehorende `src` op het pad, bijvoorbeeld:

   ```ts
   src: '/images/renders/assault-500-aft-quarter.png',
   ```

Meer is niet nodig — `next/image` regelt AVIF/WebP, responsive sizes en
lazy loading.

## Verwachte assets

### Renders (witte achtergrond, `fit: 'contain'`, `tone: 'light'`)

| Slot | Voorgesteld pad |
| --- | --- |
| Render · 500 · aft quarter | `/images/renders/assault-500-aft-quarter.png` |
| Render · 500 Fish · bow quarter | `/images/renders/assault-500-fish-bow-quarter.png` |
| Render · top down plan | `/images/renders/assault-500-top-down.png` |
| Render · bow on | `/images/renders/assault-500-bow-on.png` |

### Fotografie (`fit: 'cover'`, donkere sectie)

| Slot | Voorgesteld pad |
| --- | --- |
| Hero · action shot | `/images/photography/hero-action.jpg` |
| Romp · side profile | `/images/photography/romp-side-profile.jpg` |
| Detail · laswerk | `/images/photography/detail-laswerk.jpg` |
| Open dek | `/images/photography/dek-open.jpg` |
| Antislip vloer | `/images/photography/dek-antislip.jpg` |
| Werpdek | `/images/photography/fish-werpdek.jpg` |
| Hengelberging | `/images/photography/fish-hengelberging.jpg` |
| Lasdetail | `/images/photography/detail-lasnaad.jpg` |
| Spiegel · motor | `/images/photography/detail-spiegel-motor.jpg` |
| Tiller | `/images/photography/detail-tiller.jpg` |
| Varend · hekgolf | `/images/photography/water-hekgolf.jpg` |
| Lifestyle · anker | `/images/photography/water-anker.jpg` |
| Werkplaats | `/images/photography/werkplaats.jpg` |
| Merch · cap / tee / hoodie | `/images/photography/merch-*.jpg` |

Let op: waar fotografie een console-uitvoering toont, blijft de UI aangeven
dat tiller-besturing standaard is en de console optioneel.
