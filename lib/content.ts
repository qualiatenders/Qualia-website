/**
 * ASSAULT BOATS — content source of truth.
 *
 * All copy, specs and media slots live here so the site can be updated
 * without touching layout code. Every media slot carries `src: null`
 * until the real Assault photography lands; see public/images/README.md.
 */

export type MediaSlot = {
  /** Fill with a path under /public once the final asset is delivered. */
  src: string | null;
  alt: string;
  /** Shown inside the placeholder plate so the shot list is unambiguous. */
  slot: string;
  ratio: string;
  /** Studio renders sit on a white ground and must never be cropped. */
  fit?: 'cover' | 'contain';
  /** Drives the placeholder plate and the backing colour behind a render. */
  tone?: 'dark' | 'light';
};

export const NAV_LINKS = [
  { label: 'Assault 500', href: '#assault-500' },
  { label: 'Uitvoeringen', href: '#uitvoeringen' },
  { label: 'Specs', href: '#specs' },
  { label: 'Contact', href: '#contact' },
] as const;

export const HERO = {
  eyebrow: 'Model 2026 · Built in the Netherlands',
  title: 'Assault 500',
  lead: 'Eén boot. Twee manieren om het water op te gaan.',
  body: 'Een moderne aluminium V-jon van 5 meter. Open en ruim voor lange dagen op het water, of als Fish met werpdek en slimme opbergruimte.',
  cta: { label: 'Ontdek de Assault 500', href: '#assault-500' },
  media: {
    src: null,
    alt: 'Assault 500 varend op open water',
    slot: 'Hero · action shot',
    ratio: '16 / 9',
  } satisfies MediaSlot,
  stats: [
    { value: '5,00', unit: 'M', label: 'Lengte' },
    { value: '1,96', unit: 'M', label: 'Breedte' },
    { value: '4', unit: 'MM', label: 'Aluminium' },
    { value: '60', unit: 'PK', label: 'Max. motor' },
  ],
};

export const INTRO = {
  index: '01',
  eyebrow: 'Assault 500',
  title: 'Clean design. Sterke basis.',
  body: [
    'De Assault 500 is gebouwd met één idee: goed moet gewoon goed zijn.',
    'Een strakke romp, slimme indeling en geen onnodige poespas. De constructie wordt aan de binnen- én buitenzijde gelast en iedere Assault bouwen we zelf in Nederland.',
  ],
  points: [
    { title: 'Aluminium V-jon', body: 'Sterk, stabiel en lekker ruim.' },
    { title: 'Binnen + buiten gelast', body: 'Omdat goed bouwen verder gaat dan wat je ziet.' },
    { title: 'Max. 60 pk', body: 'Voor als het wat harder mag.' },
  ],
  media: {
    primary: {
      src: null,
      alt: 'Zijaanzicht van de aluminium romp van de Assault 500',
      slot: 'Romp · side profile',
      ratio: '4 / 5',
    } satisfies MediaSlot,
    detail: {
      src: null,
      alt: 'Detail van het laswerk op de aluminium naad',
      slot: 'Detail · laswerk',
      ratio: '1 / 1',
    } satisfies MediaSlot,
  },
};

export type Model = {
  id: 'open' | 'fish';
  name: string;
  short: string;
  title: string;
  body: string;
  features: string[];
  cta: string;
  media: MediaSlot;
};

export const MODELS: Model[] = [
  {
    id: 'open',
    name: 'Assault 500',
    short: '500',
    title: 'Keep it open.',
    body: 'Veel ruimte, een open dek en alle vrijheid om de boot te gebruiken zoals jij wilt. Met de optionele zijbanken creëer je extra zitruimte. Zonnige dag? Plaats het uitneembare zonnedek. Meer ruimte nodig? Dan haal je het er net zo makkelijk weer uit.',
    features: [
      'Open dekindeling',
      'Tiller-besturing standaard',
      'Zijbanken optioneel',
      'Uitneembaar zonnedek optioneel',
      'Stuurconsole optioneel',
      'Achterplatform',
      'Maximaal 60 pk',
    ],
    cta: 'Bekijk de 500',
    media: {
      src: null,
      alt: 'Render van de Assault 500 in de open uitvoering, schuin van achteren',
      slot: 'Render · 500 · aft quarter',
      ratio: '16 / 9',
      fit: 'contain',
      tone: 'light',
    },
  },
  {
    id: 'fish',
    name: 'Assault 500 Fish',
    short: '500 Fish',
    title: 'Built to fish.',
    body: 'De Fish krijgt voorin een verhoogd werpdek met daaronder drie afsluitbare opbergruimtes. Eén daarvan is speciaal voor je hengels. Zo blijft je dek vrij en zit alles wat je nodig hebt netjes opgeborgen en binnen handbereik.',
    features: [
      'Verhoogd werpdek',
      'Drie afsluitbare opbergruimtes',
      'Aparte hengelberging',
      'Tiller-besturing standaard',
      'Stuurconsole optioneel',
      'Ruim visdek',
      'Maximaal 60 pk',
    ],
    cta: 'Bekijk de 500 Fish',
    media: {
      src: null,
      alt: 'Render van de Assault 500 Fish met verhoogd werpdek, schuin van voren',
      slot: 'Render · 500 Fish · bow quarter',
      ratio: '16 / 9',
      fit: 'contain',
      tone: 'light',
    },
  },
];

/** Top-down plan render — reads as a technical drawing beside the numbers. */
export const SPECS_PLAN: MediaSlot = {
  src: null,
  alt: 'Bovenaanzicht van de Assault 500 met de volledige dekindeling',
  slot: 'Render · top down plan',
  ratio: '16 / 9',
  fit: 'contain',
  tone: 'light',
};

export const SPECS = [
  { label: 'Lengte', value: '5,00', unit: 'm', span: 'lg:col-span-5' },
  { label: 'Breedte romp / totaal', value: '1,88 / 1,96', unit: 'm', span: 'lg:col-span-4' },
  { label: 'Plaatdikte', value: '4', unit: 'mm', span: 'lg:col-span-3' },
  { label: 'Materiaal', value: 'Al 5083', unit: 'zeewaterbestendig', span: 'lg:col-span-5' },
  { label: 'Gewicht romp', value: '365', unit: 'kg', span: 'lg:col-span-3' },
  { label: 'Spiegelhoogte', value: '508', unit: 'mm · langstaart', span: 'lg:col-span-4' },
  { label: 'Brandstoftank', value: '25', unit: 'liter', span: 'lg:col-span-3' },
  { label: 'Besturing', value: 'Tiller', unit: 'standaard · console optioneel', span: 'lg:col-span-5' },
  { label: 'Max. belading', value: '4 pers.', unit: '360 kg', span: 'lg:col-span-4' },
  { label: 'Aanbevolen motor', value: '40', unit: 'pk', span: 'lg:col-span-4' },
  { label: 'Max. motor', value: '60', unit: 'pk', span: 'lg:col-span-4' },
];

export const GALLERY_CATEGORIES = [
  'Alles',
  'Exterieur',
  'Dek',
  'Fish',
  'Details',
  'On the water',
  'Renders',
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export type GalleryItem = MediaSlot & {
  category: Exclude<GalleryCategory, 'Alles'>;
  caption: string;
};

export const GALLERY: GalleryItem[] = [
  { src: null, alt: 'Assault 500 in zijaanzicht op de kade', slot: 'Side profile', ratio: '4 / 3', category: 'Exterieur', caption: 'Side profile' },
  { src: null, alt: 'Boeg van de Assault 500 van bovenaf', slot: 'Boeg · top down', ratio: '3 / 4', category: 'Exterieur', caption: 'Boeg' },
  { src: null, alt: 'Open dekindeling met zijbanken', slot: 'Open dek', ratio: '16 / 10', category: 'Dek', caption: 'Open dek' },
  { src: null, alt: 'Antislip vloerdelen op het dek', slot: 'Antislip vloer', ratio: '1 / 1', category: 'Dek', caption: 'Antislip' },
  { src: null, alt: 'Verhoogd werpdek van de Assault 500 Fish', slot: 'Werpdek', ratio: '4 / 3', category: 'Fish', caption: 'Werpdek' },
  { src: null, alt: 'Geopende hengelberging onder het werpdek', slot: 'Hengelberging', ratio: '3 / 4', category: 'Fish', caption: 'Hengelberging' },
  { src: null, alt: 'Lasnaad tussen twee aluminium platen', slot: 'Lasdetail', ratio: '1 / 1', category: 'Details', caption: 'Lasdetail' },
  { src: null, alt: 'Spiegel met langstaartmotor', slot: 'Spiegel · motor', ratio: '4 / 3', category: 'Details', caption: 'Spiegel' },
  { src: null, alt: 'Tiller-besturing aan boord', slot: 'Tiller', ratio: '3 / 4', category: 'Details', caption: 'Tiller' },
  { src: null, alt: 'Assault 500 varend met hekgolf', slot: 'Varend · hekgolf', ratio: '16 / 10', category: 'On the water', caption: 'Onderweg' },
  { src: null, alt: 'Assault 500 voor anker bij zonsondergang', slot: 'Lifestyle · anker', ratio: '4 / 3', category: 'On the water', caption: 'Voor anker' },
  { src: null, alt: 'Render van de Assault 500 schuin van achteren', slot: 'Render · aft quarter', ratio: '16 / 9', fit: 'contain', tone: 'light', category: 'Renders', caption: 'Aft quarter' },
  { src: null, alt: 'Render van de Assault 500 schuin van voren', slot: 'Render · bow quarter', ratio: '16 / 9', fit: 'contain', tone: 'light', category: 'Renders', caption: 'Bow quarter' },
  { src: null, alt: 'Bovenaanzicht render van de Assault 500', slot: 'Render · top down', ratio: '16 / 9', fit: 'contain', tone: 'light', category: 'Renders', caption: 'Top down' },
  { src: null, alt: 'Render van de Assault 500 recht van voren, dekindeling zichtbaar', slot: 'Render · bow on', ratio: '3 / 4', fit: 'contain', tone: 'light', category: 'Renders', caption: 'Bow on' },
];

export const MERCH = {
  index: '05',
  wordmark: 'Assault',
  drop: 'Drop 01',
  media: [
    { src: null, alt: 'Assault cap uit Drop 01', slot: 'Merch · cap', ratio: '3 / 4' } satisfies MediaSlot,
    { src: null, alt: 'Assault tee uit Drop 01', slot: 'Merch · tee', ratio: '3 / 4' } satisfies MediaSlot,
    { src: null, alt: 'Assault hoodie uit Drop 01', slot: 'Merch · hoodie', ratio: '3 / 4' } satisfies MediaSlot,
  ],
};

/**
 * TODO — vervang de placeholders hieronder door de definitieve
 * contactgegevens. Ze worden bewust zichtbaar gemarkeerd in de UI.
 */
export const CONTACT = {
  index: '06',
  title: 'See it. Feel it. Drive it.',
  body: 'Foto’s zijn mooi. Aan boord staan is beter. Kom de Assault 500 in het echt bekijken en ontdek welke uitvoering bij jou past.',
  details: [
    { label: 'Telefoon', value: '[telefoonnummer]', href: null, pending: true },
    { label: 'E-mail', value: '[e-mailadres]', href: null, pending: true },
    { label: 'Werkplaats', value: '[adres, plaats]', href: null, pending: true },
    { label: 'Op afspraak', value: 'ma – za', href: null, pending: false },
  ],
  primary: { label: 'Kom langs', href: '#contact' },
  whatsapp: { label: 'WhatsApp', href: '#contact' },
  media: {
    src: null,
    alt: 'De Assault 500 in de werkplaats',
    slot: 'Werkplaats',
    ratio: '3 / 4',
  } satisfies MediaSlot,
};

export const PRICE_CTA = {
  eyebrow: 'Assault 500 · Model 2026',
  title: 'Build yours.',
  body: 'Alle uitvoeringen, opties en actuele prijzen overzichtelijk bij elkaar.',
  cta: { label: 'Download prijslijst', href: '#prijslijst' },
};

export const FOOTER = {
  wordmark: 'Assault Boats',
  tagline: 'Built in the Netherlands.',
  links: [
    { label: 'Assault 500', href: '#uitvoeringen' },
    { label: 'Assault 500 Fish', href: '#uitvoeringen' },
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'Contact', href: '#contact' },
    { label: 'Prijslijst', href: '#prijslijst' },
  ],
};
