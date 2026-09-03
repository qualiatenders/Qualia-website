/**
 * ASSAULT BOATS — site-brede constanten.
 *
 * Eén plek voor het canonieke domein, de bedrijfsgegevens en de
 * routelijst. De sitemap, de navigatie, de structured data en de
 * metadata van elke pagina lezen hieruit, zodat ze niet uit elkaar
 * kunnen lopen.
 *
 * BELANGRIJK: hier staan alleen gegevens die daadwerkelijk op de site of
 * in de prijslijst staan. Ontbrekende juridische gegevens (KvK, btw-nummer,
 * postcode) staan bewust als null — nooit invullen met een gok.
 */

/** Zonder slash aan het eind; alle absolute URLs worden hieruit gebouwd. */
export const SITE_URL = 'https://assaultboats.nl';

export const SITE = {
  name: 'Assault Boats',
  /** Kort, voor titels: "… | Assault Boats". */
  shortName: 'ASSAULT',
  locale: 'nl_NL',
  lang: 'nl',
} as const;

/**
 * Bedrijfsgegevens. Deze reeks moet exact overeenkomen met wat er op de
 * contactpagina, in de footer en in een Google Bedrijfsprofiel staat —
 * Google koppelt een bedrijf op die consistentie.
 */
export const COMPANY = {
  name: 'Assault Boats',
  street: 'Dingstede 6',
  city: 'Zwartsluis',
  country: 'NL',
  countryName: 'Nederland',
  /** TODO: postcode aanleveren; niet gokken, dit staat in structured data. */
  postalCode: null as string | null,
  /** TODO: KvK-nummer aanleveren voor de algemene voorwaarden. */
  kvk: null as string | null,
  /** TODO: btw-identificatienummer aanleveren. */
  vat: null as string | null,
  phoneDisplay: '06 55 32 43 50',
  phoneE164: '+31655324350',
  email: 'info@assaultboats.nl',
  openingHours: 'ma – za, op afspraak',
} as const;

export const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Dingstede+6+Zwartsluis';
export const WHATSAPP_URL = 'https://wa.me/31655324350';
export const PRICE_LIST_PATH = '/prijslijst-assault-500-2026.pdf';

/**
 * Het beeld dat WhatsApp, LinkedIn en Facebook tonen bij een gedeelde link.
 * Vaste URL, 1200x630, samengesteld uit eigen merkmateriaal — zie
 * scripts/build-og-image.mjs.
 */
export const OG_IMAGE = {
  path: '/og/assault-boats.jpg',
  width: 1200,
  height: 630,
  alt: 'De Assault 500, een aluminium V-jon van 5 meter, gebouwd in Nederland',
} as const;

export type RouteKey =
  | 'home'
  | 'assault-500'
  | 'assault-500-fish'
  | 'aluminium-visboot'
  | 'aluminium-v-jon'
  | 'over-assault'
  | 'contact'
  | 'privacy'
  | 'algemene-voorwaarden'
  | 'bedankt';

export type Route = {
  key: RouteKey;
  /** Met slash aan het begin en aan het eind, zoals de export ze schrijft. */
  path: string;
  /** Korte naam voor navigatie en broodkruimels. */
  label: string;
  /** In de sitemap? Bedankpagina en juridische pagina's hebben hier eigen regels. */
  sitemap: boolean;
  /** Prioriteit binnen de sitemap: puur een relatieve hint aan crawlers. */
  priority?: number;
  /** Uit de index houden (alleen de bedankpagina). */
  noindex?: boolean;
};

export const ROUTES: Route[] = [
  { key: 'home', path: '/', label: 'Home', sitemap: true, priority: 1 },
  { key: 'assault-500', path: '/assault-500/', label: 'Assault 500', sitemap: true, priority: 0.9 },
  { key: 'assault-500-fish', path: '/assault-500-fish/', label: 'Assault 500 Fish', sitemap: true, priority: 0.9 },
  { key: 'aluminium-visboot', path: '/aluminium-visboot/', label: 'Aluminium visboot', sitemap: true, priority: 0.7 },
  { key: 'aluminium-v-jon', path: '/aluminium-v-jon/', label: 'Aluminium V-jon', sitemap: true, priority: 0.7 },
  { key: 'over-assault', path: '/over-assault/', label: 'Over Assault', sitemap: true, priority: 0.6 },
  { key: 'contact', path: '/contact/', label: 'Contact', sitemap: true, priority: 0.8 },
  { key: 'privacy', path: '/privacy/', label: 'Privacy', sitemap: true, priority: 0.2 },
  { key: 'algemene-voorwaarden', path: '/algemene-voorwaarden/', label: 'Algemene voorwaarden', sitemap: true, priority: 0.2 },
  // Bedankpagina hoort niet in een zoekresultaat: hij zegt niets zonder de
  // stap ervoor, en hij vervuilt de conversiemeting.
  { key: 'bedankt', path: '/bedankt/', label: 'Bedankt', sitemap: false, noindex: true },
];

export const routeFor = (key: RouteKey): Route => {
  const route = ROUTES.find((r) => r.key === key);
  if (!route) throw new Error(`Onbekende route: ${key}`);
  return route;
};

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();
