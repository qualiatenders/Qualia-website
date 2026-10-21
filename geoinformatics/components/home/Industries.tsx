import Link from 'next/link';
import type { Article, Category } from '@/lib/types';
import { GeoArt } from '../GeoArt';
import { SectionHeading } from '../SectionHeading';

/**
 * Explore by industry. Each desk carries its own generated visual and mono
 * code — a distinct identity inside one consistent system.
 */
export function Industries({ desks, latest }: { desks: Category[]; latest: Record<string, Article | undefined> }) {
  return (
    <section aria-labelledby="industries-title" className="surface-white py-16 lg:py-24">
      <div className="shell">
        <SectionHeading index="04" id="industries-title" title="Explore by industry" intro="Ten desks covering the full geospatial value chain, from the sensor to the boardroom." />
        <ul className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-5">
          {desks.map((c, i) => {
            const a = latest[c.slug];
            return (
              <li key={c.slug} className="bg-white" data-reveal style={{ ['--reveal-delay' as string]: `${(i % 5) * 60}ms` }}>
                <Link href={c.path} className="group flex h-full flex-col">
                  <div className="zoom-media relative aspect-[16/10] bg-ink">
                    <GeoArt visual={c.visual} seed={c.slug} className="absolute inset-0 size-full opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
                    <span className="absolute top-3 left-3 bg-ink/80 px-2 py-1 font-mono text-[0.6875rem] tracking-[0.14em] text-white backdrop-blur">{c.code}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg leading-tight font-semibold tracking-[-0.02em]">
                      <span className="headline-link">{c.name}</span>
                    </h3>
                    <p className="mt-2 mb-4 line-clamp-2 text-sm text-fg-muted">{c.description}</p>
                    {a && (
                      <p className="mt-auto border-t border-line pt-3 text-[0.8125rem] leading-snug text-fg">
                        <span className="kicker mb-1 block text-fg-subtle">Latest</span>
                        <span className="line-clamp-2">{a.title}</span>
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
