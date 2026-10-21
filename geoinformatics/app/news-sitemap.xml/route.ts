import { content, isPreviewContent } from '@/lib/content';
import { absoluteUrl, site } from '@/lib/site';

export const revalidate = 300;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Google News sitemap: editorial articles from the last 48 hours. Sponsored content is excluded. */
export async function GET() {
  const cutoff = Date.now() - 48 * 3_600_000;
  const items = isPreviewContent ? [] : (await content.allPaths()).filter((a) => !a.sponsored && new Date(a.publishedAt).getTime() >= cutoff).slice(0, 1000);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items
  .map(
    (a) => `  <url>
    <loc>${esc(absoluteUrl(a.path))}</loc>
    <news:news>
      <news:publication><news:name>${esc(site.name)}</news:name><news:language>en</news:language></news:publication>
      <news:publication_date>${a.publishedAt}</news:publication_date>
      <news:title>${esc(a.title)}</news:title>
    </news:news>
  </url>`,
  )
  .join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, s-maxage=300' } });
}
