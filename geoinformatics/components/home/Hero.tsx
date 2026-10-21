import Link from 'next/link';
import type { Article, Category } from '@/lib/types';
import { LeadCard, FeatureCard, HeadlineItem } from '../Cards';

/**
 * Editorial hero: one lead story, two secondary features and a running
 * "latest" column. Built to get people reading, not to fill a viewport.
 */
export function Hero({ lead, secondary, headlines, desks }: { lead: Article; secondary: Article[]; headlines: Article[]; desks: Category[] }) {
  return (
    <section aria-labelledby="top-stories" className="relative bg-ink pt-6 pb-12 lg:pt-10 lg:pb-16">
      <h2 id="top-stories" className="sr-only">
        Top stories
      </h2>
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-10">
        <div className="lg:col-span-7 xl:col-span-6" data-reveal>
          <LeadCard article={lead} />
        </div>
        <div className="grid content-start gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:gap-10 xl:col-span-3 lg:border-l lg:border-white/10 lg:pl-8 xl:pl-10">
          {secondary.map((a, i) => (
            <div key={a.id} data-reveal style={{ ['--reveal-delay' as string]: `${100 + i * 90}ms` }}>
              <FeatureCard article={a} sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 36vw, (min-width: 640px) 50vw, 100vw" />
            </div>
          ))}
        </div>
        <aside aria-labelledby="just-in" className="lg:col-span-12 xl:col-span-3 xl:border-l xl:border-white/10 xl:pl-10" data-reveal style={{ ['--reveal-delay' as string]: '260ms' }}>
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <h2 id="just-in" className="kicker flex items-center gap-2 text-white">
              <span className="live-dot" aria-hidden="true" /> Just in
            </h2>
            <Link href="/latest/" className="meta hover:text-white">
              All news →
            </Link>
          </div>
          <div className="grid divide-y divide-white/10 sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0 xl:grid-cols-1 xl:divide-y">
            {headlines.map((a) => (
              <div key={a.id} className="sm:border-b sm:border-white/10 xl:border-b-0">
                <HeadlineItem article={a} />
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Desk strip: prominent, scrollable on mobile */}
      <nav aria-label="Industries" className="shell mt-12 lg:mt-14">
        <ul className="no-scrollbar -mx-4 flex overflow-x-auto border-y border-white/10 px-4 sm:mx-0 sm:px-0">
          {desks.map((c) => (
            <li key={c.slug} className="flex-none border-r border-white/10 first:border-l">
              <Link href={c.path} className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-white/[0.04] lg:px-5">
                <span className="meta text-red-ink">{c.code}</span>
                <span className="text-sm font-medium whitespace-nowrap text-white/85 group-hover:text-white">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
