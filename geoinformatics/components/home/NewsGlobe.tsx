import Link from 'next/link';
import type { Article } from '@/lib/types';
import { landRings } from '@/lib/geo/land';
import { formatDate } from '@/lib/format';

/**
 * "Where the news is": every recent story with a location on a rotating
 * globe (real Natural Earth coastlines). Drag to turn it, hover a story to
 * fly there, click a pin to read. The story list is the accessible,
 * no-JS version of the same information.
 */
export function NewsGlobe({ articles, variant = 'full' }: { articles: Article[]; variant?: 'full' | 'teaser' | 'mini' }) {
  const located = articles.filter((a) => a.location).slice(0, variant === 'teaser' ? 20 : 40);
  if (located.length < 3) return null;
  const pins = located.map((a) => ({ lat: a.location!.lat, lon: a.location!.lon, name: a.location!.name, title: a.title }));
  const data = JSON.stringify({ land: landRings(), pins }).replace(/</g, '\\u003c');

  if (variant === 'teaser') return <GlobeTeaser located={located} data={data} />;
  if (variant === 'mini') return <GlobeMini located={located} data={data} />;

  return (
    <section aria-labelledby="globe-title" className="relative overflow-hidden bg-ink py-16 text-white lg:py-24">
      <div className="graticule pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="globe-wrap shell relative grid items-center gap-12 lg:grid-cols-12" data-globe>
        <div className="lg:col-span-5">
          <p className="kicker flex items-center gap-3 text-red-ink" data-reveal>
            <span className="rule-red" aria-hidden="true" /> Live news map
          </p>
          <h2 id="globe-title" className="mt-5 font-display text-[clamp(2.2rem,1.3rem+3vw,4.25rem)] leading-[1] font-medium tracking-[-0.02em]" data-reveal>
            Where the news is
          </h2>
          <p className="mt-5 max-w-md text-fog" data-reveal>
            The industry, mapped. Every story pinned to the place it happens. Drag the globe, or hover a headline to fly there.
          </p>
          <ol className="mt-8 max-h-[26rem] divide-y divide-white/10 overflow-y-auto border-y border-white/10 pr-1">
            {located.map((a) => (
              <li key={a.id}>
                <Link href={a.path} data-pin className="group flex items-start gap-3 px-2 py-3 transition-colors">
                  <span className="pin-dot mt-1.5 size-2 flex-none rounded-full bg-red transition-all" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="kicker block text-fog">
                      {a.location!.name} · {formatDate(a.publishedAt)}
                    </span>
                    <span className="mt-1 block font-display text-[1.05rem] leading-snug group-hover:underline">{a.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative lg:col-span-7">
          <div className="relative mx-auto aspect-square w-full max-w-[40rem]">
            <canvas className="size-full" role="img" aria-label="Globe showing the locations of recent stories" />
            <div className="globe-tip" data-globe-tip hidden>
              <p className="kicker text-red" data-tip-place />
              <p className="mt-1 font-display text-[0.95rem] leading-snug font-medium" data-tip-title />
            </div>
          </div>
          <p className="meta mt-4 text-center">Coastlines: Natural Earth · Orthographic projection · WGS 84</p>
        </div>
        <script type="application/json" dangerouslySetInnerHTML={{ __html: data }} />
      </div>
    </section>
  );
}

/** Homepage teaser: a live globe and one clear invitation to open the full news map. */
function GlobeTeaser({ located, data }: { located: Article[]; data: string }) {
  const places = new Set(located.map((a) => a.location!.name)).size;
  return (
    <section aria-labelledby="globe-teaser-title" className="relative overflow-hidden bg-ink text-white">
      <div className="graticule pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="globe-wrap shell relative grid items-center gap-8 py-12 md:grid-cols-2 lg:py-14" data-globe>
        <div className="order-2 md:order-1">
          <p className="kicker flex items-center gap-3 text-red-ink">
            <span className="live-dot" aria-hidden="true" /> Live news map
          </p>
          <h2 id="globe-teaser-title" className="mt-4 font-display text-[clamp(2rem,1.3rem+2.4vw,3.5rem)] leading-[1.02] font-medium tracking-[-0.02em]">
            {located.length} stories. {places} places. <span className="text-red-ink italic">One planet.</span>
          </h2>
          <p className="mt-4 max-w-md">See where the geospatial industry is moving this month, from Southwest Amazonia to Munich. Spin the globe, then dive into any story.</p>
          <Link href="/news-map/" className="group btn btn-red mt-7 min-h-13 px-7 text-base">
            Open the news map <span className="arrow" aria-hidden="true">→</span>
          </Link>
          <ul className="sr-only">
            {located.map((a) => (
              <li key={a.id}>
                <Link href={a.path} data-pin>
                  {a.location!.name}: {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative order-1 md:order-2">
          <div className="relative mx-auto aspect-square w-full max-w-[22rem] lg:max-w-[26rem]">
            <canvas className="size-full" role="img" aria-label="Globe showing where recent stories happen" />
            <div className="globe-tip" data-globe-tip hidden>
              <p className="kicker text-red" data-tip-place />
              <p className="mt-1 font-display text-[0.95rem] leading-snug font-medium" data-tip-title />
            </div>
          </div>
        </div>
        <script type="application/json" dangerouslySetInnerHTML={{ __html: data }} />
      </div>
    </section>
  );
}

/** Front-page module: a small live globe; the pins are the story links. */
function GlobeMini({ located, data }: { located: Article[]; data: string }) {
  return (
    <div className="globe-wrap relative" data-globe>
      <div className="relative mx-auto aspect-square w-full max-w-[17rem]">
        <canvas className="size-full" role="img" aria-label="Globe showing where recent stories happen" />
        <div className="globe-tip" data-globe-tip hidden>
          <p className="kicker text-red" data-tip-place />
          <p className="mt-1 font-display text-[0.95rem] leading-snug font-medium" data-tip-title />
        </div>
      </div>
      <ul className="sr-only">
        {located.map((a) => (
          <li key={a.id}>
            <Link href={a.path} data-pin>
              {a.location!.name}: {a.title}
            </Link>
          </li>
        ))}
      </ul>
      <script type="application/json" dangerouslySetInnerHTML={{ __html: data }} />
    </div>
  );
}
