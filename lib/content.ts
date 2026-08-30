/**
 * ASSAULT BOATS — content source of truth.
 *
 * All copy, specs and media slots live here so the site can be updated
 * without touching layout code.
 *
 * Beeld hoeft hier NIET ingevuld te worden: elke slot heeft een `key`, en
 * `scripts/sync-images.mjs` koppelt die aan een bestand in public/images/ met
 * dezelfde naam. Zolang er geen bestand is, rendert de slot een technische
 * placeholder die de aspect ratio vasthoudt.
 */
import manifest from './media-manifest.json';

const FILES = manifest as Record<string, string | undefined>;

export type MediaSlot = {
  /** Bestandsnaam (zonder extensie) in public/images/. */
  key: string;
  /** Automatisch ingevuld door scripts/sync-images.mjs; null = placeholder. */
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

/** Bouwt een media slot en zoekt het bestand op via de manifest. */
function media(
  key: string,
  alt: string,
  slot: string,
  ratio: string,
  options: Pick<MediaSlot, 'fit' | 'tone'> = {},
): MediaSlot {
  return { key, src: FILES[key] ?? null, alt, slot, ratio, ...options };
}

/** Renders staan op een witte ondergrond en worden nooit bijgesneden. */
const RENDER = { fit: 'contain', tone: 'light' } as const;

/**
 * Merkasset. Zet een bestand `logo` (bij voorkeur .svg, licht/wit voor de
 * donkere achtergrond) in public/images/brand/ en het vervangt automatisch
 * het getypte woordmerk in de header en de footer.
 */
export const LOGO: MediaSlot | null = FILES['logo']
  ? media('logo', 'Assault Boats', 'Logo', 'auto')
  : null;

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
  media: media('hero-action', 'Assault 500 varend op open water', 'Hero · action shot', '16 / 9'),
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
    primary: media('romp-side-profile', 'Zijaanzicht van de aluminium romp van de Assault 500', 'Romp · side profile', '4 / 5'),
    detail: media('detail-laswerk', 'Detail van het laswerk op de aluminium naad', 'Detail · laswerk', '1 / 1'),
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
    media: media('render-aft-quarter', 'Render van de Assault 500 in de open uitvoering, schuin van achteren', 'Render · 500 · aft quarter', '16 / 9', RENDER),
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
    media: media('render-bow-quarter', 'Render van de Assault 500 Fish met verhoogd werpdek, schuin van voren', 'Render · 500 Fish · bow quarter', '16 / 9', RENDER),
  },
];

/** Top-down plan render — reads as a technical drawing beside the numbers. */
export const SPECS_PLAN = media(
  'render-top-down',
  'Bovenaanzicht van de Assault 500 met de volledige dekindeling',
  'Render · top down plan',
  '16 / 9',
  RENDER,
);

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

/** Fotografie leidt; de renders sluiten de rail af. */
export const GALLERY: GalleryItem[] = [
  { ...media('gal-op-de-trailer', 'De Assault 500 op de trailer, gezien vanaf de spiegel', 'Op de trailer', '4 / 3'), category: 'Exterieur', caption: 'Op de trailer' },
  { ...media('gal-voordek', 'Het verhoogde voordek met opbergluik en antislip', 'Voordek', '3 / 4'), category: 'Exterieur', caption: 'Voordek' },
  { ...media('gal-open-dek', 'Open dekindeling met opbergluiken en antislip vloerdelen', 'Open dek', '4 / 5'), category: 'Dek', caption: 'Open dek' },
  { ...media('gal-antislip', 'Antislip vloerdelen op het dek', 'Antislip vloer', '1 / 1'), category: 'Dek', caption: 'Antislip' },
  { ...media('gal-werpdek', 'Verhoogd werpdek van de Assault 500 Fish', 'Werpdek', '4 / 3'), category: 'Fish', caption: 'Werpdek' },
  { ...media('gal-hengelberging', 'Geopende hengelberging onder het werpdek', 'Hengelberging', '3 / 4'), category: 'Fish', caption: 'Hengelberging' },
  { ...media('gal-lasdetail', 'Lasnaad tussen twee aluminium platen', 'Lasdetail', '1 / 1'), category: 'Details', caption: 'Lasdetail' },
  { ...media('gal-spiegel-motor', 'Spiegel met langstaartmotor', 'Spiegel · motor', '4 / 3'), category: 'Details', caption: 'Spiegel' },
  { ...media('gal-tiller', 'Tiller-besturing aan boord', 'Tiller', '3 / 4'), category: 'Details', caption: 'Tiller' },
  { ...media('gal-varend', 'Assault 500 varend met hekgolf', 'Varend · hekgolf', '16 / 10'), category: 'On the water', caption: 'Onderweg' },
  { ...media('gal-anker', 'Assault 500 voor anker bij zonsondergang', 'Lifestyle · anker', '4 / 3'), category: 'On the water', caption: 'Voor anker' },
  { ...media('render-aft-quarter', 'Render van de Assault 500 schuin van achteren', 'Render · aft quarter', '16 / 9', RENDER), category: 'Renders', caption: 'Aft quarter' },
  { ...media('render-bow-quarter', 'Render van de Assault 500 schuin van voren', 'Render · bow quarter', '16 / 9', RENDER), category: 'Renders', caption: 'Bow quarter' },
  { ...media('render-top-down', 'Bovenaanzicht render van de Assault 500', 'Render · top down', '16 / 9', RENDER), category: 'Renders', caption: 'Top down' },
  { ...media('render-stern-on', 'Render van de Assault 500 recht van achteren, met de volledige dekindeling in beeld', 'Render · stern on', '16 / 9', RENDER), category: 'Renders', caption: 'Stern on' },
];

export const MERCH = {
  index: '05',
  wordmark: 'Assault',
  drop: 'Drop 01',
  media: [
    media('merch-cap', 'Assault cap uit Drop 01', 'Merch · cap', '3 / 4'),
    media('merch-tee', 'Assault tee uit Drop 01', 'Merch · tee', '3 / 4'),
    media('merch-hoodie', 'Assault hoodie uit Drop 01', 'Merch · hoodie', '3 / 4'),
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
  media: media('werkplaats', 'De Assault 500 in de werkplaats', 'Werkplaats', '3 / 4'),
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
