import { ArrowLink } from '@/components/ArrowLink';
import { Media } from '@/components/Media';
import { PageHero } from '@/components/PageHero';
import { OptionsTable } from '@/components/PriceTables';
import { Body, Faq, Heading, NextLinks, Points, Section } from '@/components/Prose';
import { SpecList } from '@/components/SpecList';
import { MODELS, MODEL_PRICES, PRICE_CTA, euro } from '@/lib/content';
import { P_FISH as P } from '@/lib/pages';
import { breadcrumbSchema, faqSchema, jsonLd, pageMetadata, productSchema } from '@/lib/seo';

export const metadata = pageMetadata({
  route: 'assault-500-fish',
  title: 'Assault 500 Fish — aluminium visboot met werpdek',
  ogTitle: 'Assault 500 Fish — aluminium visboot met werpdek',
  description:
    'Aluminium visboot van 5 meter met een vast werpdek voorin en drie afsluitbare opbergbakken, waaronder een aparte hengelberging. € 10.375 incl. btw.',
});

const kruimels = [
  { name: 'Home', path: '/' },
  { name: 'Assault 500 Fish', path: '/assault-500-fish/' },
];

export default function FishPage() {
  const fish = MODELS[1];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          productSchema({
            name: 'Assault 500 Fish',
            description:
              'Aluminium visboot van 5,00 meter met een vast aluminium werpdek voorin en drie geïntegreerde afsluitbare opbergbakken, waaronder een aparte hengelberging.',
            path: '/assault-500-fish/',
            imagePath: '/og/assault-boats.jpg',
            price: MODEL_PRICES.fish,
            extraProperties: [
              { name: 'Lengte', value: '5,00 m' },
              { name: 'Breedte', value: '1,95 m' },
              { name: 'Plaatdikte', value: '4 mm' },
              { name: 'Werpdek', value: 'Vast aluminium werpdek voorin' },
              { name: 'Berging', value: 'Drie afsluitbare opbergbakken' },
              { name: 'Maximaal motorvermogen', value: '80 pk' },
            ],
          }),
        )}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbSchema(kruimels))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema(P.faq))} />

      {/*
        Bewust geen beeld naast de kop: van de Fish is nog geen eigen render
        of foto. Liever de prijs en het verschil groot dan een plaat die de
        verkeerde uitvoering laat zien.
      */}
      <PageHero
        eyebrow={P.eyebrow}
        title={P.title}
        lead={P.lead}
        crumbs={kruimels}
        aside={
          <div className="border-t-2 border-red pt-6">
            <div className="flex items-baseline justify-between gap-4">
              <span className="type-label text-mill">Vanafprijs</span>
              <span className="font-[family-name:var(--font-display)] text-[0.9375rem] font-bold tracking-[-0.02em] text-red [font-variant-numeric:tabular-nums]">
                + EUR {euro(MODEL_PRICES.fishSurcharge)} t.o.v. de Open
              </span>
            </div>
            <p className="mt-4 font-[family-name:var(--font-display)] text-[2.75rem] font-extrabold leading-none tracking-[-0.045em] text-bone [font-variant-numeric:tabular-nums]">
              <span className="mr-2 text-[1.375rem] text-mill">EUR</span>
              {euro(MODEL_PRICES.fish)}
            </p>
            <span className="type-label mt-3 block text-mill">Incl. 21% btw</span>
            <div className="mt-8 flex flex-wrap gap-3">
              <ArrowLink href={PRICE_CTA.cta.href} target="_blank" rel="noreferrer">
                Bekijk prijslijst
              </ArrowLink>
              <ArrowLink href="/contact/" variant="outline">
                Kom langs
              </ArrowLink>
            </div>
          </div>
        }
      />

      {/* --- wat de Fish is -------------------------------------------- */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Heading>{P.intro.title}</Heading>
            <Body paragraphs={P.intro.body} />
            <ul className="mt-8 space-y-3">
              {fish.features.map((feature, i) => (
                <li key={feature} className="flex items-baseline gap-4 border-t border-black/15 pt-3">
                  <span className="type-label text-mill">{String(i + 1).padStart(2, '0')}</span>
                  <span className="type-body font-medium text-hull">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <Media media={fish.media} sizes="(max-width: 1024px) 100vw, 55vw" className="w-full" />
          </div>
        </div>
      </Section>

      {/* --- waarom een werpdek ---------------------------------------- */}
      <Section tone="dark">
        <Heading tone="dark" lead={P.waarom.intro}>
          {P.waarom.title}
        </Heading>
        <Points items={P.waarom.punten} tone="dark" />
      </Section>

      {/* --- specificaties --------------------------------------------- */}
      <Section>
        <Heading lead="Identiek aan de Assault 500 Open — alleen de dekindeling verschilt.">De romp in cijfers</Heading>
        <SpecList />
      </Section>

      {/* --- gevolgen voor de opties ----------------------------------- */}
      <Section tone="dark">
        <Heading tone="dark">{P.indeling.title}</Heading>
        <Body paragraphs={P.indeling.body} tone="dark" />
      </Section>

      <Section>
        <Heading lead="Alles wat op de Assault 500 Fish past.">Opties</Heading>
        <OptionsTable variant="fish" />
      </Section>

      {/* --- faq --------------------------------------------------------- */}
      <Section tone="dark">
        <Heading tone="dark">Veelgestelde vragen</Heading>
        <Faq items={P.faq} tone="dark" />
      </Section>

      <Section>
        <Heading>Verder</Heading>
        <NextLinks
          items={[
            {
              label: 'Aluminium visboot kiezen',
              description: 'Materiaal, indeling en romp: waar je op let bij aanschaf.',
              href: '/aluminium-visboot/',
            },
            { label: 'Assault 500', description: 'De open uitvoering, met een vrij in te richten dek.', href: '/assault-500/' },
            { label: 'Aluminium V-jon', description: 'Wat dit romptype is en hoe het vaart.', href: '/aluminium-v-jon/' },
            { label: 'Contact', description: 'Kom de boot in het echt bekijken in Zwartsluis.', href: '/contact/' },
          ]}
        />
      </Section>
    </>
  );
}
