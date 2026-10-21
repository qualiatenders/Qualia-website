import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { categories } from '@/lib/taxonomy';
import { PageHero } from '@/components/PageHero';
import { Logo } from '@/components/Logo';

export const metadata: Metadata = pageMetadata({
  title: 'About GeoInformatics',
  description: 'GeoInformatics is an independent, international news platform for the geospatial industry: surveying, GIS, Earth observation, LiDAR, digital twins, hydrography, GNSS and GeoAI.',
  path: '/about/',
});

const principles = [
  { t: 'Independent', b: 'Our editors decide what we cover. Advertisers and partners never influence news coverage, and sponsored content is always labelled.' },
  { t: 'International', b: 'The geospatial industry is global. We report for professionals on every continent, in English, with the context that crosses borders.' },
  { t: 'Technically literate', b: 'We write for people who know the difference between accuracy and precision — clearly, without dumbing down.' },
  { t: 'Transparent', b: 'We cite sources, link to originals, date every update and correct mistakes openly.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero kicker="About" title="This is where the geospatial industry happens." intro="GeoInformatics is the international news and intelligence platform for the people who measure, map, model and monitor the world." crumbs={[{ name: 'Home', path: '/' }, { name: 'About', path: '/about/' }]} visual="graticule" />
      <section className="surface-white py-16 lg:py-24">
        <div className="shell grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo className="mb-10 scale-125 origin-left" />
            <h2 className="font-sans text-3xl leading-tight font-extrabold tracking-[-0.01em] uppercase">Our mission</h2>
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-fg-muted lg:col-span-7">
            <p>Geospatial technology now underpins construction, energy, agriculture, defence, insurance, climate science and the cities we live in. Yet the industry’s news is scattered across press releases, vendor blogs and specialist journals.</p>
            <p>GeoInformatics brings it together — and adds what is usually missing: independent judgement about what matters, why, and for whom. We publish breaking news, in-depth analysis, interviews and a curated industry calendar, and we deliver the best of it every week in our newsletter.</p>
          </div>
        </div>
      </section>
      <section className="surface-paper py-16 lg:py-24">
        <div className="shell">
          <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p, i) => (
              <div key={p.t} className="bg-paper p-8" data-reveal style={{ ['--reveal-delay' as string]: `${i * 70}ms` }}>
                <p className="meta text-accent">0{i + 1}</p>
                <h3 className="mt-4 font-display text-2xl font-semibold">{p.t}</h3>
                <p className="mt-3 text-fg-muted">{p.b}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 grid gap-10 lg:grid-cols-12">
            <h2 className="font-sans text-3xl font-extrabold tracking-[-0.01em] uppercase lg:col-span-4">What we cover</h2>
            <ul className="grid gap-x-8 sm:grid-cols-2 lg:col-span-8">
              {categories.map((c) => (
                <li key={c.slug} className="border-b border-line">
                  <Link href={c.path} className="group flex items-baseline gap-4 py-4">
                    <span className="meta w-10 text-accent">{c.code}</span>
                    <span className="font-medium">
                      <span className="headline-link">{c.name}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-16 flex flex-wrap gap-3">
            <Link href="/legal/editorial-standards/" className="btn btn-dark">
              Editorial standards
            </Link>
            <Link href="/contact/" className="btn btn-outline">
              Contact the newsroom
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
