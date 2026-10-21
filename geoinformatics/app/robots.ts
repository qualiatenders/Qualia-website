import type { MetadataRoute } from 'next';
import { isPreviewContent } from '@/lib/content';
import { absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  // Preview content must never be indexed.
  if (isPreviewContent) return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/search/', '/newsletter/confirmed/'] }],
    sitemap: [absoluteUrl('/sitemap.xml'), absoluteUrl('/news-sitemap.xml')],
    host: absoluteUrl('/'),
  };
}
