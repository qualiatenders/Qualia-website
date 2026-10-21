import Link from 'next/link';
import type { Article, Category } from '@/lib/types';
import { FeatureCard, HeadlineItem } from '../Cards';
import { Icon } from '../Icon';

/** "From the desks": one block per industry, a lead story plus the latest headlines. */
export function DeskBlocks({ blocks }: { blocks: { desk: Category; items: Article[] }[] }) {
  const shown = blocks.filter((b) => b.items.length >= 2);
  if (!shown.length) return null;
  return (
    <section aria-labelledby="desks-title" className="surface-white py-16 lg:py-24">
      <div className="shell">
        <div className="mb-10 flex items-end justify-between gap-6 border-b-2 border-ink pb-4">
          <h2 id="desks-title" className="font-sans text-[clamp(1.5rem,1.2rem+1vw,2.25rem)] font-extrabold tracking-[-0.01em] uppercase">
            From the desks
          </h2>
          <Link href="/latest/" className="group inline-flex items-center gap-2 text-sm font-bold">
            <span className="nav-link">All news</span> <Icon name="arrow" className="arrow size-4" />
          </Link>
        </div>
        <div className="grid gap-x-12 gap-y-16 md:grid-cols-2">
          {shown.map(({ desk, items }, i) => {
            const [lead, ...rest] = items;
            return (
              <section key={desk.slug} aria-labelledby={`desk-${desk.slug}`} className="min-w-0" data-reveal style={{ ['--reveal-delay' as string]: `${(i % 2) * 90}ms` }}>
                <div className="mb-6 flex items-center justify-between border-t-4 border-red pt-3">
                  <h3 id={`desk-${desk.slug}`} className="font-sans text-lg font-extrabold tracking-[-0.01em] uppercase">
                    <Link href={desk.path} className="hover:text-red">
                      {desk.name}
                    </Link>
                  </h3>
                  <Link href={desk.path} className="text-sm font-semibold text-fg-muted hover:text-fg">
                    More →
                  </Link>
                </div>
                <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
                  {lead && <FeatureCard article={lead} sizes="(min-width: 1024px) 26vw, (min-width: 768px) 45vw, 100vw" />}
                  <div className="divide-y divide-[color:var(--line)] border-t border-line lg:border-t-0">
                    {rest.slice(0, 3).map((a) => (
                      <HeadlineItem key={a.id} article={a} />
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
