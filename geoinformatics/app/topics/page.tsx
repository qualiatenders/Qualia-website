import type { Metadata } from 'next';
import Link from 'next/link';
import { topics } from '@/lib/briefings';
import { content } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';

export const revalidate = 600;

export const metadata: Metadata = pageMetadata({
  title: 'Topics A–Z',
  description: 'Every company, technology and theme in GeoInformatics coverage, from airborne LiDAR to Trimble, in one index.',
  path: '/topics/',
});

/** A–Z index of every tag in recent coverage: the fastest way to a company or technology. */
export default async function TopicsPage() {
  const [all, desks] = await Promise.all([topics(), content.categories()]);
  const groups = new Map<string, typeof all>();
  for (const t of all) {
    const ch = t.name[0]!.toUpperCase();
    const key = /[A-Z]/.test(ch) ? ch : '#';
    groups.set(key, [...(groups.get(key) ?? []), t]);
  }
  const letters = [...groups.keys()].sort((a, b) => (a === '#' ? -1 : b === '#' ? 1 : a.localeCompare(b)));
  return (
    <>
      <PageHero kicker="Index" title="Topics A–Z" intro="Every company, technology and theme in our coverage. Pick one to see all its stories." crumbs={[{ name: 'Home', path: '/' }, { name: 'Topics A–Z', path: '/topics/' }]} visual="tiles" />
      <section className="surface-white py-12 lg:py-16">
        <div className="shell">
          <nav aria-label="Jump to letter" className="sticky top-[var(--header-total)] z-10 -mx-4 flex gap-1 overflow-x-auto border-b border-line bg-[var(--surface)] px-4 py-3 no-scrollbar sm:mx-0 sm:px-0">
            {letters.map((l) => (
              <a key={l} href={`#letter-${l === '#' ? 'num' : l}`} className="grid size-9 flex-none place-items-center text-sm font-bold hover:bg-ink hover:text-white">
                {l}
              </a>
            ))}
          </nav>
          <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {letters.map((l) => (
              <section key={l} id={`letter-${l === '#' ? 'num' : l}`} aria-labelledby={`h-${l === '#' ? 'num' : l}`} className="scroll-mt-[calc(var(--header-total)+4rem)]">
                <h2 id={`h-${l === '#' ? 'num' : l}`} className="border-t-4 border-red pt-2 font-display text-3xl font-semibold">
                  {l}
                </h2>
                <ul className="mt-3 divide-y divide-[color:var(--line)]">
                  {groups.get(l)!.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/tag/${t.slug}/`} className="flex items-baseline justify-between gap-3 py-2 hover:underline">
                        <span>{t.name}</span>
                        <span className="text-sm font-bold tabular-nums">{t.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <div className="mt-16 border-t border-line pt-8">
            <h2 className="font-sans text-[1.05rem] font-extrabold uppercase">Industries</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {desks.map((d) => (
                <li key={d.slug}>
                  <Link href={d.path} className="inline-block border border-line-strong px-3.5 py-2 text-sm font-semibold hover:bg-ink hover:text-white">
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
