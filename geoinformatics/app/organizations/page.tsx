import type { Metadata } from 'next';
import Link from 'next/link';
import { content } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/PageHero';
import { Icon } from '@/components/Icon';
import type { Organization } from '@/lib/types';

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: 'Geospatial industry organizations',
  description: 'International federations, standards bodies, professional societies and associations across the geospatial sector.',
  path: '/organizations/',
});

const scopes: Organization['scope'][] = ['Global', 'Europe', 'Americas', 'Asia-Pacific', 'Africa'];

export default async function OrganizationsPage() {
  const orgs = await content.organizations();
  const groups = scopes.map((s) => ({ scope: s, items: orgs.filter((o) => o.scope === s) })).filter((g) => g.items.length);
  return (
    <>
      <PageHero kicker="Directory" title="Organizations" intro="The federations, societies, standards bodies and associations that shape the profession. Listed for reference; GeoInformatics is independent of all of them." crumbs={[{ name: 'Home', path: '/' }, { name: 'Organizations', path: '/organizations/' }]} visual="graticule">
        <nav aria-label="Regions" className="mt-10 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a key={g.scope} href={`#${g.scope.toLowerCase()}`} className="border border-white/20 px-3 py-1.5 text-sm hover:border-white">
              {g.scope} <span className="meta ml-1">{g.items.length}</span>
            </a>
          ))}
        </nav>
      </PageHero>
      <div className="surface-white py-12 lg:py-16">
        <div className="shell space-y-16">
          {groups.map((g) => (
            <section key={g.scope} id={g.scope.toLowerCase()} aria-labelledby={`h-${g.scope}`}>
              <h2 id={`h-${g.scope}`} className="border-b border-line-strong pb-4 font-display text-2xl font-semibold tracking-[-0.03em] uppercase">
                {g.scope}
              </h2>
              <ul className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((o, i) => (
                  <li key={o.id} className="bg-white" data-reveal style={{ ['--reveal-delay' as string]: `${(i % 3) * 60}ms` }}>
                    <a href={o.url} target="_blank" rel="noopener" className="group flex h-full flex-col p-6 transition-colors hover:bg-paper lg:p-8">
                      <span className="flex items-start justify-between gap-4">
                        <span className="font-display text-3xl leading-none font-semibold tracking-[-0.04em] text-red">{o.abbr}</span>
                        <Icon name="arrowUpRight" className="size-5 text-fg-subtle transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                      </span>
                      <span className="mt-5 font-display text-lg leading-tight font-semibold">
                        <span className="headline-link">{o.name}</span>
                        <span className="sr-only"> (external website)</span>
                      </span>
                      <span className="mt-2 text-[0.9375rem] text-fg-muted">{o.description}</span>
                      <span className="mt-auto flex flex-wrap gap-1.5 pt-5">
                        {o.focus.map((f) => (
                          <span key={f} className="kicker border border-line px-2 py-1 text-fg-subtle">
                            {f}
                          </span>
                        ))}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="text-fg-muted">
            Missing an organization or spotted an error?{' '}
            <Link href="/contact/?topic=editorial" className="font-medium text-ink underline underline-offset-2">
              Let our editors know
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}
