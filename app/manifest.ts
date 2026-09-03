import type { MetadataRoute } from 'next';
import { COMPANY, SITE } from '@/lib/site';

/** Voor "toevoegen aan beginscherm" op mobiel. Zelfde kleuren als de site. */
/* Statische export: dit bestand wordt één keer bij de build weggeschreven. */
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${COMPANY.name} — aluminium boten`,
    short_name: SITE.shortName,
    description: 'Aluminium V-jons en visboten, gebouwd in Nederland.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    lang: SITE.lang,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
