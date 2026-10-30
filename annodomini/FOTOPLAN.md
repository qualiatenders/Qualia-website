# Fotoplan — Anno Domini Pizza Atelier

De app kan echte (of AI-gegenereerde) foto's direct gebruiken. Zet de beelden in
`annodomini/photos/` met de bestandsnamen hieronder; de importtool knipt alles
automatisch uit, maakt er losse stukjes van en zet ze in de app.

## Spelregels (belangrijk voor een naadloos resultaat)

1. **Recht van bovenaf (90°)**, geen schuine hoek.
2. **Effen, donkere achtergrond** (zwart of antraciet) voor losse ingrediënten.
3. **Licht van linksboven**, zacht en warm, voor álle foto's hetzelfde.
4. **Stukjes los van elkaar** (niet overlappend): elk stuk wordt een eigen variant.
5. Minstens **2000 × 2000 px**, scherp, geen tekst, geen watermerk.
6. Ingrediënten die mee de oven in gaan **gebakken** fotograferen (gesmolten
   mozzarella, gekrulde salami). Wat er na het bakken op komt (Parmaham, burrata,
   rucola) juist vers.

## Prompts voor een AI-beeldgenerator

Werkt in o.a. ChatGPT (beeld), Midjourney, Adobe Firefly. Gebruik per ingrediënt
het basisprompt en vul `{INGREDIENT}` in.

**Basisprompt losse ingrediënten**

```
Top-down 90 degree overhead food photography of {INGREDIENT}, 6 separate pieces
spread apart on a plain matte black background, pieces not touching, soft warm
natural light from the top left, gentle realistic shadows, ultra sharp focus,
high-end restaurant food photography, photorealistic, 8k, no text, no props
```

**Bodem (base.jpg)** — de lege pizza waar de klant mee begint

```
Top-down 90 degree overhead photo of a freshly baked Neapolitan pizza base with
only San Marzano tomato sauce, no cheese, no toppings, puffy leopard-spotted
cornicione with charred blisters, whole pizza centered and fully visible on a
plain matte black background, soft warm light from the top left,
high-end food photography, photorealistic, 8k, no text
```

**Startscherm (hero.jpg)** — de mooie, draaiende pizza

```
Top-down 90 degree overhead photo of a perfect Neapolitan pizza fresh from a
wood-fired oven: melted buffalo mozzarella, spicy salami, fresh basil leaves,
glistening extra virgin olive oil, leopard-spotted puffy crust, whole pizza
centered and fully visible on a plain matte black background, soft warm light
from the top left, luxury food photography, photorealistic, 8k, no text
```

## Bestandsnamen

| Bestand | `{INGREDIENT}` in het prompt |
|---|---|
| `base.jpg` | (eigen prompt hierboven) |
| `hero.jpg` | (eigen prompt hierboven) |
| `mozzarella.jpg` | torn pieces of melted fior di latte mozzarella, baked, lightly golden |
| `bufala.jpg` | torn pieces of melted buffalo mozzarella, baked, creamy |
| `burrata.jpg` | one whole burrata, torn open with creamy stracciatella (1 piece) |
| `parmigiano.jpg` | thin curled shavings of Parmigiano Reggiano |
| `gorgonzola.jpg` | small melted dollops of gorgonzola dolce, baked |
| `geitenkaas.jpg` | round slices of soft goat cheese, baked, lightly browned |
| `salame.jpg` | slices of spicy salami, baked, cupped with crispy edges |
| `ham.jpg` | thin folded slices of cooked ham, baked |
| `prosciutto.jpg` | delicate folded ribbons of Parma ham, fresh |
| `spek.jpg` | small crispy bacon cubes (lardons), clusters of 4 |
| `kip.jpg` | pieces of roasted chicken breast |
| `salsiccia.jpg` | crumbled pieces of Italian fennel sausage, roasted |
| `nduja.jpg` | small dollops of spicy 'nduja, baked |
| `funghi.jpg` | thin slices of roasted chestnut mushrooms |
| `cipolla.jpg` | thin rings of red onion, roasted |
| `paprika.jpg` | thin strips of roasted red, yellow and green bell pepper |
| `pomodorini.jpg` | halved roasted cherry tomatoes, cut side up |
| `olive.jpg` | small black Taggiasca olives |
| `jalapeno.jpg` | thin rings of green jalapeño |
| `spinazie.jpg` | wilted baby spinach leaves |
| `rucola.jpg` | fresh rocket leaves |
| `basilico.jpg` | fresh basil leaves |
| `tartufo.jpg` | thin shavings of black truffle |

**Desserts en dranken** — map `photos/extras/`, één gerecht per foto, van bovenaf:

```
Top-down 90 degree overhead photo of {GERECHT}, centered on a plain matte black
background, soft warm light from the top left, luxury restaurant food
photography, photorealistic, 8k, no text
```

| Bestand | `{GERECHT}` |
|---|---|
| `extras/tiramisu.jpg` | a square portion of tiramisu dusted with cocoa on a white ceramic plate |
| `extras/pannacotta.jpg` | panna cotta with red berry coulis on a white ceramic plate |
| `extras/cannoli.jpg` | two Sicilian cannoli with ricotta and pistachio on a white plate |
| `extras/affogato.jpg` | affogato, vanilla ice cream with espresso in a white cup |
| `extras/limonade.jpg` | a glass of homemade lemonade with ice, lemon and mint |
| `extras/wijn.jpg` | a glass of red wine |
| `extras/water.jpg` | a glass of sparkling water with a lemon slice |
| `extras/espresso.jpg` | an espresso with golden crema in a white cup on a saucer |

## Importeren

```bash
pip install rembg onnxruntime pillow numpy
python3 annodomini/tools/import_photos.py     # alles, of: ... import_photos.py salame
node annodomini/tools/bundle.js               # deelbare versie bijwerken
```

Ontbrekende foto's zijn geen probleem: dat ingrediënt houdt dan het huidige beeld.
