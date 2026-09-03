import { ArrowLink } from '@/components/ArrowLink';
import { Media } from '@/components/Media';
import { PageHero } from '@/components/PageHero';
import { OptionsTable } from '@/components/PriceTables';
import { Body, Faq, Heading, NextLinks, Points, Section } from '@/components/Prose';
import { SpecList } from '@/components/SpecList';
import { MODELS, MODEL_PRICES, PRICE_CTA, euro } from '@/lib/content';
import { P_ASSAULT_500 as P } from '@/lib/pages';
import { breadcrumbSchema, faqSchema, jsonLd, pageMetadata, productSchema } from '@/lib/seo';

export const metadata = pageMetadata({
  route: 'assault-500',
  title: 'Assault 500 — aluminium V-jon van 5 meter',
  ogTitle: 'Assault 500 — aluminium V-jon van 5 meter',
  description:
    'De Assault 500 is een aluminium V-jon van 5,00 m in 4 mm 5083, binnen en buiten gelast. Zelflozend dek, tiller standaard, max. 80 pk. Vanaf € 9.575 incl. btw.',
});

const kruimels = [
  { name: 'Home', path: '/' },
  { name: 'Assault 500', path: '/assault-500/' },
];

export default function Assault500Page() {
  const open = MODELS[0];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          productSchema({
            name: 'Assault 500',
            description:
              'Aluminium V-jon van 5,00 meter in 4 mm 5083, binnen en buiten gelast, met zelflozend dek en tiller-besturing als standaard.',
            path: '/assault-500/',
            imagePath: '/og/assault-boats.jpg',
            price: MODEL_PRICES.open,
            extraProperties: [
              { name: 'Lengte', value: '5,00 m' },
              { name: 'Breedte', value: '1,95 m' },
              { name: 'Plaatdikte', value: '4 mm' },
              { name: 'Gewicht romp', value: '320 kg' },
              { name: 'Maximaal motorvermogen', value: '80 pk' },
              { name: 'Besturing', value: 'Tiller standaard, stuurconsole optioneel' },
            ],
          }),
        )}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbSchema(kruimels))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema(P.faq))} />

      <PageHero
        eyebrow={P.eyebrow}
        title={P.title}
        lead={P.lead}
        crumbs={kruimels}
        aside={<Media media={open.media} sizes="(max-width: 1024px) 100vw, 45vw" className="w-full" />}
      />

      {/* --- prijs en uitvoeringen ------------------------------------ */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Heading>{P.intro.title}</Heading>
            <Body paragraphs={P.intro.body} />
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-px bg-black/15 sm:grid-cols-2">
              <div className="bg-bone pb-8 pt-7 sm:pr-8">
                <span className="type-label text-deck">Uitvoering 01</span>
                <h3 className="type-h3 mt-4">Assault 500 Open</h3>
                <p className="mt-5 font-[family-name:var(--font-display)] text-[2rem] font-extrabold leading-none tracking-[-0.04em] [font-variant-numeric:tabular-nums]">
                  <span className="mr-2 text-[1.125rem] text-mill">EUR</span>
                  {euro(MODEL_PRICES.open)}
                </p>
                <span className="type-label mt-3 block text-mill">Incl. 21% btw</span>
                <p className="type-body mt-5 text-deck">Open, multifunctionele uitvoering. Vrij dek, vrij in te richten.</p>
              </div>

              <div className="bg-bone pb-8 pt-7 sm:pl-8">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="type-label text-deck">Uitvoering 02</span>
                  <span className="font-[family-name:var(--font-display)] text-[0.9375rem] font-bold tracking-[-0.02em] text-red [font-variant-numeric:tabular-nums]">
                    + EUR {euro(MODEL_PRICES.fishSurcharge)}
                  </span>
                </div>
                <h3 className="type-h3 mt-4">Assault 500 Fish</h3>
                <p className="mt-5 font-[family-name:var(--font-display)] text-[2rem] font-extrabold leading-none tracking-[-0.04em] [font-variant-numeric:tabular-nums]">
                  <span className="mr-2 text-[1.125rem] text-mill">EUR</span>
                  {euro(MODEL_PRICES.fish)}
                </p>
                <span className="type-label mt-3 block text-mill">Incl. 21% btw</span>
                <p className="type-body mt-5 text-deck">
                  Vast aluminium werpdek voorin met drie afsluitbare opbergbakken.{' '}
                  <a href="/assault-500-fish/" className="text-hull underline decoration-red underline-offset-4 hover:text-red">
                    Bekijk de Assault 500 Fish
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <ArrowLink href={PRICE_CTA.cta.href} target="_blank" rel="noreferrer">
                Bekijk prijslijst
              </ArrowLink>
              <ArrowLink href="/contact/" variant="ghost">
                Kom langs
              </ArrowLink>
            </div>
          </div>
        </div>
      </Section>

      {/* --- constructie ---------------------------------------------- */}
      <Section tone="dark">
        <Heading tone="dark">{P.bouw.title}</Heading>
        <Body paragraphs={P.bouw.body} tone="dark" />
        <Points items={P.punten} tone="dark" />
      </Section>

      {/* --- specificaties -------------------------------------------- */}
      <Section id="specs">
        <Heading lead="Dezelfde romp voor beide uitvoeringen.">De Assault 500 in cijfers</Heading>
        <SpecList />
      </Section>

      {/* --- besturing ------------------------------------------------- */}
      <Section tone="dark">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Heading tone="dark">{P.besturing.title}</Heading>
            <Body paragraphs={P.besturing.body} tone="dark" />
          </div>
          <div className="lg:col-span-7">
            <Media
              media={MODELS[0].media}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="w-full"
            />
            <p className="type-label mt-5 text-deck">Standaard uitrusting · {open.features.slice(0, 2).join(' · ')}</p>
          </div>
        </div>
      </Section>

      {/* --- opties ---------------------------------------------------- */}
      <Section>
        <Heading lead="Alles wat op de Assault 500 Open past. Je kiest wat je nu nodig hebt; de rest kun je later alsnog bestellen.">
          Opties
        </Heading>
        <OptionsTable variant="open" />
      </Section>

      {/* --- faq -------------------------------------------------------- */}
      <Section tone="dark">
        <Heading tone="dark">Veelgestelde vragen</Heading>
        <Faq items={P.faq} tone="dark" />
      </Section>

      {/* --- verder lezen ----------------------------------------------- */}
      <Section>
        <Heading>Verder</Heading>
        <NextLinks
          items={[
            {
              label: 'Assault 500 Fish',
              description: 'Dezelfde romp met een vast werpdek en drie afsluitbare opbergbakken.',
              href: '/assault-500-fish/',
            },
            {
              label: 'Aluminium V-jon',
              description: 'Wat dit romptype is, hoe het vaart en waar het goed werkt.',
              href: '/aluminium-v-jon/',
            },
            {
              label: 'Aluminium visboot kiezen',
              description: 'Waar je op let bij materiaal, indeling en romp.',
              href: '/aluminium-visboot/',
            },
            { label: 'Contact', description: 'Kom de boot in het echt bekijken in Zwartsluis.', href: '/contact/' },
          ]}
        />
      </Section>
    </>
  );
}
