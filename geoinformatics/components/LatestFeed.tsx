'use client';

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useRef, useState, useTransition } from 'react';
import type { Article, Category } from '@/lib/types';
import { FeatureCard, RowCard } from './Cards';
import { Icon } from './Icon';

type Props = {
  initial: Article[];
  totalPages: number;
  categories: Category[];
  perPage: number;
  /** Fixed query for every page of this feed (desk, kinds, tag, author). */
  query?: { category?: string; kinds?: string; tag?: string; author?: string };
  exclude?: string[];
  showFilters?: boolean;
  /** Two large cards before the rows: gives the feed an editorial rhythm. */
  leadPair?: boolean;
  /** Newswire mode: a date heading wherever the day changes. */
  dateHeaders?: boolean;
};

// Built by hand: Intl output differs between Node and browsers (comma or not), which breaks hydration.
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayOf = (iso: string) => {
  const d = new Date(iso);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

/**
 * Filterable, paginated news feed. Desk filters swap the list in place with a
 * short crossfade; "Load more" appends the next page. Works as a plain list
 * without JavaScript (the first page is server-rendered and links to /latest).
 */
export function LatestFeed({ initial, totalPages, categories, perPage, query = {}, exclude = [], leadPair = true, showFilters = true, dateHeaders = false }: Props) {
  const [items, setItems] = useState(initial);
  const [desk, setDesk] = useState<string>(query.category ?? '');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(totalPages);
  const [error, setError] = useState(false);
  const [pending, start] = useTransition();
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);

  async function load(nextDesk: string, nextPage: number) {
    const qs = new URLSearchParams({ page: String(nextPage), perPage: String(perPage) });
    if (nextDesk) qs.set('category', nextDesk);
    if (query.kinds) qs.set('kinds', query.kinds);
    if (query.tag) qs.set('tag', query.tag);
    if (query.author) qs.set('author', query.author);
    if (exclude.length) qs.set('exclude', exclude.join(','));
    const res = await fetch(`/api/articles/?${qs}`);
    if (!res.ok) throw new Error('feed');
    return (await res.json()) as { items: Article[]; totalPages: number };
  }

  function choose(slug: string) {
    if (slug === desk) return;
    setDesk(slug);
    setError(false);
    start(async () => {
      try {
        const r = await load(slug, 1);
        setItems(r.items);
        setPages(r.totalPages);
        setPage(1);
      } catch {
        setError(true);
      }
    });
  }

  function more() {
    setError(false);
    start(async () => {
      try {
        const r = await load(desk, page + 1);
        setItems((cur) => [...cur, ...r.items.filter((a) => !cur.some((c) => c.id === a.id))]);
        setPages(r.totalPages);
        setPage((p) => p + 1);
      } catch {
        setError(true);
      }
    });
  }

  const pair = leadPair ? items.slice(0, 2) : [];
  const rows = leadPair ? items.slice(2) : items;

  return (
    <div>
      {showFilters && categories.length > 0 && (
        <div className="relative -mx-4 mb-8 sm:mx-0" role="group" aria-label="Filter by industry">
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 sm:flex-wrap sm:px-0">
            {[{ slug: '', name: 'All', code: 'ALL' }, ...categories].map((c) => {
              const active = desk === c.slug;
              return (
                <button
                  key={c.slug || 'all'}
                  type="button"
                  onClick={() => choose(c.slug)}
                  aria-pressed={active}
                  className={`relative flex-none px-3.5 py-2 text-[0.8125rem] font-medium whitespace-nowrap transition-colors ${active ? 'text-white' : 'text-fg-muted hover:text-fg'}`}
                >
                  {active && <motion.span layoutId="feed-filter" className="absolute inset-0 bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                  {!active && <span className="absolute inset-0 border border-line" />}
                  <span className="relative">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <LayoutGroup>
        <motion.div ref={listRef} aria-busy={pending} animate={{ opacity: pending && page === 1 ? 0.45 : 1 }} transition={{ duration: 0.2 }}>
          <AnimatePresence mode="wait" initial={false}>
            {items.length === 0 && !pending ? (
              <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-dashed border-line-strong p-10 text-center text-fg-muted">
                No stories on this desk yet. Try another industry.
              </motion.p>
            ) : (
              <motion.div key={`list-${desk}`} initial={false} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {pair.length > 0 && (
                  <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="grid gap-8 border-b border-line pb-8 sm:grid-cols-2">
                    {pair.map((a) => (
                      <FeatureCard key={a.id} article={a} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" />
                    ))}
                  </motion.div>
                )}
                <ul>
                  {rows.map((a, i) => [
                    dateHeaders && (i === 0 || dayOf(a.publishedAt) !== dayOf(rows[i - 1]!.publishedAt)) && (
                      <li key={`d-${a.id}`} className="sticky top-[var(--header-total)] z-10 -mx-1 border-b-2 border-ink bg-[var(--surface)] px-1 pt-8 pb-2">
                        <h2 className="font-sans text-[0.8125rem] font-extrabold tracking-[0.04em] uppercase">{dayOf(a.publishedAt)}</h2>
                      </li>
                    ),
                    <motion.li
                      key={a.id}
                      layout={reduce ? false : 'position'}
                      initial={reduce ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: Math.min(i % perPage, 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                      className="border-b border-line py-6"
                    >
                      <RowCard article={a} />
                    </motion.li>,
                  ])}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {error && (
        <p role="alert" className="mt-6 text-sm text-accent">
          Could not load stories. Check your connection and try again.
        </p>
      )}

      {page < pages && (
        <div className="mt-10 flex justify-center">
          <button type="button" onClick={more} disabled={pending} className="group btn btn-outline min-w-52">
            {pending ? 'Loading…' : 'Load more stories'}
            <Icon name="arrow" className="arrow size-4 rotate-90" />
          </button>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {pending ? 'Loading stories' : `${items.length} stories shown`}
      </p>
    </div>
  );
}
