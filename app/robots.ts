import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * Next schrijft dit bij een statische export weg als /robots.txt.
 *
 * Alles mag gecrawld worden — CSS en JS uitdrukkelijk ook, want zonder die
 * bestanden kan Google de pagina niet renderen en beoordelen. Alleen de
 * bedankpagina blijft buiten de index; die staat ook op noindex.
 */
/* Statische export: dit bestand wordt één keer bij de build weggeschreven. */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/bedankt/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
