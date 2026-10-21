import type { Metadata } from 'next';
import Link from 'next/link';
import { content } from '@/lib/content';
import { categories } from '@/lib/taxonomy';
import { PageHero } from '@/components/PageHero';
import { RowCard } from '@/components/Cards';
import { Pagination } from '@/components/Pagination';
import { Icon } from '@/components/Icon';
import { pageParam } from '@/components/ArchiveBody';

export const metadata: Metadata = { title: 'Search', robots: { index: false, follow: true }, alternates: { canonical: '/search/' } };

type Props = { searchParams: Promise<{ q?: string; desk?: string; page?: string }> };

const suggestions = ['LiDAR', 'digital twin', 'GNSS', 'InSAR', 'GeoAI', 'bathymetry', 'cloud-native'];

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim().slice(0, 120);
  const desk = categories.find((c) => c.slug === sp.desk)?.slug;
  const page = pageParam(sp.page);
  const results = q ? await content.search(q, { category: desk, page, perPage: 12 }) : null;
  const qs = (extra: Record<string, string | undefined>) =>
    new URLSearchParams(Object.entries({ q, ...extra }).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <>
      <PageHero kicker="Search" title={q ? `“${q}”` : 'Search GeoInformatics'} crumbs={[{ name: 'Home', path: '/' }, { name: 'Search', path: '/search/' }]}>
        <form role="search" action="/search/" className="mt-10 flex max-w-2xl border border-white/25 focus-within:border-white">
          <label htmlFor="search-q" className="sr-only">
            Search terms
          </label>
          <input id="search-q" name="q" type="search" defaultValue={q} placeholder="Technologies, organisations, topics…" className="min-w-0 flex-1 bg-transparent px-5 py-4 text-lg placeholder:text-white focus:outline-none" />
          {desk && <input type="hidden" name="desk" value={desk} />}
          <button type="submit" className="btn btn-red min-h-0 px-6">
            <Icon name="search" className="size-5" />
            <span className="sr-only sm:not-sr-only">Search</span>
          </button>
        </form>
      </PageHero>

      <section className="surface-paper py-12 lg:py-16">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-3" aria-label="Filter results">
            <p className="kicker mb-4 text-fg-subtle">Filter by industry</p>
            <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
              {[{ slug: '', name: 'All industries' }, ...categories].map((c) => {
                const active = (desk ?? '') === c.slug;
                return (
                  <li key={c.slug || 'all'} className="flex-none">
                    <Link
                      href={`/search/?${qs({ desk: c.slug || undefined })}`}
                      aria-current={active ? 'true' : undefined}
                      className={`block border px-3 py-2 text-sm whitespace-nowrap lg:border-0 lg:border-l-2 lg:px-4 ${active ? 'border-ink bg-ink text-white lg:border-red lg:bg-transparent lg:font-semibold lg:text-ink' : 'border-line-strong text-fg-muted hover:text-fg lg:border-transparent'}`}
                    >
                      {c.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
          <div className="min-w-0 lg:col-span-9">
            {!q ? (
              <div>
                <p className="text-lg text-fg-muted">Try one of these:</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <Link href={`/search/?q=${encodeURIComponent(s)}`} className="inline-block border border-line-strong px-4 py-2 hover:border-[color:var(--fg)]">
                        {s}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : results && results.items.length ? (
              <>
                <p className="meta mb-2" role="status">
                  {results.total} result{results.total === 1 ? '' : 's'}
                  {desk ? ` in ${categories.find((c) => c.slug === desk)?.name}` : ''}
                </p>
                <ul>
                  {results.items.map((a) => (
                    <li key={a.id} className="border-b border-line py-6">
                      <RowCard article={a} />
                    </li>
                  ))}
                </ul>
                <Pagination base="/search/" page={page} totalPages={results.totalPages} query={qs({ desk })} />
              </>
            ) : (
              <div role="status" className="border border-dashed border-line-strong p-10">
                <p className="font-display text-2xl font-semibold">No results for “{q}”.</p>
                <p className="mt-2 text-fg-muted">Check the spelling, try a broader term{desk ? ', or search all industries' : ''}.</p>
                {desk && (
                  <Link href={`/search/?${qs({})}`} className="btn btn-dark mt-6">
                    Search all industries
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
