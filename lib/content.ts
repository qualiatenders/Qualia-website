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

/**
 * Merkassets uit public/images/brand/. Zolang `logo` ontbreekt valt de site
 * terug op het getypte woordmerk, zodat er nooit een gat valt.
 *
 * `logo` — horizontale lockup in de header. Het ronde embleem leeft als
 * favicon in app/icon.png en heeft hier geen slot nodig.
 */
export const LOGO: MediaSlot | null = FILES['logo']
  ? media('logo', 'Assault Boats', 'Logo', 'auto')
  : null;


/** De renders zijn vrijstaand gemaakt: nooit bijsnijden, altijd op licht. */
const RENDER = { fit: 'contain', tone: 'light' } as const;

/**
 * Navigatie wijst naar echte routes, niet naar ankers: een anker werkt
 * alleen op de homepage en zou op elke andere pagina doodlopen.
 */
export const NAV_LINKS = [
  { label: 'Assault 500', href: '/assault-500/' },
  { label: 'Fish', href: '/assault-500-fish/' },
  { label: 'Over Assault', href: '/over-assault/' },
  { label: 'Contact', href: '/contact/' },
] as const;

export const HERO = {
  eyebrow: 'Model 2026 · Gebouwd in Nederland',
  title: 'Assault 500',
  lead: 'Eén boot. Twee manieren om het water op te gaan.',
  body: 'Een moderne aluminium V-jon van 5 meter. Open en ruim voor lange dagen op het water, of als Fish met werpdek en slimme opbergruimte.',
  cta: { label: 'Ontdek de Assault 500', href: '#assault-500' },
  media: media('render-aft-quarter', 'De Assault 500 schuin van achteren', 'Render · hero', '16 / 9', { tone: 'dark' }),
  stats: [
    { value: '5,00', unit: 'M', label: 'Lengte' },
    { value: '1,95', unit: 'M', label: 'Breedte' },
    { value: '4', unit: 'MM', label: 'Aluminium' },
    { value: '80', unit: 'PK', label: 'Max. motor' },
  ],
};

export const INTRO = {
  index: '01',
  eyebrow: 'Assault 500',
  title: 'Strak ontwerp. Sterke basis.',
  body: [
    'De Assault 500 is gebouwd met één idee: goed moet gewoon goed zijn.',
    'Een strakke romp, slimme indeling en geen onnodige poespas. De constructie wordt aan de binnen- én buitenzijde gelast en iedere Assault bouwen we zelf in Nederland.',
  ],
  points: [
    { title: 'Aluminium V-jon', body: 'Sterk, stabiel en lekker ruim.' },
    { title: 'Binnen + buiten gelast', body: 'Omdat goed bouwen verder gaat dan wat je ziet.' },
    { title: 'Later uit te breiden', body: 'Vandaag niet nodig? Dan hoeft het er ook nog niet op.' },
  ],
  media: {
    primary: media('detail-laswerk', 'Lasser aan het werk aan een aluminium naad', 'Detail · laswerk', '4 / 3'),
    // De render staat al in de hero, de uitvoeringen en de specificaties;
    // hier is hij de kleine plaat over de foto heen.
    detail: media('render-stern-on', 'De Assault 500 recht van achteren, met de volledige dekindeling in beeld', 'Render · stern on', '4 / 3', { fit: 'cover', tone: 'light' }),
  },
};

export type Model = {
  id: 'open' | 'fish';
  name: string;
  short: string;
  title: string;
  body: string;
  features: string[];
  media: MediaSlot;
};

export const MODELS: Model[] = [
  {
    id: 'open',
    name: 'Assault 500',
    short: '500',
    title: 'Hou het open.',
    body: 'Veel ruimte, een open dek en alle vrijheid om de boot te gebruiken zoals jij wilt. Met de optionele zijbanken creëer je extra zitruimte. Zonnige dag? Plaats het uitneembare zonnedek. Meer ruimte nodig? Dan haal je het er net zo makkelijk weer uit.',
    features: [
      'Open dekindeling',
      'Tiller-besturing standaard',
      'Zijbanken optioneel',
      'Uitneembaar zonnedek optioneel',
      'Stuurconsole optioneel',
      'Elektrische basis optioneel',
    ],
    media: media('render-bow-quarter', 'Render van de Assault 500 in de open uitvoering, schuin van voren', 'Render · 500 · bow quarter', '16 / 9', RENDER),
  },
  {
    id: 'fish',
    name: 'Assault 500 Fish',
    short: '500 Fish',
    title: 'Gebouwd om te vissen.',
    body: 'De Fish krijgt voorin een verhoogd werpdek met daaronder drie afsluitbare opbergruimtes. Eén daarvan is speciaal voor je hengels. Zo blijft je dek vrij en zit alles wat je nodig hebt netjes opgeborgen en binnen handbereik.',
    features: [
      'Verhoogd werpdek',
      'Drie afsluitbare opbergruimtes',
      'Aparte hengelberging',
      'Tiller-besturing standaard',
      'Stuurconsole optioneel',
      'Elektrische basis optioneel',
      'Ruim visdek',
    ],
    media: media('render-fish', 'Render van de Assault 500 Fish met verhoogd werpdek', 'Render · 500 Fish', '16 / 9', RENDER),
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
  { label: 'Lengte', value: '5,00', unit: 'm' },
  { label: 'Breedte', value: '1,95', unit: 'm' },
  { label: 'Plaatdikte', value: '4', unit: 'mm' },
  { label: 'Materiaal', value: 'Al 5083', unit: 'zeewaterbestendig' },
  { label: 'Gewicht romp', value: '320', unit: 'kg' },
  { label: 'Besturing', value: 'Tiller', unit: 'standaard · console optioneel' },
  { label: 'Max. belading', value: '4 pers.', unit: '360 kg' },
  { label: 'Max. motor', value: '80', unit: 'pk' },
];

export type GalleryItem = MediaSlot & { caption: string };

/**
 * Alleen fotografie van de boot. Geen categoriefilter: met één reeks beelden
 * voegt filteren niets toe en kost het alleen een klik.
 */
export const GALLERY: GalleryItem[] = [
  { ...media('foto-op-de-werf', 'De Assault 500 op de werf, schuin van voren', 'Op de werf', '3 / 4'), caption: 'Op de werf' },
  { ...media('foto-achterkwartier', 'De Assault 500 schuin van achteren, met spiegel en dek in beeld', 'Achterkwartier', '3 / 4'), caption: 'Achterkwartier' },
  { ...media('foto-vanaf-de-spiegel', 'Het dek gezien vanaf de spiegel, met antislip en opbergluiken', 'Vanaf de spiegel', '3 / 4'), caption: 'Vanaf de spiegel' },
  { ...media('foto-dekindeling', 'Close-up van de dekindeling met antislip vloerdelen en luiken', 'Dekindeling', '1 / 1'), caption: 'Dekindeling' },
  { ...media('foto-volle-lengte', 'De volle lengte van de romp met het open dek', 'Volle lengte', '3 / 4'), caption: 'Volle lengte' },
  { ...media('foto-boeg', 'De boeg van binnenuit, met greeprails en antislip randen', 'Boeg', '3 / 4'), caption: 'Boeg' },
  { ...media('foto-spiegel', 'De spiegel met achterplatform, recht van achteren', 'Spiegel', '1 / 1'), caption: 'Spiegel' },
  { ...media('foto-werkplaats', 'De Assault 500 op bokken voor de werkplaats', 'Bij de werkplaats', '3 / 4'), caption: 'Bij de werkplaats' },
];

/** Google Maps, zodat "kom langs" meteen een route oplevert. */
const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Dingstede+6+Zwartsluis';

/** wa.me wil het nummer zonder plus en zonder voorloopnul. */
const WHATSAPP_URL = 'https://wa.me/31655324350';

export const CONTACT = {
  index: '05',
  title: 'See it. Feel it. Drive it.',
  body: 'Foto\u2019s zijn mooi. Aan boord staan is beter. Kom de Assault 500 in het echt bekijken en ontdek welke uitvoering bij jou past.',
  details: [
    { label: 'Telefoon', value: '06 55 32 43 50', href: 'tel:+31655324350' },
    { label: 'E-mail', value: 'info@assaultboats.nl', href: 'mailto:info@assaultboats.nl' },
    { label: 'Werkplaats', value: 'Dingstede 6, Zwartsluis', href: MAPS_URL },
    { label: 'Op afspraak', value: 'ma \u2013 za', href: null },
  ] as { label: string; value: string; href: string | null }[],
  primary: { label: 'Kom langs', href: MAPS_URL },
  whatsapp: { label: 'WhatsApp', href: WHATSAPP_URL },
};

/**
 * De prijslijst is de enige route naar prijzen en opties: er komt geen
 * configurator, dus elke prijs-CTA op de site wijst naar dit bestand.
 */
export const PRICE_LIST_HREF = '/prijslijst-assault-500-2026.pdf';

export const PRICE_CTA = {
  cta: { label: 'Prijslijst', href: PRICE_LIST_HREF },
};

/**
 * Sluit sectie 02 af: je kiest nu een uitvoering, en wat je vandaag niet
 * nodig hebt kun je later alsnog bestellen. Het verhaal staat bewust op
 * één plek — herhaald in elke sectie wordt het een marketingriedel.
 */
export const EXPAND = {
  eyebrow: 'Stap voor stap',
  title: 'Begin met wat je nodig hebt.',
  body: 'Je hoeft je Assault niet in één keer vol te bouwen. Kies nu de uitvoering en de opties die je echt gebruikt — de rest kun je later alsnog bestellen.',
  steps: [
    {
      title: 'Nu kiezen',
      body: 'Vandaag niet nodig? Dan betaal je er vandaag ook niet voor.',
    },
    {
      title: 'Later aanvullen',
      body: 'Onze uitbreidingen zijn gestandaardiseerd. Wat je later bestelt, past gewoon.',
    },
    {
      title: 'Zelf of door ons',
      body: 'Waar het kan monteer je een uitbreiding zelf. Liever niet? Dan doen wij het.',
    },
  ],
  note: 'Het elektrisch basispakket is de vaste 12V-basis, door ons gemonteerd, aangesloten en getest. Latere elektrische uitbreidingen sluiten daar direct op aan.',
  cta: { label: 'Bekijk uitvoeringen en opties', href: PRICE_LIST_HREF },
};

export const FOOTER = {
  tagline: 'Gebouwd in Nederland.',
  links: [
    { label: 'Assault 500', href: '/assault-500/' },
    { label: 'Assault 500 Fish', href: '/assault-500-fish/' },
    { label: 'Aluminium visboot', href: '/aluminium-visboot/' },
    { label: 'Aluminium V-jon', href: '/aluminium-v-jon/' },
    { label: 'Over Assault', href: '/over-assault/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'Bekijk prijslijst', href: PRICE_LIST_HREF },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy/' },
    { label: 'Algemene voorwaarden', href: '/algemene-voorwaarden/' },
  ],
};

/* ------------------------------------------------------------------
   PRIJZEN EN OPTIES
   Bron: pricelist/prijslijst.html. Verandert daar een prijs, dan hoort
   hij hier mee te veranderen — het productschema leest deze bedragen.
------------------------------------------------------------------ */

export const MODEL_PRICES = {
  open: 9575,
  fish: 10375,
  /** Wat de Fish meer kost dan de Open. */
  fishSurcharge: 800,
} as const;

export type Option = {
  name: string;
  price: number;
  /** Op welke uitvoeringen de optie past. */
  open: boolean;
  fish: boolean;
  description: string;
};

export const OPTIONS: Option[] = [
  {
    name: 'Zijbanken',
    price: 395,
    open: true,
    fish: false,
    description: 'Gelaste aluminium zijbanken langs de kuip. Extra zitruimte, terwijl het dek zijn open indeling houdt.',
  },
  {
    name: 'Zonnedekpanelen',
    price: 375,
    open: true,
    fish: false,
    description: 'Uitneembare aluminium panelen die de zitruimte ombouwen tot een vlak zonnedek.',
  },
  {
    name: 'Aluminium stuurstand',
    price: 395,
    open: true,
    fish: true,
    description: 'Gelaste aluminium stuurconsole. Zonder stuurwiel, stuurinrichting en bedieningskabels.',
  },
  {
    name: 'Zware rubber stootrand',
    price: 595,
    open: true,
    fish: true,
    description: 'Zware rubber stootrand rondom de boot. Prijs inclusief montage.',
  },
  {
    name: 'Elektrisch basispakket',
    price: 595,
    open: true,
    fish: true,
    description: 'De vaste 12V-basis voor alle elektrische uitbreidingen. Af fabriek gemonteerd, aangesloten en getest. Accu niet inbegrepen.',
  },
  {
    name: 'Navigatieverlichting',
    price: 225,
    open: true,
    fish: true,
    description: 'Complete voorbedrade navigatieverlichting. Zelf te installeren of door ons te laten monteren.',
  },
  {
    name: 'Bilgepompset',
    price: 195,
    open: true,
    fish: true,
    description: 'Complete voorbedrade bilgepompset. Zelf te installeren of door ons te laten monteren.',
  },
  {
    name: 'Handrailing',
    price: 325,
    open: true,
    fish: true,
    description: 'Gelaste aluminium handrailing voor houvast aan boord.',
  },
];

/** Honda-buitenboordmotoren, adviesprijzen Honda Marine 2026 incl. btw. */
export const MOTORS = [
  { pk: 20, model: 'Honda BF20 D LHSU', spec: 'Langstaart · elektrische start · 12 A dynamo · 49 kg', price: 4529, tiller: 'Standaard' },
  { pk: 40, model: 'Honda BF40 D LRTZ', spec: 'Langstaart · elektrische start · power trim · 102 kg', price: 7879, tiller: '+ 319' },
  { pk: 60, model: 'Honda BF60 A LRTU', spec: 'Langstaart · elektrische start · power trim · 110 kg', price: 9949, tiller: '+ 419' },
  { pk: 80, model: 'Honda BF80 A LRTU', spec: 'Langstaart · elektrische start · power trim · 165 kg', price: 13299, tiller: '+ 619' },
];

/** "9.575" — Nederlandse notatie, zonder decimalen want dat zijn hele euro's. */
export const euro = (n: number) => n.toLocaleString('nl-NL');
