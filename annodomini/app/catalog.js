// Anno Domini — menu & topping catalogue.
// Shop data (name, desc, price, category) is used by the app; the `art` block
// is only read by tools/build-assets.js when the HD sprites are re-rendered.
window.AD_CATALOG = {
  base: {
    name: 'Margherita',
    desc: 'San Marzano DOP, fior di latte, basilicum, olijfolie',
    price: 9.95,
  },
  categories: [
    { id: 'formaggi', name: 'Formaggi' },
    { id: 'salumi', name: 'Salumi' },
    { id: 'verdure', name: 'Verdure' },
    { id: 'finitura', name: 'Finitura' },
  ],
  // `z` is the stacking order on the pizza; post-oven toppings sit on top.
  toppings: [
    { id: 'bufala', cat: 'formaggi', name: 'Mozzarella di bufala', desc: 'Campania DOP, romig', price: 3.5, z: 10,
      art: { painter: 'mozzarella', s: .11, count: 7, minD: .26, rMax: .6, variants: 6, thumb: { n: 1, s: 46 } } },
    { id: 'burrata', cat: 'formaggi', name: 'Burrata pugliese', desc: 'Heel, na de oven', price: 4.5, z: 80,
      art: { painter: 'burrata', s: .2, count: 1, fixed: [[.03, .02]], variants: 1, pad: 2.6, thumb: { n: 1, s: 52 } } },
    { id: 'parmigiano', cat: 'formaggi', name: 'Parmigiano Reggiano', desc: '24 mesi, geschaafd', price: 2.0, z: 82,
      art: { painter: 'parmigiano', s: .05, count: 14, minD: .14, rMax: .64, variants: 6, pad: 4.8, thumb: { n: 3, s: 20 } } },
    { id: 'gorgonzola', cat: 'formaggi', name: 'Gorgonzola dolce', desc: 'Zacht en romig, Piemonte', price: 2.5, z: 12,
      art: { painter: 'gorgonzola', s: .055, count: 10, minD: .17, rMax: .62, variants: 6, thumb: { n: 3, s: 24 } } },

    { id: 'salame', cat: 'salumi', name: 'Salame piccante', desc: 'Pikante Calabrische salami', price: 2.5, z: 20,
      art: { painter: 'salame', s: .095, count: 12, minD: .2, rMax: .62, variants: 8, thumb: { n: 2, s: 34 } } },
    { id: 'prosciutto', cat: 'salumi', name: 'Prosciutto di Parma', desc: '24 maanden gerijpt, na de oven', price: 3.95, z: 84,
      art: { painter: 'prosciutto', s: .12, count: 5, minD: .34, rMax: .5, variants: 5, pad: 4.6, thumb: { n: 1, s: 30 } } },
    { id: 'nduja', cat: 'salumi', name: "'Nduja di Spilinga", desc: 'Smeerbare, rokerige chilisalami', price: 2.95, z: 22,
      art: { painter: 'nduja', s: .055, count: 9, minD: .2, rMax: .6, variants: 6, thumb: { n: 3, s: 22 } } },
    { id: 'salsiccia', cat: 'salumi', name: 'Salsiccia al finocchio', desc: 'Huisgemaakt, met venkelzaad', price: 2.95, z: 24,
      art: { painter: 'salsiccia', s: .065, count: 12, minD: .16, rMax: .62, variants: 8, thumb: { n: 2, s: 30 } } },

    { id: 'funghi', cat: 'verdure', name: 'Funghi', desc: 'Kastanjechampignons, tijm', price: 1.95, z: 30,
      art: { painter: 'funghi', s: .07, count: 12, minD: .17, rMax: .62, variants: 6, thumb: { n: 2, s: 30 } } },
    { id: 'pomodorini', cat: 'verdure', name: 'Pomodorini', desc: 'Geroosterde kerstomaatjes', price: 1.5, z: 32,
      art: { painter: 'pomodorino', s: .055, count: 10, minD: .2, rMax: .6, variants: 6, thumb: { n: 2, s: 28 } } },
    { id: 'olive', cat: 'verdure', name: 'Olive taggiasche', desc: 'Ligurische zwarte olijven', price: 1.75, z: 34,
      art: { painter: 'oliva', s: .028, count: 14, minD: .13, rMax: .64, variants: 6, thumb: { n: 4, s: 15 } } },
    { id: 'cipolla', cat: 'verdure', name: 'Cipolla rossa', desc: 'Rode ui uit Tropea', price: 1.0, z: 36,
      art: { painter: 'cipolla', s: .065, count: 10, minD: .17, rMax: .62, variants: 6, thumb: { n: 3, s: 26 } } },
    { id: 'rucola', cat: 'verdure', name: 'Rucola', desc: 'Vers, na de oven', price: 1.25, z: 86,
      art: { painter: 'rucola', rot: true, s: .09, count: 22, minD: .1, rMax: .48, variants: 8, pad: 3.2, thumb: { n: 3, s: 34 } } },

    { id: 'basilico', cat: 'finitura', name: 'Basilico extra', desc: 'Verse Genovese basilicum', price: .5, z: 88,
      art: { painter: 'basil', rot: true, s: .085, count: 7, minD: .22, rMax: .6, variants: 6, pad: 2.8, thumb: { n: 2, s: 40 } } },
    { id: 'tartufo', cat: 'finitura', name: 'Tartufo nero', desc: 'Geschaafde zwarte truffel', price: 4.95, z: 90,
      art: { painter: 'tartufo', s: .05, count: 9, minD: .2, rMax: .58, variants: 6, thumb: { n: 3, s: 24 } } },
    { id: 'peperoncino', cat: 'finitura', name: 'Peperoncino', desc: 'Calabrische chilivlokken', price: .5, z: 92,
      art: { overlay: 'flakes', count: 70, thumb: { n: 26 } } },
    { id: 'miele', cat: 'finitura', name: 'Hot honey', desc: 'Honing met chili, na de oven', price: 1.5, z: 94,
      art: { overlay: 'drizzle', color: '#C88A1E', alpha: .78, width: .012, count: 5, thumb: { n: 2 } } },
  ],
};
