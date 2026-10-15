import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { href } from '@/lib/i18n/routes';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const main = (['home', 'services', 'quote', 'contact'] as const).map((k) => ({
    url: absoluteUrl(href(k)),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: k === 'home' ? 1 : k === 'contact' ? 0.7 : 0.9,
  }));
  const legal = (['privacy', 'disclaimer'] as const).map((k) => ({ url: absoluteUrl(href(k)), lastModified: now, changeFrequency: 'yearly' as const, priority: 0.2 }));
  return [...main, ...legal];
}
