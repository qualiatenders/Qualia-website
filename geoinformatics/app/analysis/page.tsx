import type { Metadata } from 'next';
import { content } from '@/lib/content';
import { intelligenceKinds } from '@/lib/taxonomy';
import { pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { ArchiveBody, PER_PAGE, pageParam } from '@/components/ArchiveBody';

export const revalidate = 300;

type Props = { searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = pageParam((await searchParams).page);
  return pageMetadata({
    title: 'Analysis & Insights',
    description: 'Analysis, interviews, features and opinion on the technology, markets and people shaping the geospatial industry.',
    path: page > 1 ? `/analysis/?page=${page}` : '/analysis/',
  });
}

export default async function AnalysisPage({ searchParams }: Props) {
  const page = pageParam((await searchParams).page);
  const [list, desks] = await Promise.all([content.list({ page, perPage: PER_PAGE, kinds: intelligenceKinds }), content.categories()]);
  return (
    <>
      <PageHero kicker="Geospatial Intelligence" title="Analysis & Insights" intro="Long reads, interviews and expert analysis — the context behind the headlines." crumbs={[{ name: 'Home', path: '/' }, { name: 'Analysis & Insights', path: '/analysis/' }]} visual="graticule" />
      <ArchiveBody list={list} base="/analysis/" page={page} desks={desks} kinds={intelligenceKinds} />
    </>
  );
}
