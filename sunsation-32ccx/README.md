# Sunsation 32CCX — 3D Studio

Lokale, interactieve 3D-configurator voor het 32CCX-model. Hij draait volledig
in de browser: geen API's, geen login, geen backend en geen internetverbinding
(Three.js r170 zit in `vendor/three/`).

## Starten

1. Zet het model op `model/32CCX_Production.glb`. Dit bestand staat bewust **niet**
   in git, zie *Model en rechten* hieronder.
2. Start een lokale webserver in deze map:
   ```bash
   python3 start_server.py          # of: python3 -m http.server 8000
   ```
   Zonder Python kan het ook met `npx serve .`.
3. Open <http://localhost:8000> in Chrome, Edge of Safari (desktop, iPhone of iPad).

Dubbelklikken op `index.html` (via `file://`) werkt niet: de browser blokkeert dan
het laden van de GLB. Om op een telefoon in hetzelfde netwerk te testen start je
`HOST=0.0.0.0 python3 start_server.py` en open je `http://<ip-van-je-computer>:8000`.

## Functies

- **Camera:** vrij draaien, pannen en zoomen in 3D-perspectief. Daarnaast vaste
  **orthografische** aanzichten: boven, zij, voor en achter. Op een staand scherm
  staat de boeg in het bovenaanzicht naar boven.
- **Motoren:** 300, 400 of 500 pk, zwart of wit, of zonder motoren. Er is altijd
  maar één variant zichtbaar; standaard is dat `400_black`.
- **Weergave:** hardtop aan of uit, maatlijnen, lijntekening en studioschaduw.
- **Kleur en materiaal (visualisatie):** romp, onderwaterschip, hardtop, accenten
  en stiksel, bekleding en vloer.
- **Maatvoering (meshmeting):** romplengte, lengte over alles, breedte, hoogtes en
  het overhangen van de motoren, plus maatlijnen in de orthografische aanzichten.
- **PNG-export:** huidig aanzicht of een vast aanzicht, tot 8K (7680 px), studio-,
  lichte of transparante achtergrond. Wordt in tegels gerenderd, dus hoge resoluties
  lukken ook als het scherm klein is. Op telefoons is het maximum 4096 px.
- **SVG-export:** silhouet en zichtbare contourlijnen van een orthografisch aanzicht
  op schaal (1:1 in mm, 1:20, 1:25 of 1:50), met lagen voor Inkscape en Illustrator.
- **Fullscreen**, ook op iPhone (daar via een CSS-fallback).
- **Deelbare link:** de configuratie staat in de URL (`#e=500_white&hull=navy…`).

## Toetsenbord

| Toets | Actie |
|---|---|
| Slepen / één vinger | Draaien |
| Rechts slepen / twee vingers | Pannen |
| Scroll / knijpen | Zoomen |
| `1` – `5` | 3D · boven · zij · voor · achter |
| `6` / `7` | Onder · zij (andere kant) |
| `←` `↑` `→` `↓` | Draaien |
| `+` / `−` | Zoomen |
| `R` | Camera resetten |
| `F` | Volledig scherm |
| `H` | Hardtop aan/uit |
| `M` | Maatlijnen aan/uit |
| `L` | Lijntekening aan/uit |
| `E` | Volgende motorvariant |
| `P` | PNG exporteren |
| `?` | Sneltoetsenoverzicht |

## Opbouw

```
index.html            interface
styles.css            stijl (antraciet, navy, wit, gedoseerd rood), responsive
start_server.py       eenvoudige lokale webserver
src/main.js           scène, laden, camera's, bediening, UI, URL-status
src/views.js          aanzichten en framing
src/materials.js      visualisatiematerialen en kleurzones
src/environment.js    studio-omgeving voor reflecties
src/dimensions.js     meshmetingen en maatlijnen
src/edges.js          kenmerkende randen uit de mesh
src/export.js         PNG- (tegels) en SVG-export
vendor/three/         Three.js r170 (MIT)
model/                plaats voor 32CCX_Production.glb (niet in git)
```

## Nauwkeurigheid en beperkingen

- **Geometrie:** de GLB wordt ongewijzigd geladen. Er worden geen vertexposities
  aangepast en er wordt niets nagetekend. Alleen de scène wordt met 0,01 geschaald,
  volgens de conventie van de oorspronkelijke viewer (1 mesh-eenheid ≈ 1 cm). Om
  geheugen te sparen worden de ongebruikte UV-coördinaten verwijderd; posities en
  normalen blijven gelijk.
- **Maten zijn meshmetingen.** Ze komen uit de bounding boxes van de vertexposities
  en hangen af van de aangenomen schaal, die niet fabrieksmatig is geverifieerd. Het
  zijn geen gecertificeerde fabrieksmaten. Ter indicatie: de romplengte van 9,76 m
  komt overeen met een 32-voeter, maar dat is geen validatie.
- **Materialen zijn een visualisatie.** Het bronmodel had geen textures, alleen
  effen kleuren. Alle lakken, metalen, glas en bekleding zijn een weergave, geen
  fabrieksmateriaal of -kleur.
- **SVG is geen industriële DXF.**
  - Het *silhouet* is een rastertracering van de echte mesh. De nauwkeurigheid is
    ongeveer één pixel, circa 2,7 mm bij 4096 px over 10,7 m, en staat in het bestand.
  - De *contourlijnen* zijn echte meshranden met een vouwhoek groter dan 40° (of
    25°), plus open randen. Of een rand zichtbaar is, wordt per pixel bepaald met een
    dieptebuffer.
  - Het bestand is geschikt als referentie of onderlegger, niet als productietekening.
- Het bronmodel is een Sketchfab-model, geen Sunsation-CAD.
- Voor de viewer is WebGL2 nodig (alle recente browsers). Het model heeft ongeveer
  1,5 tot 1,7 miljoen zichtbare driehoeken. Op oudere telefoons kan het laden traag zijn.

## Model en rechten

Bron: Sketchfab, *32ccx (Production)* van Aftershock Production, model-ID
`8f7f579a3ad34204a6f3c47b4d51bad2`. Het is een model van derden. Daarom staat
`model/*.glb` in `.gitignore` en wordt het model niet online gezet of in de
repository opgenomen zonder toestemming van de rechthebbende. Ga na of je de
geometrie mag gebruiken, zeker vóór publicatie of commercieel gebruik.
