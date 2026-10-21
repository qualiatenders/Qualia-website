import type { Metadata } from 'next';
import { content } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { IndustriesStrip } from '@/components/home/IndustriesStrip';
import { DeskBlocks } from '@/components/home/DeskBlocks';
import { NewsletterBand } from '@/components/home/NewsletterBand';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: 'Industries',
  description: 'All ten GeoInformatics desks at a glance, from surveying and LiDAR to Earth observation, hydrography, GNSS and GeoAI.',
  path: '/industries/',
});

export default async function IndustriesPage() {
  const desks = await content.categories();
  const perDesk = await Promise.all(desks.map(async (c) => ({ desk: c, list: await content.list({ category: c.slug, perPage: 4 }) })));
  const counts = Object.fromEntries(perDesk.map((d) => [d.desk.slug, d.list.total]));
  const blocks = perDesk.filter((d) => d.list.items.length).map((d) => ({ desk: d.desk, items: d.list.items }));
  return (
    <>
      <PageHero kicker="Ten desks" title="Industries" intro="The full geospatial value chain, from the sensor to the boardroom. Pick your field, or see what is moving next door." crumbs={[{ name: 'Home', path: '/' }, { name: 'Industries', path: '/industries/' }]} visual="tiles" />
      <IndustriesStrip desks={desks} counts={counts} />
      <AdSlot placement="home-leaderboard" className="surface-white border-y border-line py-10" />
      <DeskBlocks blocks={blocks} />
      <NewsletterBand source="industries" />
    </>
  );
}
