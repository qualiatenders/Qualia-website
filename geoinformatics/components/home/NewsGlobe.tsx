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
export function NewsGlobe({ articles }: { articles: Article[] }) {
  const located = articles.filter((a) => a.location).slice(0, 14);
  if (located.length < 3) return null;
  const pins = located.map((a) => ({ lat: a.location!.lat, lon: a.location!.lon, name: a.location!.name, title: a.title }));
  const data = JSON.stringify({ land: landRings(), pins }).replace(/</g, '\\u003c');

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
