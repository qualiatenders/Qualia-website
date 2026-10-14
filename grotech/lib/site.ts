/**
 * Bedrijfsgegevens. Waarden komen uit omgevingsvariabelen zodat ze zonder
 * codewijziging te beheren zijn. Wat niet is ingevuld wordt nergens getoond —
 * er verschijnen dus nooit verzonnen adressen, telefoonnummers of KvK-nummers.
 */
const env = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

export const site = {
  name: 'GROTECH',
  legalName: 'GROTECH',
  tagline: 'Precision Manufacturing',
  url: (env(process.env.NEXT_PUBLIC_SITE_URL) ?? 'http://localhost:3000').replace(/\/$/, ''),
  email: env(process.env.NEXT_PUBLIC_COMPANY_EMAIL),
  phone: env(process.env.NEXT_PUBLIC_COMPANY_PHONE),
  address: {
    street: env(process.env.NEXT_PUBLIC_COMPANY_STREET),
    postalCode: env(process.env.NEXT_PUBLIC_COMPANY_POSTAL_CODE),
    city: env(process.env.NEXT_PUBLIC_COMPANY_CITY),
    country: 'NL',
  },
  kvk: env(process.env.NEXT_PUBLIC_COMPANY_KVK),
  vat: env(process.env.NEXT_PUBLIC_COMPANY_VAT),
  linkedin: env(process.env.NEXT_PUBLIC_COMPANY_LINKEDIN),
} as const;

export function hasAddress() {
  return Boolean(site.address.street && site.address.city);
}

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`;
}
