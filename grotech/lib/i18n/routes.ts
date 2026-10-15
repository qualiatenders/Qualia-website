import type { Locale } from './config';

/**
 * Eén plek voor alle paden. Componenten linken via `href('services')` en nooit
 * met hardcoded strings, zodat Engelse slugs later alleen hier bij hoeven.
 */
const paths = {
  home: { nl: '/', en: '/en' },
  services: { nl: '/diensten', en: '/en/services' },
  process: { nl: '/#werkwijze', en: '/en#process' },
  about: { nl: '/#over-grotech', en: '/en#about' },
  quote: { nl: '/offerte-aanvragen', en: '/en/request-a-quote' },
  contact: { nl: '/contact', en: '/en/contact' },
  privacy: { nl: '/privacyverklaring', en: '/en/privacy' },
  disclaimer: { nl: '/disclaimer', en: '/en/disclaimer' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof paths;

export function href(key: RouteKey, locale: Locale = 'nl'): string {
  return paths[key][locale];
}

/** Elke dienst is een sectie op de dienstenpagina. */
export function serviceHref(slug: string, locale: Locale = 'nl'): string {
  return `${paths.services[locale]}#${slug}`;
}

export function quoteHref(techniqueSlug?: string, locale: Locale = 'nl'): string {
  return techniqueSlug ? `${paths.quote[locale]}?techniek=${encodeURIComponent(techniqueSlug)}` : paths.quote[locale];
}
