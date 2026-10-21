import Link from 'next/link';

/** Plain numbered pagination: crawlable archive pages behind the "Load more" feed. */
export function Pagination({ base, page, totalPages, query = '', hideWithJs = false }: { base: string; page: number; totalPages: number; query?: string; hideWithJs?: boolean }) {
  if (totalPages <= 1) return null;
  const href = (n: number) => `${base}${n > 1 ? `?page=${n}` : ''}${query ? `${n > 1 ? '&' : '?'}${query}` : ''}`;
  const nums = Array.from({ length: totalPages }, (_, i) => i + 1).filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2);
  return (
    <nav aria-label="Pagination" className={`mt-12 flex flex-wrap items-center gap-2 ${hideWithJs ? 'crawl-pagination' : ''}`}>
      {page > 1 && (
        <Link href={href(page - 1)} rel="prev" className="btn btn-outline">
          ← Newer
        </Link>
      )}
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - nums[i - 1]! > 1 && <span className="text-fg-subtle">…</span>}
          <Link href={href(n)} aria-current={n === page ? 'page' : undefined} className={`grid size-11 place-items-center border text-sm font-medium ${n === page ? 'border-ink bg-ink text-white' : 'border-line-strong hover:border-[color:var(--fg)]'}`}>
            {n}
          </Link>
        </span>
      ))}
      {page < totalPages && (
        <Link href={href(page + 1)} rel="next" className="btn btn-outline">
          Older →
        </Link>
      )}
    </nav>
  );
}
