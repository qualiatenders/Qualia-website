import type { Locale } from './config';

/**
 * Eén plek voor alle paden. Componenten linken via `href('materials')` en nooit
 * met hardcoded strings, zodat Engelse slugs later alleen hier bij hoeven.
 */
const paths = {
  home: { nl: '/', en: '/en' },
  services: { nl: '/productietechnieken', en: '/en/manufacturing' },
  materials: { nl: '/materialen', en: '/en/materials' },
  process: { nl: '/werkwijze-en-kwaliteit', en: '/en/process-and-quality' },
  about: { nl: '/over-grotech', en: '/en/about' },
  quote: { nl: '/offerte-aanvragen', en: '/en/request-a-quote' },
  contact: { nl: '/contact', en: '/en/contact' },
  privacy: { nl: '/privacyverklaring', en: '/en/privacy' },
  cookies: { nl: '/cookieverklaring', en: '/en/cookies' },
  disclaimer: { nl: '/disclaimer', en: '/en/disclaimer' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof paths;

export function href(key: RouteKey, locale: Locale = 'nl'): string {
  return paths[key][locale];
}

export function serviceHref(slug: string, locale: Locale = 'nl'): string {
  return `${paths.services[locale]}/${slug}`;
}

export function quoteHref(techniqueSlug?: string, locale: Locale = 'nl'): string {
  return techniqueSlug ? `${paths.quote[locale]}?techniek=${encodeURIComponent(techniqueSlug)}` : paths.quote[locale];
}
