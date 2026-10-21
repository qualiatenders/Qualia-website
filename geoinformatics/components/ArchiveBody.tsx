import type { ArticleKind, ArticleList, Category } from '@/lib/types';
import { content } from '@/lib/content';
import { LatestFeed } from './LatestFeed';
import { RowCard } from './Cards';
import { Pagination } from './Pagination';
import { Trending } from './Trending';
import { AdSlot } from './ads/AdSlot';

/**
 * Archive body shared by Latest, desks, tags, authors and Intelligence.
 * Page 1 is the interactive feed; ?page=N renders a plain, crawlable archive
 * page with numbered pagination.
 */
export async function ArchiveBody({
  list,
  base,
  page,
  desks,
  category,
  kinds,
  tag,
  author,
  filters = true,
  aside,
}: {
  list: ArticleList;
  base: string;
  page: number;
  desks?: Category[];
  category?: string;
  kinds?: ArticleKind[];
  tag?: string;
  author?: string;
  filters?: boolean;
  aside?: React.ReactNode;
}) {
  const mostRead = await content.mostRead(5);
  return (
    <section className="surface-paper py-12 lg:py-16">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-14">
        <div className="min-w-0 lg:col-span-8">
          {list.items.length === 0 ? (
            <p className="border border-dashed border-line-strong p-12 text-center text-fg-muted">Nothing published here yet. Check back soon.</p>
          ) : page === 1 ? (
            <LatestFeed
              initial={list.items}
              totalPages={list.totalPages}
              categories={desks ?? []}
              perPage={PER_PAGE}
              query={{ category, kinds: kinds?.join(','), tag, author }}
              showFilters={filters}
              leadPair
            />
          ) : (
            <ul>
              {list.items.map((a) => (
                <li key={a.id} className="border-b border-line py-6">
                  <RowCard article={a} />
                </li>
              ))}
            </ul>
          )}
          <Pagination base={base} page={page} totalPages={list.totalPages} hideWithJs={page === 1} />
        </div>
        <div className="lg:col-span-4">
          <div className="space-y-10 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            {aside}
            <Trending items={mostRead} />
            <AdSlot placement="sidebar-rectangle" category={category} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Every archive query must use this page size so feed pages line up with ?page=N. */
export const PER_PAGE = 12;

export const pageParam = (v: string | string[] | undefined) => Math.min(500, Math.max(1, Number(Array.isArray(v) ? v[0] : v) || 1));
