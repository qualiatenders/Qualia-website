import type { Metadata } from 'next';
import { briefing } from '@/lib/briefings';
import { pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { ArchiveBody } from '@/components/ArchiveBody';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: 'Product Radar',
  description: 'New geospatial products, newest first: LiDAR scanners, GNSS receivers, sensors, GIS platforms and software releases.',
  path: '/products/',
});

export default async function Page() {
  const items = await briefing('products');
  return (
    <>
      <PageHero kicker="New hardware, software & services" title="Product Radar" intro="Every product launch we report, newest first: scanners, receivers, sensors, platforms and software releases." crumbs={[{ name: 'Home', path: '/' }, { name: 'Product Radar', path: '/products/' }]} visual="pointcloud" />
      <AdSlot placement="site-leaderboard" className="surface-paper shell pt-10" />
      <ArchiveBody list={{ items, total: items.length, totalPages: 1, page: 1 }} base="/products/" page={1} filters={false} newswire />
    </>
  );
}
