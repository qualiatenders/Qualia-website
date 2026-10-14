import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { href, serviceHref } from '@/lib/i18n/routes';
import { services } from '@/lib/content/nl/services';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const main = (['home', 'services', 'quote', 'materials', 'process', 'about', 'contact'] as const).map((k, i) => ({
    url: absoluteUrl(href(k)),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: k === 'home' ? 1 : k === 'quote' || k === 'services' ? 0.9 : 0.7 - i * 0.01,
  }));
  const svc = services.map((s) => ({ url: absoluteUrl(serviceHref(s.slug)), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 }));
  const legal = (['privacy', 'cookies', 'disclaimer'] as const).map((k) => ({ url: absoluteUrl(href(k)), lastModified: now, changeFrequency: 'yearly' as const, priority: 0.2 }));
  return [...main, ...svc, ...legal];
}
