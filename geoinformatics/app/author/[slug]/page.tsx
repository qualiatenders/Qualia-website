import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { content } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { ArchiveBody, PER_PAGE, pageParam } from '@/components/ArchiveBody';

export const revalidate = 600;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await content.author(slug);
  if (!a) return { title: 'Not found' };
  return pageMetadata({ title: a.name, description: a.bio || `Articles by ${a.name} on GeoInformatics.`, path: `/author/${slug}/` });
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const author = await content.author(slug);
  if (!author) notFound();
  const page = pageParam(sp.page);
  const list = await content.list({ author: slug, page, perPage: PER_PAGE });
  return (
    <>
      <PageHero kicker={author.role ?? 'Author'} title={author.name} intro={author.bio} crumbs={[{ name: 'Home', path: '/' }, { name: author.name, path: `/author/${slug}/` }]} />
      <ArchiveBody list={list} base={`/author/${slug}/`} page={page} author={slug} filters={false} />
    </>
  );
}
