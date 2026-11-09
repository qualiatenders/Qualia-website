# Assault Navigation (preview)

Vaar-app voor eigen gebruik op Nederlandse meren, vaarten en kanalen. Dit is de proefversie als web-app.

## Inhoud
- `src/app.html`: de app (HTML, CSS en JS, zonder dependencies). Kleuren, fonts en spacing staan als tokens in `:root`.
- `assets/navdata.js`: datasnapshot. Bruggen, sluizen, doorvaarthoogtes, bedieningstijden, VHF en vaarweglijnen uit RWS Vaarweginformatie (FIS), CC-0.
- `tools/fetch_fis.sh`: haalt de actuele FIS-data op.
- `tools/build_data.py`: zet die data om naar `assets/navdata.js`.
- `tools/build_page.py`: zet `dist/preview.html` (Claude-artifact) en `dist/index.html` (zelf te hosten) in elkaar.

## Bouwen
```bash
tools/fetch_fis.sh /tmp/fis
python3 tools/build_data.py /tmp/fis assets/navdata.js <geogeneratie> <publicatiedatum>
python3 tools/build_page.py assets/navdata.js assets/logo.webp.b64
```

## Bekende beperkingen van de preview
- In de artifact-preview werkt GPS niet. Het startscherm biedt dan een demovaart. Op een eigen HTTPS-host werkt GPS wel.
- De kaart is alleen water (FIS-vaarweglijnen), zonder ondergrond.
- Snelheidslimieten zitten niet in FIS. Bij een bekende limiet laat de app die zien; de voorbeeldlimiet in de demo dient alleen om de weergave te tonen.
- Feestdagen tellen nog niet mee in de bedieningstijden.
- Spotify is nog niet gekoppeld.
