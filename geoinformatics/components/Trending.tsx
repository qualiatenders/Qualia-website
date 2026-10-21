import Link from 'next/link';
import type { Article } from '@/lib/types';
import { pad2 } from '@/lib/format';

/**
 * Most read, 01–05. Order comes from the platform: measured page views over
 * the last seven days, with any editor-pinned positions taking precedence.
 */
export function Trending({ items, title = 'Most read', note = 'Last 7 days', tone = 'dark' }: { items: Article[]; title?: string; note?: string; tone?: 'dark' | 'light' }) {
  if (!items.length) return null;
  const dark = tone === 'dark';
  return (
    <section aria-labelledby="trending-title" className={`${dark ? 'surface-anthracite graticule' : ''} relative p-6 sm:p-8`}>
      <div className="flex items-baseline justify-between border-b border-line-strong pb-4">
        <h2 id="trending-title" className="font-display text-2xl font-semibold tracking-[-0.03em] uppercase">
          {title}
        </h2>
        <span className="meta">{note}</span>
      </div>
      <ol>
        {items.map((a, i) => (
          <li key={a.id} className="group relative grid grid-cols-[3.75rem_1fr] items-start gap-3 border-b border-line py-5 last:border-b-0 last:pb-0" data-reveal style={{ ['--reveal-delay' as string]: `${i * 70}ms` }}>
            <span aria-hidden="true" className={`font-display text-[3.25rem] leading-[0.8] font-semibold tracking-[-0.06em] tabular transition-colors duration-500 ${i === 0 ? 'text-red' : 'text-[color:var(--line-strong)] group-hover:text-red'}`}>
              {pad2(i + 1)}
            </span>
            <div className="min-w-0">
              <p className="kicker text-accent">{a.category.name}</p>
              <h3 className="mt-1.5 font-display text-[1.075rem] leading-snug font-medium">
                <Link href={a.path} className="headline-link after:absolute after:inset-0 after:content-['']">
                  <span className="sr-only">Number {i + 1}: </span>
                  {a.title}
                </Link>
              </h3>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
