import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/PageHero';
import { CtaBand } from '@/components/CtaBand';
import { ButtonLink, ArrowLink } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Faq } from '@/components/Faq';
import { JsonLd } from '@/components/JsonLd';
import { services, getService } from '@/lib/content/nl/services';
import { materials } from '@/lib/content/nl/materials';
import { href, serviceHref, quoteHref } from '@/lib/i18n/routes';
import { buildMetadata, serviceJsonLd } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getService((await params).slug);
  if (!s) return {};
  return buildMetadata({ title: s.seo.title, description: s.seo.description, path: serviceHref(s.slug) });
}

export default async function ServicePage({ params }: Props) {
  const s = getService((await params).slug);
  if (!s) notFound();
  const related = s.related.map(getService).filter(Boolean) as typeof services;
  const mats = materials.filter((m) => m.techniques[s.technique]);

  return (
    <>
      <PageHero
        crumbs={[{ name: 'Home', path: '/' }, { name: 'Productietechnieken', path: href('services') }, { name: s.name, path: serviceHref(s.slug) }]}
        eyebrow={<><span className="text-red">{s.index}</span>&nbsp;/ {s.label}</>}
        title={s.name}
        lead={s.intro}
        image={s.image}
        actions={
          <>
            <ButtonLink href={quoteHref(s.slug)} size="lg" icon="upload">Upload je tekening</ButtonLink>
            <ButtonLink href="#specificaties" size="lg" variant="secondary" icon="chevron-down">Specificaties</ButtonLink>
          </>
        }
      >
        <ul className="mt-10 space-y-2.5 border-t border-line pt-8" data-reveal>
          {s.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-mist">
              <Icon name="check" size={20} strokeWidth={2} className="mt-0.5 shrink-0 text-red" />
              {h}
            </li>
          ))}
        </ul>
      </PageHero>

      {/* mogelijkheden */}
      <section className="py-20 md:py-28" aria-labelledby="cap-title">
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4" data-reveal>
              <p className="eyebrow">Mogelijkheden</p>
              <h2 id="cap-title" className="mt-5 text-[length:var(--text-h2)] text-offwhite">{s.tagline}</h2>
            </div>
            <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:col-span-8">
              {s.capabilities.map((c, i) => (
                <div key={c.title} className="bg-black p-7 md:p-8" data-reveal style={{ '--reveal-delay': i * 80 } as React.CSSProperties}>
                  <span className="font-mono text-xs text-red">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-4 text-xl font-black text-offwhite">{c.title}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-mist">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* specificaties + aanlevering */}
      <section id="specificaties" className="border-t border-line bg-charcoal/40 py-20 md:py-28" aria-labelledby="spec-title">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7" data-reveal>
            <p className="eyebrow">Technisch overzicht</p>
            <h2 id="spec-title" className="mt-5 text-[length:var(--text-h2)] text-offwhite">Specificaties</h2>
            <dl className="mt-10 border-t border-line">
              {s.specs.map((sp) => (
                <div key={sp.label} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                  <dt className="label-caps pt-0.5 text-muted">{sp.label}</dt>
                  <dd className="text-offwhite">{sp.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 flex gap-3 text-[0.875rem] text-muted">
              <Icon name="info" size={18} className="mt-0.5 shrink-0 text-red" />
              Specifieke kwaliteiten, toleranties en bewerkingsmogelijkheden bevestigen we altijd per aanvraag. We doen geen toezeggingen die we niet kunnen onderbouwen.
            </p>
          </div>
          <aside className="lg:col-span-5" data-reveal style={{ '--reveal-delay': 120 } as React.CSSProperties}>
            <div className="rounded-md border border-line bg-black p-7 md:p-9">
              <Icon name="drawing" size={32} strokeWidth={1.4} className="text-red" />
              <h2 className="mt-6 text-2xl font-black text-offwhite">Wat we van je nodig hebben</h2>
              <ul className="mt-6 space-y-3">
                {s.deliverables.map((d) => (
                  <li key={d} className="flex gap-3 text-[0.9375rem] text-mist">
                    <span className="mt-[0.6rem] h-0.5 w-3 shrink-0 bg-red" aria-hidden="true" />
                    {d}
                  </li>
                ))}
              </ul>
              <ButtonLink href={quoteHref(s.slug)} icon="upload" className="mt-8 w-full">Aanvraag starten</ButtonLink>
            </div>
          </aside>
        </div>
      </section>

      {/* toepassingen + materialen */}
      <section className="border-t border-line py-20 md:py-28" aria-labelledby="app-title">
        <div className="container-x grid gap-14 lg:grid-cols-2">
          <div data-reveal>
            <p className="eyebrow">Toepassingen</p>
            <h2 id="app-title" className="mt-5 text-[length:var(--text-h3)] text-offwhite">Waar het voor wordt ingezet</h2>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {s.applications.map((a) => (
                <li key={a} className="rounded-full border border-line-strong px-4 py-2 text-[0.9375rem] text-mist">{a}</li>
              ))}
            </ul>
          </div>
          <div data-reveal style={{ '--reveal-delay': 100 } as React.CSSProperties}>
            <p className="eyebrow">Materialen</p>
            <h2 className="mt-5 text-[length:var(--text-h3)] text-offwhite">Veelgebruikte materialen</h2>
            <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
              {mats.map((m) => (
                <li key={m.id} className="bg-black">
                  <Link href={`${href('materials')}#${m.id}`} className="group flex h-full flex-col p-4 transition-colors hover:bg-graphite">
                    <span className="text-2xl font-black text-offwhite transition-colors group-hover:text-red">{m.symbol.split(' ')[0]}</span>
                    <span className="mt-2 text-sm font-bold text-mist">{m.name}</span>
                    {m.techniques[s.technique] === 'aanvraag' && <span className="mt-1 text-xs text-muted">Op aanvraag</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ + gerelateerd */}
      <section className="border-t border-line py-20 md:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7" data-reveal>
            <Faq items={s.faq} />
          </div>
          <aside className="lg:col-span-5" data-reveal style={{ '--reveal-delay': 100 } as React.CSSProperties} aria-labelledby="rel-title">
            <h2 id="rel-title" className="text-[length:var(--text-h3)] text-offwhite">Vaak gecombineerd met</h2>
            <ul className="mt-8 space-y-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={serviceHref(r.slug)} className="group flex items-center gap-4 rounded-md border border-line p-3 transition-colors hover:border-line-strong hover:bg-charcoal">
                    <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-sm">
                      <Image src={r.image.src} alt="" fill sizes="80px" className="object-cover" />
                    </span>
                    <span className="flex-1">
                      <span className="label-caps block text-[0.625rem] text-muted"><span className="text-red">{r.index}</span> / {r.label}</span>
                      <span className="mt-1 block font-bold text-offwhite">{r.name}</span>
                    </span>
                    <Icon name="arrow-right" size={18} className="mr-2 text-red transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8"><ArrowLink href={href('services')}>Alle productietechnieken</ArrowLink></div>
          </aside>
        </div>
      </section>

      <CtaBand title={`${s.name} aanvragen`} technique={s.slug} secondary={{ label: 'Werkwijze & kwaliteit', href: href('process') }} />
      <JsonLd data={serviceJsonLd({ name: s.name, description: s.seo.description, path: serviceHref(s.slug) })} />
    </>
  );
}
