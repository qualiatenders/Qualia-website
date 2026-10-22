import type { Metadata } from 'next';
import { briefing } from '@/lib/briefings';
import { pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { ArchiveBody } from '@/components/ArchiveBody';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: 'Deals & Partnerships',
  description: 'Acquisitions, partnerships, contracts and integrations in the geospatial industry, newest first.',
  path: '/deals/',
});

export default async function Page() {
  const items = await briefing('deals');
  return (
    <>
      <PageHero kicker="Who is buying, partnering and winning contracts" title="Deals & Partnerships" intro="Acquisitions, partnerships, contracts and integrations across the geospatial industry, newest first." crumbs={[{ name: 'Home', path: '/' }, { name: 'Deals & Partnerships', path: '/deals/' }]} visual="graticule" />
      <AdSlot placement="site-leaderboard" className="surface-paper shell pt-10" />
      <ArchiveBody list={{ items, total: items.length, totalPages: 1, page: 1 }} base="/deals/" page={1} filters={false} newswire />
    </>
  );
}
