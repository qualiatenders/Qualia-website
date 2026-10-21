import type { Metadata } from 'next';
import { content } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { ArchiveBody, PER_PAGE, pageParam } from '@/components/ArchiveBody';
import { AdSlot } from '@/components/ads/AdSlot';

type Props = { searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = pageParam((await searchParams).page);
  return pageMetadata({
    title: page > 1 ? `Latest geospatial news — page ${page}` : 'Latest geospatial news',
    description: 'Every story from GeoInformatics, newest first: surveying, GIS, Earth observation, LiDAR, digital twins, hydrography, GNSS and GeoAI.',
    path: page > 1 ? `/latest/?page=${page}` : '/latest/',
  });
}

export default async function LatestPage({ searchParams }: Props) {
  const page = pageParam((await searchParams).page);
  const [list, desks] = await Promise.all([content.list({ page, perPage: PER_PAGE }), content.categories()]);
  return (
    <>
      <PageHero kicker="All desks · Newest first" title="Latest news" intro="The full GeoInformatics newswire. Filter by industry to follow your field." crumbs={[{ name: 'Home', path: '/' }, { name: 'Latest news', path: '/latest/' }]} visual="contours" />
      <AdSlot placement="site-leaderboard" className="surface-paper shell pt-10" />
      <ArchiveBody list={list} base="/latest/" page={page} desks={desks} />
    </>
  );
}
