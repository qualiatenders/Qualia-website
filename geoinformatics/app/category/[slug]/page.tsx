import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { content } from '@/lib/content';
import { categoryBySlug, categories } from '@/lib/taxonomy';
import { pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { ArchiveBody, PER_PAGE, pageParam } from '@/components/ArchiveBody';
import { AdSlot } from '@/components/ads/AdSlot';
import { NewsletterBand } from '@/components/home/NewsletterBand';
import type { Category } from '@/lib/types';

export const revalidate = 300;
export const generateStaticParams = async () => categories.map((c) => ({ slug: c.slug }));

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

/** A desk from the taxonomy, or any other WordPress category that has stories. */
async function resolve(slug: string, page: number) {
  const list = await content.list({ category: slug, page, perPage: PER_PAGE });
  const cat: Category | undefined = categoryBySlug(slug) ?? list.items[0]?.categories.find((c) => c.slug === slug);
  return cat ? { cat, list } : null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const page = pageParam(sp.page);
  const r = await resolve(slug, page);
  if (!r) return { title: 'Not found' };
  return pageMetadata({
    title: `${r.cat.name} news${page > 1 ? ` — page ${page}` : ''}`,
    description: r.cat.description || `${r.cat.name} news and analysis from GeoInformatics.`,
    path: `${r.cat.path}${page > 1 ? `?page=${page}` : ''}`,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const page = pageParam(sp.page);
  const r = await resolve(slug, page);
  if (!r) notFound();
  const { cat, list } = r;
  const others = categories.filter((c) => c.slug !== cat.slug);
  return (
    <>
      <PageHero kicker="Industry desk" code={cat.code} title={cat.name} intro={cat.description} crumbs={[{ name: 'Home', path: '/' }, { name: cat.name, path: cat.path }]} visual={cat.visual} />
      <AdSlot placement="category-leaderboard" category={cat.slug} className="surface-paper shell pt-10" />
      <ArchiveBody
        list={list}
        base={cat.path}
        page={page}
        category={cat.slug}
        filters={false}
        aside={
          <nav aria-label="Other desks" className="border border-line p-6">
            <p className="kicker mb-3 text-fg-subtle">Other desks</p>
            <ul className="flex flex-wrap gap-2">
              {others.map((c) => (
                <li key={c.slug}>
                  <a href={c.path} className="inline-flex items-center gap-2 border border-line-strong px-2.5 py-1.5 text-[0.8125rem] transition-colors hover:border-[color:var(--fg)]">
                    <span className="font-mono text-[0.6875rem] text-accent">{c.code}</span>
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        }
      />
      <NewsletterBand source={`category:${cat.slug}`} />
    </>
  );
}
