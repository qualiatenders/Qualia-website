import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { content } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { ArchiveBody, PER_PAGE, pageParam } from '@/components/ArchiveBody';

export const revalidate = 600;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const tag = await content.tag(slug);
  if (!tag) return { title: 'Not found' };
  const page = pageParam(sp.page);
  // Thin tag archives stay out of the index; they remain useful for navigation.
  const list = await content.list({ tag: slug, perPage: 1 });
  return pageMetadata({ title: `${tag.name}`, description: `GeoInformatics coverage of ${tag.name}.`, path: `/tag/${slug}/${page > 1 ? `?page=${page}` : ''}`, noindex: list.total < 3 });
}

export default async function TagPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const tag = await content.tag(slug);
  if (!tag) notFound();
  const page = pageParam(sp.page);
  const list = await content.list({ tag: slug, page, perPage: PER_PAGE });
  return (
    <>
      <PageHero kicker="Topic" title={tag.name} crumbs={[{ name: 'Home', path: '/' }, { name: tag.name, path: `/tag/${slug}/` }]} />
      <ArchiveBody list={list} base={`/tag/${slug}/`} page={page} tag={slug} filters={false} />
    </>
  );
}
