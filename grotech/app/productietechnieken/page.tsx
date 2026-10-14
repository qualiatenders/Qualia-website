import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { CtaBand } from '@/components/CtaBand';
import { ButtonLink } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { services } from '@/lib/content/nl/services';
import { href, serviceHref, quoteHref } from '@/lib/i18n/routes';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Productietechnieken',
  description: 'CNC-frezen, CNC-draaien, aluminium snijwerk, aluminium zetwerk en laswerk & samenstellingen. Combineer technieken in één aanvraag bij één aanspreekpunt.',
  path: href('services'),
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: 'Home', path: '/' }, { name: 'Productietechnieken', path: href('services') }]}
        eyebrow="Productietechnieken"
        title={<>Elke techniek. <span className="text-mist">Eén aanspreekpunt.</span></>}
        lead="Van één gefreesd prototype tot een complete gelaste samenstelling. Je kiest wat je nodig hebt; wij organiseren de productie bij de passende partner of in eigen beheer, en bewaken de kwaliteit tot aan levering."
        actions={
          <>
            <ButtonLink href={quoteHref()} size="lg" icon="upload">Upload je tekening</ButtonLink>
            <ButtonLink href={href('process')} size="lg" variant="secondary">Onze werkwijze</ButtonLink>
          </>
        }
      />

      <section className="py-20 md:py-28" aria-label="Overzicht productietechnieken">
        <div className="container-x space-y-6 md:space-y-8">
          {services.map((s, i) => (
            <article key={s.slug} className="group grid overflow-hidden rounded-md border border-line bg-charcoal/40 transition-colors duration-500 hover:border-line-strong md:grid-cols-12" data-reveal>
              <Link href={serviceHref(s.slug)} className={`relative block aspect-[4/3] overflow-hidden md:col-span-5 md:aspect-auto md:min-h-[22rem] ${i % 2 ? 'md:order-2' : ''}`} tabIndex={-1} aria-hidden="true">
                <Image src={s.image.src} alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-precise)] group-hover:scale-[1.04]" />
              </Link>
              <div className="flex flex-col p-6 sm:p-8 md:col-span-7 md:p-12">
                <p className="label-caps text-muted"><span className="text-red">{s.index}</span> / {s.label}</p>
                <h2 className="mt-4 text-[length:var(--text-h3)] text-offwhite md:text-4xl">
                  <Link href={serviceHref(s.slug)} className="transition-colors hover:text-white">{s.name}</Link>
                </h2>
                <p className="mt-4 max-w-xl text-mist">{s.intro}</p>
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {s.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 text-[0.9375rem] text-mist">
                      <Icon name="check" size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-red" />
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap gap-3 pt-8">
                  <ButtonLink href={serviceHref(s.slug)} variant="secondary">Meer over {s.short}</ButtonLink>
                  <ButtonLink href={quoteHref(s.slug)} icon="upload" >Offerte aanvragen</ButtonLink>
                </div>
              </div>
            </article>
          ))}

          <article className="grid gap-8 rounded-md border border-dashed border-line-strong p-6 sm:p-8 md:grid-cols-12 md:p-12" data-reveal>
            <div className="md:col-span-7">
              <p className="label-caps text-muted"><span className="text-red">06</span> / Assemblies</p>
              <h2 className="mt-4 text-[length:var(--text-h3)] text-offwhite md:text-4xl">Complete samenstellingen</h2>
              <p className="mt-4 max-w-xl text-mist">
                Een onderdeel dat uit meerdere bewerkingen bestaat? Gesneden en gezette plaat, gefreesde blokken, draaiwerk en laswerk brengen we samen tot één geheel. Jij hebt één aanvraag, één offerte en één aanspreekpunt.
              </p>
            </div>
            <div className="flex items-end md:col-span-5 md:justify-end">
              <ButtonLink href={`${quoteHref()}?techniek=samenstelling`} size="lg" icon="upload">Samenstelling aanvragen</ButtonLink>
            </div>
          </article>
        </div>
      </section>
      <CtaBand secondary={{ label: 'Bekijk materialen', href: href('materials') }} />
    </>
  );
}
