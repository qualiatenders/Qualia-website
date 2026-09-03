import { ArrowLink } from '@/components/ArrowLink';
import { Media } from '@/components/Media';
import { PageHero } from '@/components/PageHero';
import { Body, Heading, NextLinks, Points, Section } from '@/components/Prose';
import { GALLERY, INTRO } from '@/lib/content';
import { P_OVER as P } from '@/lib/pages';
import { breadcrumbSchema, jsonLd, pageMetadata } from '@/lib/seo';
import { COMPANY, MAPS_URL } from '@/lib/site';

export const metadata = pageMetadata({
  route: 'over-assault',
  title: 'Over Assault — aluminium bootbouwer in Zwartsluis',
  ogTitle: 'Over Assault Boats',
  description:
    'Assault Boats bouwt aluminium V-jons in Zwartsluis. Eén model, twee opbouwen, binnen en buiten gelast. Kom langs in de werkplaats.',
});

const kruimels = [
  { name: 'Home', path: '/' },
  { name: 'Over Assault', path: '/over-assault/' },
];

export default function OverPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbSchema(kruimels))} />

      <PageHero eyebrow={P.eyebrow} title={P.title} lead={P.lead} crumbs={kruimels} />

      <Section>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Heading>{P.verhaal.title}</Heading>
            <Body paragraphs={P.verhaal.body} />
          </div>
          <div className="lg:col-span-7">
            {/* Het laswerk zelf, niet een sfeerbeeld: dat is waar het over gaat. */}
            <Media media={INTRO.media.primary} sizes="(max-width: 1024px) 100vw, 55vw" className="w-full" />
            <p className="type-label mt-4 text-deck">Al 5083 · 4 mm · binnen + buiten gelast</p>
          </div>
        </div>
        <Points items={P.punten} />
      </Section>

      <Section tone="dark">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Heading tone="dark">{P.bezoek.title}</Heading>
            <Body paragraphs={P.bezoek.body} tone="dark" />
            <div className="mt-9 flex flex-wrap gap-3">
              <ArrowLink href={MAPS_URL} target="_blank" rel="noreferrer noopener">
                {COMPANY.street}, {COMPANY.city}
              </ArrowLink>
              <ArrowLink href="/contact/" variant="outline">
                Maak een afspraak
              </ArrowLink>
            </div>
          </div>
          <div className="lg:col-span-7">
            <Media media={GALLERY[0]} sizes="(max-width: 1024px) 100vw, 55vw" className="w-full" />
          </div>
        </div>
      </Section>

      <Section>
        <Heading>Verder</Heading>
        <NextLinks
          items={[
            { label: 'Assault 500', description: 'De open uitvoering, vrij in te richten.', href: '/assault-500/' },
            { label: 'Assault 500 Fish', description: 'Vast werpdek en drie afsluitbare bakken.', href: '/assault-500-fish/' },
            { label: 'Aluminium visboot kiezen', description: 'Waar je op let bij aanschaf.', href: '/aluminium-visboot/' },
            { label: 'Contact', description: 'Bel, app of kom langs in Zwartsluis.', href: '/contact/' },
          ]}
        />
      </Section>
    </>
  );
}
