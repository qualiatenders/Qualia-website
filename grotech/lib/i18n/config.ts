/**
 * Taalconfiguratie.
 *
 * Versie 1 is Nederlandstalig en draait zonder taalprefix (/productietechnieken).
 * De structuur is voorbereid op Engels: alle routes lopen via `routes.ts`, alle
 * teksten via `lib/content/<locale>` en `dictionaries/<locale>`. Engels toevoegen:
 *   1. 'en' aan `locales` toevoegen;
 *   2. `lib/content/en` en `dictionaries/en.ts` vullen (zelfde types);
 *   3. de app-routes spiegelen onder app/en/ (of een [locale]-segment invoeren);
 *   4. `alternates` in lib/seo.ts pikt de hreflang-koppelingen automatisch op.
 */
export const locales = ['nl'] as const;
export type Locale = (typeof locales)[number] | 'en';
export const defaultLocale: Locale = 'nl';

export const localeMeta: Record<Locale, { htmlLang: string; ogLocale: string; label: string }> = {
  nl: { htmlLang: 'nl', ogLocale: 'nl_NL', label: 'Nederlands' },
  en: { htmlLang: 'en', ogLocale: 'en_GB', label: 'English' },
};
