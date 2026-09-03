import type { MetadataRoute } from 'next';
import { ROUTES, absoluteUrl } from '@/lib/site';

/**
 * Next schrijft dit bij een statische export weg als /sitemap.xml.
 *
 * De lijst komt uit lib/site.ts, dus een nieuwe route belandt hier vanzelf
 * in — zolang hij op sitemap: true staat. Alleen canonieke, indexeerbare
 * pagina's; geen redirects, geen noindex, geen query-URLs.
 */
/* Statische export: dit bestand wordt één keer bij de build weggeschreven. */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const laatstGewijzigd = new Date();

  return ROUTES.filter((route) => route.sitemap).map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: laatstGewijzigd,
    changeFrequency: route.priority && route.priority >= 0.8 ? 'monthly' : 'yearly',
    priority: route.priority ?? 0.5,
  }));
}
