import type { Metadata } from 'next';
import { COMPANY, MAPS_URL, OG_IMAGE, PRICE_LIST_PATH, SITE, SITE_URL, absoluteUrl, routeFor, type RouteKey } from './site';

/**
 * Bouwt de metadata van één pagina.
 *
 * Elke publieke pagina krijgt hierdoor gegarandeerd een eigen title, eigen
 * omschrijving, een canonical en een Open Graph-blok met een echt beeld —
 * de drie dingen die op deze site ontbraken.
 */
export function pageMetadata({
  route,
  title,
  description,
  ogTitle,
  image,
}: {
  route: RouteKey;
  /** Zonder merknaam: die wordt via het template toegevoegd. */
  title: string;
  description: string;
  /** Alleen zetten als de gedeelde titel korter of pakkender moet zijn. */
  ogTitle?: string;
  image?: { path: string; alt: string; width?: number; height?: number };
}): Metadata {
  const { path, noindex } = routeFor(route);
  const url = absoluteUrl(path);
  const og = image
    ? { url: absoluteUrl(image.path), width: image.width ?? OG_IMAGE.width, height: image.height ?? OG_IMAGE.height, alt: image.alt }
    : { url: absoluteUrl(OG_IMAGE.path), width: OG_IMAGE.width, height: OG_IMAGE.height, alt: OG_IMAGE.alt };

  return {
    title,
    description,
    alternates: { canonical: url },
    // Alleen de bedankpagina wordt uitgesloten; de rest mag gewoon mee.
    robots: noindex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: SITE.locale,
      url,
      title: ogTitle ?? title,
      description,
      images: [og],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle ?? title,
      description,
      images: [og.url],
    },
  };
}

/* ------------------------------------------------------------------
   JSON-LD
   Alleen gegevens die ook zichtbaar op de site staan. Geen reviews,
   geen ratings, geen voorraad — die hebben we niet.
------------------------------------------------------------------ */

/** Eén script-tag; Next zet hem ongewijzigd in de HTML. */
export function jsonLd(data: object) {
  return {
    __html: JSON.stringify(data).replace(/</g, '\\u003c'),
  };
}

export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: COMPANY.name,
  url: SITE_URL,
  logo: absoluteUrl('/images/brand/logo.webp'),
  image: absoluteUrl(OG_IMAGE.path),
  description:
    'Assault Boats bouwt aluminium boten in Nederland. De Assault 500 is een V-jon van 5 meter, leverbaar als open uitvoering en als Fish met vast werpdek.',
  email: COMPANY.email,
  telephone: COMPANY.phoneE164,
  address: {
    '@type': 'PostalAddress',
    streetAddress: COMPANY.street,
    addressLocality: COMPANY.city,
    addressCountry: COMPANY.country,
    // postalCode blijft weg zolang hij niet bekend is: liever geen veld dan
    // een verkeerd veld, want Google koppelt hierop.
    ...(COMPANY.postalCode ? { postalCode: COMPANY.postalCode } : {}),
  },
  hasMap: MAPS_URL,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    telephone: COMPANY.phoneE164,
    email: COMPANY.email,
    areaServed: 'NL',
    availableLanguage: ['nl'],
  },
});

export const breadcrumbSchema = (trail: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((step, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: step.name,
    item: absoluteUrl(step.path),
  })),
});

/**
 * Productschema. De prijs staat in de openbare prijslijst op deze site, dus
 * een Offer is verantwoord — maar hij moet mee veranderen als de prijslijst
 * verandert. Beide komen uit lib/content.ts, dus dat gebeurt vanzelf.
 */
export const productSchema = ({
  name,
  description,
  path,
  imagePath,
  price,
  extraProperties = [],
}: {
  name: string;
  description: string;
  path: string;
  imagePath: string;
  price: number;
  extraProperties?: { name: string; value: string }[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name,
  description,
  url: absoluteUrl(path),
  image: absoluteUrl(imagePath),
  brand: { '@type': 'Brand', name: SITE.name },
  manufacturer: { '@id': `${SITE_URL}/#organization` },
  material: 'Aluminium 5083',
  category: 'Aluminium visboot',
  additionalProperty: extraProperties.map((p) => ({
    '@type': 'PropertyValue',
    name: p.name,
    value: p.value,
  })),
  offers: {
    '@type': 'Offer',
    price: String(price),
    priceCurrency: 'EUR',
    // Consumentenprijs inclusief 21% btw, zoals op de prijslijst.
    valueAddedTaxIncluded: true,
    availability: 'https://schema.org/PreOrder',
    url: absoluteUrl(path),
    seller: { '@id': `${SITE_URL}/#organization` },
  },
});

export const faqSchema = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
});

export const PRICE_LIST_URL = absoluteUrl(PRICE_LIST_PATH);
