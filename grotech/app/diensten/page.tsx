import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHero } from '@/components/PageHero';
import { ButtonLink } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Faq } from '@/components/Faq';
import { JsonLd } from '@/components/JsonLd';
import { services } from '@/lib/content/nl/services';
import { href, quoteHref, serviceHref } from '@/lib/i18n/routes';
import { buildMetadata, serviceJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Diensten — aluminium snij-, zet- en laswerk en CNC-verspaning',
  description:
    'Specialist in aluminium: snijwerk, zetwerk en laswerk in aluminium, en CNC-frezen en -draaien in alle materialen. Productie volgens tekening, via één Nederlands aanspreekpunt.',
  path: href('services'),
});

const pick = (slug: string, i: number) => services.find((s) => s.slug === slug)!.faq[i]!;
const faq = [
  {
    q: 'In welke materialen werken jullie?',
    a: 'We zijn gespecialiseerd in aluminium. Snijwerk, zetwerk en laswerk doen we uitsluitend in aluminium. CNC-frezen en CNC-draaien doen we in alle gangbare materialen: aluminium, RVS, staal, messing, koper en technische kunststoffen.',
  },
  pick('cnc-frezen', 0),
  pick('cnc-frezen', 1),
  pick('cnc-frezen', 2),
  pick('cnc-draaien', 0),
  pick('aluminium-snijwerk', 0),
  pick('aluminium-laswerk', 0),
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: 'Home', path: '/' }, { name: 'Diensten', path: href('services') }]}
        eyebrow="Diensten"
        title={<>Specialist in aluminium<span className="text-red">.</span></>}
        lead="Snijwerk, zetwerk en laswerk doen we uitsluitend in aluminium. CNC-frezen en -draaien in alle gangbare materialen. Wij beoordelen je tekening, organiseren de productie en bewaken de kwaliteit tot aan levering."
      >
        <nav aria-label="Diensten op deze pagina" className="mt-10 flex flex-wrap gap-2" data-reveal>
          {services.map((s) => (
            <a key={s.slug} href={`#${s.slug}`} className="rounded-full border border-line-strong px-4 py-2 text-sm font-bold text-mist transition-colors hover:border-offwhite/50 hover:text-offwhite">
              {s.name}
            </a>
          ))}
        </nav>
      </PageHero>

      {services.map((s, i) => {
        const specs = s.specs.filter((sp) => !['Levertijd', 'Toleranties', 'Kwalificaties', 'Buigradii', 'Plaatdikte'].includes(sp.label)).slice(0, 4);
        return (
          <section key={s.slug} id={s.slug} className={`theme-light scroll-mt-20 py-16 md:py-24 ${i % 2 ? 'bg-tint' : ''}`} aria-labelledby={`${s.slug}-title`}>
            <div className="container-x grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className={`relative aspect-[4/3] overflow-hidden rounded-md bg-[#090b0e] lg:col-span-6 ${i % 2 ? 'lg:order-2' : ''}`} data-reveal="fade">
                <Image src={s.image.src} alt={s.image.alt} fill sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" priority={i === 0} />
                <span className="label-caps absolute top-4 left-4 text-[0.625rem] text-[#9aa1aa]">Illustratieve render</span>
              </div>
              <div className="lg:col-span-6" data-reveal>
                <p className="label-caps text-muted"><span className="text-red">{s.index}</span> / {s.label}</p>
                <h2 id={`${s.slug}-title`} className="mt-3 text-[length:var(--text-h2)]">{s.name}</h2>
                <p className="mt-5 text-mist">{s.intro}</p>
                <ul className="mt-6 space-y-2">
                  {s.highlights.map((h) => (
                    <li key={h} className="flex gap-3 font-bold">
                      <Icon name="check" size={20} strokeWidth={2.2} className="mt-0.5 shrink-0 text-red" />
                      {h}
                    </li>
                  ))}
                </ul>
                <dl className="mt-8 border-t border-line">
                  {specs.map((sp) => (
                    <div key={sp.label} className="grid gap-1 border-b border-line py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
                      <dt className="label-caps pt-0.5 text-muted">{sp.label}</dt>
                      <dd className="text-[0.9375rem]">{sp.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-8">
                  <ButtonLink href={quoteHref(s.slug)} icon="upload">{s.short} aanvragen</ButtonLink>
                </div>
              </div>
            </div>
            <JsonLd data={serviceJsonLd({ name: s.name, description: s.seo.description, path: serviceHref(s.slug) })} />
          </section>
        );
      })}

      <section className="theme-light border-t border-line py-16 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4" data-reveal>
            <p className="eyebrow">Goed om te weten</p>
            <p className="mt-5 text-mist">
              Toleranties, kwaliteiten en levertijden bevestigen we altijd per aanvraag in de offerte. We doen geen toezeggingen die we niet kunnen onderbouwen.
            </p>
          </div>
          <div className="lg:col-span-8" data-reveal>
            <Faq items={faq} />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20" aria-label="Offerte aanvragen">
        <div className="container-x flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-xl text-[length:var(--text-h2)] text-offwhite">Klaar om te produceren<span className="text-red">?</span></h2>
          <ButtonLink href={quoteHref()} size="lg" icon="upload">Upload je tekening</ButtonLink>
        </div>
      </section>
    </>
  );
}
