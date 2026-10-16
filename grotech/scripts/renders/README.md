# Productbeelden (Blender Cycles)

Fotorealistische renders voor de dienstenpagina's en de homepage. Eén scène per bestand;
`lib.py` bevat de studio-belichting (donker, rood strijklicht volgens het brandbook) en de
materialen (aluminium, RVS, staal, messing, koper, kunststof).

```bash
python -m venv .venv && .venv/bin/pip install bpy==5.2.2 numpy pillow
# scene_<naam>.py <breedte> <samples> <map met lib.py> <uitvoer.png>
.venv/bin/python scene_frezen.py 1600 96 . frezen.png
python post.py frezen.png ../../public/images/renders/housing.webp ../../public/images/renders/housing-800.webp
```

| Scène | Bestand op de site |
| --- | --- |
| `scene_frezen.py` | `renders/housing.webp` |
| `scene_draaien.py` | `renders/shaft.webp` |
| `scene_snijwerk.py` | `renders/plate.webp` |
| `scene_zetwerk.py` | `renders/bracket.webp` |
| `scene_laswerk.py` | `renders/frame.webp` |
| `scene_aluminium.py` | `renders/aluminium.webp` |

Op 4 CPU-kernen duurt een render op 1600 px met 96 samples 5 à 15 minuten.
