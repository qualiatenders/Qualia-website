import Link from 'next/link';
import type { Article } from '@/lib/types';
import { FeatureCard, CompactCard } from '../Cards';
import { Trending } from '../Trending';
import { SectionHeading } from '../SectionHeading';
import { AdSlot } from '../ads/AdSlot';
import { Icon } from '../Icon';

/**
 * Homepage "Latest": a short, varied selection that makes people want the
 * rest — two lead cards, four compact stories, and one clear way through to
 * the full newswire. Most read + a rectangle ad sit alongside.
 */
export function LatestTeaser({ items, total, mostRead }: { items: Article[]; total: number; mostRead: Article[] }) {
  const [a, b, ...rest] = items;
  return (
    <section aria-labelledby="latest-title" className="surface-paper py-14 lg:py-20">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-14">
        <div className="min-w-0 lg:col-span-8">
          <SectionHeading index="01" id="latest-title" title="Latest news" href="/latest/" linkLabel={`All ${total} stories`} />
          <div className="grid gap-8 sm:grid-cols-2">
            {[a, b].filter(Boolean).map((x) => (
              <div key={x!.id} data-reveal>
                <FeatureCard article={x!} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" />
              </div>
            ))}
          </div>
          <ul className="mt-10 grid gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-2">
            {rest.slice(0, 4).map((x, i) => (
              <li key={x.id} className={i >= 2 ? 'max-sm:hidden' : ''} data-reveal style={{ ['--reveal-delay' as string]: `${i * 60}ms` }}>
                <CompactCard article={x} />
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col items-start gap-5 border-t-2 border-ink pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-xl leading-snug">
              <span className="font-semibold">{Math.max(0, total - 6)} more stories</span> on the newswire, across ten industries.
            </p>
            <Link href="/latest/" className="group btn btn-dark min-h-13 flex-none px-6">
              Read all latest news <Icon name="arrow" className="arrow size-4" />
            </Link>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="space-y-10 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <Trending items={mostRead} />
            <AdSlot placement="sidebar-rectangle" />
          </div>
        </div>
      </div>
    </section>
  );
}
