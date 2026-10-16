import type { Metadata } from 'next';
import { site, hasAddress } from './site';
import { localeMeta, defaultLocale, locales, type Locale } from './i18n/config';

type MetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  locale?: Locale;
  noindex?: boolean;
};

export function absoluteUrl(path: string) {
  return `${site.url}${path === '/' ? '' : path}` || site.url;
}

export function buildMetadata({ title, description, path, image = '/og-default.jpg', locale = defaultLocale, noindex }: MetaInput): Metadata {
  const url = absoluteUrl(path);
  const languages: Record<string, string> = {};
  for (const l of locales) languages[localeMeta[l].htmlLang] = url; // uitbreiden zodra 'en' live gaat
  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      type: 'website',
      url,
      siteName: site.name,
      title: `${title} | ${site.name}`,
      description,
      locale: localeMeta[locale].ogLocale,
      images: [{ url: image, width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` }],
    },
    twitter: { card: 'summary_large_image', title: `${title} | ${site.name}`, description, images: [image] },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

export function organizationJsonLd() {
  const org: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    logo: `${site.url}/icon-512.png`,
    slogan: site.tagline,
    description:
      'GROTECH is een Nederlandse B2B-productiepartner, gespecialiseerd in aluminium: snijwerk, zetwerk, laswerk en samenstellingen in aluminium, en CNC-frezen en -draaien in alle materialen. Via geselecteerde productiepartners en in eigen beheer.',
    areaServed: [{ '@type': 'Country', name: 'Nederland' }, { '@type': 'Place', name: 'Europa' }],
    knowsAbout: ['Aluminium', 'Aluminium snijwerk', 'Aluminium zetwerk', 'Aluminium lassen', 'TIG-lassen', 'MIG-lassen', 'CNC-frezen', 'CNC-draaien'],
  };
  if (site.email) org.email = site.email;
  if (site.phone) org.telephone = site.phone;
  if (site.vat) org.vatID = site.vat;
  if (hasAddress())
    org.address = {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressCountry: site.address.country,
    };
  if (site.linkedin) org.sameAs = [site.linkedin];
  return org;
}

export function websiteJsonLd() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${site.url}/#website`, url: site.url, name: site.name, inLanguage: 'nl-NL', publisher: { '@id': `${site.url}/#organization` } };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

export function serviceJsonLd(s: { name: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    serviceType: s.name,
    description: s.description,
    url: absoluteUrl(s.path),
    provider: { '@id': `${site.url}/#organization` },
    areaServed: { '@type': 'Country', name: 'Nederland' },
  };
}

export function faqJsonLd(faq: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}
