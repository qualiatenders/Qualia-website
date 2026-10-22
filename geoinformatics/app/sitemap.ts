import type { MetadataRoute } from 'next';
import { content, isPreviewContent } from '@/lib/content';
import { categories } from '@/lib/taxonomy';
import { legalDocs } from '@/lib/legal';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isPreviewContent) return [];
  const articles = await content.allPaths();
  const now = new Date();
  const statics = ['/', '/latest/', '/analysis/', '/news-map/', '/industries/', '/products/', '/deals/', '/topics/', '/events/', '/organizations/', '/newsletter/', '/advertise/', '/about/', '/contact/'].map((p) => ({
    url: absoluteUrl(p),
    lastModified: now,
    changeFrequency: p === '/' || p === '/latest/' ? ('hourly' as const) : ('weekly' as const),
    priority: p === '/' ? 1 : 0.6,
  }));
  return [
    ...statics,
    ...categories.map((c) => ({ url: absoluteUrl(c.path), lastModified: now, changeFrequency: 'daily' as const, priority: 0.7 })),
    ...legalDocs().map((d) => ({ url: absoluteUrl(`/legal/${d.slug}/`), changeFrequency: 'yearly' as const, priority: 0.1 })),
    ...articles.map((a) => ({ url: absoluteUrl(a.path), lastModified: new Date(a.updatedAt), changeFrequency: 'monthly' as const, priority: 0.5 })),
  ];
}
