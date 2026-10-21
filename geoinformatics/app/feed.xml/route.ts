import { content } from '@/lib/content';
import { absoluteUrl, site } from '@/lib/site';

export const revalidate = 300;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * RSS 2.0 feed of the latest stories. Also suitable as the source for
 * RSS-to-email campaigns in Mailchimp or Brevo. ?category=<slug> narrows it.
 */
export async function GET(req: Request) {
  const category = new URL(req.url).searchParams.get('category') || undefined;
  const { items } = await content.list({ perPage: 30, category });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>${esc(site.name)}</title>
  <link>${absoluteUrl('/')}</link>
  <description>${esc(site.description)}</description>
  <language>en</language>
  <atom:link href="${absoluteUrl('/feed.xml')}" rel="self" type="application/rss+xml" />
${items
  .map(
    (a) => `  <item>
    <title>${esc(a.sponsored ? `[${a.sponsored.label}] ${a.title}` : a.title)}</title>
    <link>${absoluteUrl(a.path)}</link>
    <guid isPermaLink="true">${absoluteUrl(a.path)}</guid>
    <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
    <dc:creator>${esc(a.sponsored?.sponsor ?? a.author.name)}</dc:creator>
    <category>${esc(a.category.name)}</category>
    <description>${esc(a.excerpt)}</description>
  </item>`,
  )
  .join('\n')}
</channel>
</rss>`;
  return new Response(xml, { headers: { 'content-type': 'application/rss+xml; charset=utf-8', 'cache-control': 'public, s-maxage=300' } });
}
