import Link from 'next/link';
import type { Article } from '@/lib/types';
import { kindLabel } from '@/lib/taxonomy';
import { ArticleMedia } from '../ArticleMedia';
import { Parallax } from '../Motion';
import { Icon } from '../Icon';
import { GeoArt } from '../GeoArt';
import Image from 'next/image';

/**
 * Geospatial Intelligence: the long-read layer. Darker, slower, larger
 * imagery — it should feel like turning to the magazine section.
 */
export function Intelligence({ items, compact = false }: { items: Article[]; compact?: boolean }) {
  const [main, ...rest] = items;
  if (!main) return null;
  return (
    <section aria-labelledby="intel-title" className={`relative overflow-hidden bg-ink text-white ${compact ? 'py-14 lg:py-20' : 'py-16 lg:py-28'}`}>
      <div className="graticule pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="shell relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div data-reveal>
            <p className="kicker flex items-center gap-3 text-red-ink">
              <span className="rule-red" aria-hidden="true" /> Analysis · Interviews · Long reads
            </p>
            <h2 id="intel-title" className={`mt-5 font-display leading-[0.92] font-semibold tracking-[-0.02em] ${compact ? 'text-[clamp(2.2rem,1.3rem+3vw,4.25rem)]' : 'text-mega'}`}>
              Geospatial
              <br />
              <span className="text-red-ink italic">Intelligence</span>
            </h2>
          </div>
          <div className="max-w-sm" data-reveal style={{ ['--reveal-delay' as string]: '120ms' }}>
            <p className="text-fog">Context the press release leaves out. Our analysts and editors on the technology, markets and people moving the industry.</p>
            <Link href="/analysis/" className="group btn btn-light mt-6">
              Explore all analysis <Icon name="arrow" className="arrow size-4" />
            </Link>
          </div>
        </div>

        <article className={`group relative grid gap-8 lg:grid-cols-12 lg:gap-12 ${compact ? 'mt-10 lg:mt-12' : 'mt-14 lg:mt-20'}`} data-reveal>
          <Parallax className="aspect-[4/3] lg:col-span-7 lg:aspect-[16/11]" amount={6} geoCursor={main.location ? `${main.location.lat},${main.location.lon}` : undefined}>
            {main.image ? (
              <Image src={main.image.src} alt={main.image.alt} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
            ) : (
              <GeoArt visual={main.category.visual} seed={main.slug} className="size-full" />
            )}
          </Parallax>
          <div className="flex flex-col justify-end lg:col-span-5 lg:pb-4">
            <p className="kicker text-red-ink">
              {kindLabel[main.kind]} · {main.category.name}
            </p>
            <h3 className="mt-4 font-display text-[clamp(1.9rem,1.2rem+2.2vw,3.25rem)] leading-[1.02] font-semibold tracking-[-0.015em]">
              <Link href={main.path} className="headline-link after:absolute after:inset-0 after:content-['']">
                {main.title}
              </Link>
            </h3>
            <p className="mt-5 text-lg leading-relaxed text-fog">{main.excerpt}</p>
            <p className="meta mt-6">
              {main.author.name} · {main.readingMinutes} min read
            </p>
          </div>
        </article>

        {rest.length > 0 && (
          <div className={`grid gap-10 border-t border-white/15 pt-10 ${compact ? 'mt-12 md:grid-cols-2' : 'mt-16 md:grid-cols-3 lg:mt-20'}`}>
            {rest.slice(0, compact ? 2 : 3).map((a, i) => (
              <article key={a.id} className={`group relative ${compact && i > 0 ? 'max-md:hidden' : ''}`} data-reveal style={{ ['--reveal-delay' as string]: `${i * 90}ms` }}>
                <ArticleMedia article={a} sizes="(min-width: 768px) 30vw, 100vw" className="aspect-[3/2]" />
                <p className="kicker mt-5 text-red-ink">{kindLabel[a.kind]}</p>
                <h3 className="mt-2 font-display text-xl leading-tight font-semibold tracking-[-0.02em]">
                  <Link href={a.path} className="headline-link after:absolute after:inset-0 after:content-['']">
                    {a.title}
                  </Link>
                </h3>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
