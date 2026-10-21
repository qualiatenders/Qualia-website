import Link from 'next/link';
import type { Category } from '@/lib/types';
import { GeoArt } from '../GeoArt';
import { Icon } from '../Icon';

/** Compact desk index: one tap to any industry, with a live story count as the hook. */
export function IndustriesStrip({ desks, counts }: { desks: Category[]; counts: Record<string, number> }) {
  return (
    <section aria-labelledby="industries-title" className="surface-white py-14 lg:py-20">
      <div className="shell">
        <div className="mb-8 flex flex-col gap-4 border-b-2 border-ink pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kicker text-accent">Ten desks</p>
            <h2 id="industries-title" className="mt-2 font-sans text-[clamp(1.6rem,1.2rem+1.4vw,2.5rem)] font-extrabold tracking-[-0.01em] uppercase">
              Follow your industry
            </h2>
          </div>
          <Link href="/industries/" className="group inline-flex items-center gap-2 text-sm font-bold">
            <span className="nav-link">All industries at a glance</span> <Icon name="arrow" className="arrow size-4" />
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-px bg-[var(--line)] sm:grid-cols-3 lg:grid-cols-5">
          {desks.map((c, i) => (
            <li key={c.slug} className="bg-white" data-reveal style={{ ['--reveal-delay' as string]: `${(i % 5) * 50}ms` }}>
              <Link href={c.path} className="group relative flex h-full min-h-36 flex-col justify-between overflow-hidden p-4 sm:p-5">
                <div className="zoom-media absolute inset-0 bg-ink opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true">
                  <GeoArt visual={c.visual} seed={c.slug} className="absolute inset-0 size-full" />
                </div>
                <span className="relative font-sans text-xs font-bold tracking-[0.1em] text-red transition-colors group-hover:text-white">{c.code}</span>
                <span className="relative mt-6 block">
                  <span className="block font-display text-lg leading-tight font-semibold transition-colors group-hover:text-white">{c.name}</span>
                  <span className="mt-1 block text-sm font-semibold transition-colors group-hover:text-white">
                    {counts[c.slug] ? `${counts[c.slug]} ${counts[c.slug] === 1 ? 'story' : 'stories'}` : 'Coming soon'} →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
