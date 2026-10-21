import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { placements, otherFormats, targetingOptions } from '@/lib/ads/placements';
import { audienceStats, creativeSpecs, rateCard } from '@/lib/ads/commercial';
import { site } from '@/lib/site';
import { PlacementExplorer } from '@/components/advertise/PlacementExplorer';
import { AdvertiseForm } from '@/components/forms/AdvertiseForm';
import { SectionHeading } from '@/components/SectionHeading';
import { GeoArt } from '@/components/GeoArt';
import { Magnetic } from '@/components/Motion';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = pageMetadata({
  title: 'Advertise with GeoInformatics',
  description: 'Display, sponsored content, newsletter and event partnerships alongside independent geospatial journalism. Request a proposal or download the media kit.',
  path: '/advertise/',
});

const audience = [
  { title: 'Surveyors & engineers', body: 'Land, construction and infrastructure professionals who specify and use measurement technology every day.' },
  { title: 'GIS & data teams', body: 'Analysts, developers and managers building spatial data infrastructure in government and industry.' },
  { title: 'Researchers & EO specialists', body: 'Remote sensing scientists, academics and the downstream Earth observation sector.' },
  { title: 'Decision-makers', body: 'Directors, procurement leads and founders who set budgets and choose platforms and partners.' },
];

export default function AdvertisePage() {
  const stats = audienceStats();
  const rates = rateCard();
  const interests = [...placements.map((p) => ({ id: p.id, label: p.name })), ...otherFormats.map((f) => ({ id: f.title, label: f.title }))];

  return (
    <>
      <section className="relative overflow-hidden bg-ink pt-14 pb-16 lg:pt-24 lg:pb-28">
        <div aria-hidden="true" className="absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]">
          <GeoArt visual="orbit" seed="advertise" className="size-full" />
        </div>
        <div className="shell relative">
          <p className="kicker flex items-center gap-3 text-red-ink" data-reveal>
            <span className="rule-red" aria-hidden="true" /> Advertising &amp; partnerships
          </p>
          <h1 className="mt-6 max-w-6xl font-display text-[clamp(2.5rem,1rem+5.4vw,6.5rem)] leading-[1] font-medium tracking-[-0.02em]" data-reveal style={{ ['--reveal-delay' as string]: '80ms' }}>
            Put your brand at the center of geospatial innovation.
          </h1>
          <p className="mt-8 max-w-2xl text-lead leading-relaxed text-fog" data-reveal style={{ ['--reveal-delay' as string]: '160ms' }}>
            GeoInformatics connects technology companies with the professionals who survey, map, model and monitor the planet — through placements that respect the reader and the journalism around them.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row" data-reveal style={{ ['--reveal-delay' as string]: '240ms' }}>
            <Magnetic>
              <a href="#enquire" className="group btn btn-red min-h-14 px-8 text-base">
                Request a proposal <Icon name="arrow" className="arrow size-4" />
              </a>
            </Magnetic>
            <a href="/media-kit.pdf" className="btn btn-outline min-h-14 border-white/30 px-8 text-base">
              <Icon name="download" className="size-4" /> Media kit (PDF)
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="audience-title" className="surface-white py-16 lg:py-24">
        <div className="shell">
          <SectionHeading index="01" id="audience-title" title="Who you reach" />
          <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
            {audience.map((a, i) => (
              <div key={a.title} className="bg-white p-6 lg:p-8" data-reveal style={{ ['--reveal-delay' as string]: `${i * 70}ms` }}>
                <p className="meta text-accent">0{i + 1}</p>
                <h3 className="mt-4 font-display text-xl font-semibold">{a.title}</h3>
                <p className="mt-2 text-fg-muted">{a.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            {stats.length ? (
              <dl className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="bg-paper p-6">
                    <dt className="kicker text-fg-subtle">{s.label}</dt>
                    <dd className="mt-3 font-display text-4xl font-semibold tracking-[-0.02em]">{s.value}</dd>
                    <dd className="meta mt-2">Source: {s.source}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="flex flex-col gap-2 border border-dashed border-line-strong p-6 text-fg-muted sm:flex-row sm:items-center sm:justify-between">
                <span>Verified audience and traffic figures are shared on request, with their source and measurement period.</span>
                <a href="#enquire" className="font-semibold whitespace-nowrap text-ink underline underline-offset-4">
                  Ask for the latest figures
                </a>
              </p>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="placements-title" className="surface-paper py-16 lg:py-24">
        <div className="shell">
          <SectionHeading index="02" id="placements-title" title="Display placements" intro="Every slot is designed into the layout, with its space reserved — your creative never pushes content around, and readers never lose their place." />
          <PlacementExplorer />
        </div>
      </section>

      <section aria-labelledby="specs-title" className="surface-white py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading index="03" id="specs-title" title="Formats & rates" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-[0.9375rem]">
                <thead>
                  <tr className="border-b border-line-strong">
                    {['Placement', 'Desktop', 'Mobile', 'Rate'].map((h) => (
                      <th key={h} scope="col" className="kicker py-3 pr-4 font-medium text-fg-subtle">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {placements.map((p) => (
                    <tr key={p.id} className="border-b border-line">
                      <th scope="row" className="py-4 pr-4 font-medium">
                        {p.name}
                        {'premium' in p && p.premium && <span className="kicker ml-2 text-accent">Premium</span>}
                      </th>
                      <td className="meta py-4 pr-4 text-fg">{p.desktop.w}×{p.desktop.h}</td>
                      <td className="meta py-4 pr-4 text-fg">{'mobile' in p && p.mobile ? `${p.mobile.w}×${p.mobile.h}` : '—'}</td>
                      <td className="py-4 text-fg-muted">{rates[p.id] ?? 'On request'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="surface-dark p-6 sm:p-8 lg:mt-24">
              <p className="kicker text-red-ink">Creative specifications</p>
              <ul className="mt-5 space-y-3">
                {creativeSpecs.map((s) => (
                  <li key={s} className="flex gap-3 text-[0.9375rem] text-fog">
                    <Icon name="check" className="mt-0.5 size-4 flex-none text-red-ink" />
                    {s}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-white/15 pt-5 text-sm text-fog">Campaign reporting includes impressions, viewable impressions (IAB/MRC standard), clicks, CTR and device split — measured on our own platform, exportable at any time.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="formats" aria-labelledby="formats-title" className="surface-paper py-16 lg:py-24">
        <div className="shell">
          <SectionHeading index="04" id="formats-title" title="Beyond display" />
          <div className="grid gap-px bg-[var(--line)] md:grid-cols-2">
            {otherFormats.map((f, i) => (
              <div key={f.title} className="group bg-paper p-8 transition-colors hover:bg-white lg:p-10" data-reveal style={{ ['--reveal-delay' as string]: `${i * 70}ms` }}>
                <h3 className="font-display text-2xl font-semibold tracking-[-0.015em]">{f.title}</h3>
                <p className="mt-3 max-w-lg text-fg-muted">{f.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 grid gap-10 lg:grid-cols-12">
            <h3 className="font-sans text-2xl font-extrabold tracking-[-0.01em] uppercase lg:col-span-4">Targeting</h3>
            <dl className="grid gap-8 sm:grid-cols-2 lg:col-span-8">
              {targetingOptions.map((t) => (
                <div key={t.title} className="border-t-2 border-ink pt-4">
                  <dt className="font-semibold">{t.title}</dt>
                  <dd className="mt-1 text-fg-muted">{t.body}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-16 max-w-3xl border-l-2 border-red pl-5 text-fg-muted">
            <strong className="text-ink">Editorial independence.</strong> Advertisers never influence our news coverage. Sponsored content is always labelled and kept separate from journalism.{' '}
            <Link href="/legal/advertising-disclosure/" className="underline underline-offset-2">
              Read our advertising policy
            </Link>
            .
          </p>
        </div>
      </section>

      <section id="enquire" aria-labelledby="enquire-title" className="surface-white scroll-mt-24 py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="kicker text-accent">Start a conversation</p>
            <h2 id="enquire-title" className="mt-4 font-display text-[clamp(2rem,1.3rem+2vw,3.25rem)] leading-[1] font-medium tracking-[-0.02em]">
              Request a proposal
            </h2>
            <p className="mt-5 text-fg-muted">Tell us what you want to achieve. We reply with availability, recommendations and a quote.</p>
            {site.email.advertising && (
              <p className="mt-6">
                <a href={`mailto:${site.email.advertising}`} className="font-semibold underline underline-offset-4">
                  {site.email.advertising}
                </a>
              </p>
            )}
            <a href="/media-kit.pdf" className="group mt-8 inline-flex items-center gap-3 border border-line-strong px-5 py-4 transition-colors hover:border-ink">
              <Icon name="download" />
              <span>
                <span className="block font-semibold">Media kit</span>
                <span className="meta">PDF · always up to date</span>
              </span>
            </a>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <AdvertiseForm interests={interests} />
          </div>
        </div>
      </section>
    </>
  );
}
