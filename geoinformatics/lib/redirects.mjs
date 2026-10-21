/**
 * Permanent (301) redirects from legacy WordPress URLs to the new frontend.
 *
 * Articles, categories (/category/…), tags (/tag/…) and authors (/author/…)
 * keep their existing WordPress paths and are NOT listed here. Add entries
 * for pages that were renamed during the migration. Verify the old paths
 * against the live site's sitemap before going live.
 *
 * @type {import('next/dist/lib/load-custom-routes').Redirect[]}
 */
export const legacyRedirects = [
  { source: '/feed', destination: '/feed.xml', permanent: true },
  { source: '/feed/', destination: '/feed.xml', permanent: true },
  // WordPress search (/?s=term) → new search page
  { source: '/', has: [{ type: 'query', key: 's', value: '(?<q>.*)' }], destination: '/search?q=:q', permanent: true },
  { source: '/advertising', destination: '/advertise', permanent: true },
  { source: '/subscribe', destination: '/newsletter', permanent: true },
  { source: '/privacy-policy', destination: '/legal/privacy', permanent: true },
];
