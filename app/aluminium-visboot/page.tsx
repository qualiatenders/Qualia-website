import { Media } from '@/components/Media';
import { PageHero } from '@/components/PageHero';
import { Body, Bullets, Heading, NextLinks, Points, Section } from '@/components/Prose';
import { GALLERY } from '@/lib/content';
import { P_VISBOOT as P } from '@/lib/pages';
import { breadcrumbSchema, jsonLd, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  route: 'aluminium-visboot',
  title: 'Aluminium visboot kiezen — waar je op let',
  ogTitle: 'Aluminium visboot kiezen',
  description:
    'Materiaal, indeling, romp en besturing: waar je op let als je een aluminium visboot koopt. Praktische uitleg van een Nederlandse aluminium bootbouwer.',
});

const kruimels = [
  { name: 'Home', path: '/' },
  { name: 'Aluminium visboot', path: '/aluminium-visboot/' },
];

export default function VisbootPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbSchema(kruimels))} />

      <PageHero eyebrow={P.eyebrow} title={P.title} lead={P.lead} crumbs={kruimels} />

      <Section>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Heading>{P.materiaal.title}</Heading>
            <Body paragraphs={P.materiaal.body} />
          </div>
          <div className="lg:col-span-6">
            <Media media={GALLERY[3]} sizes="(max-width: 1024px) 100vw, 50vw" className="w-full" />
            <p className="type-label mt-4 text-deck">Aluminium dek · antislip vloerdelen en afsluitbare luiken</p>
          </div>
        </div>
      </Section>

      <Section tone="dark">
        <Heading tone="dark">{P.indeling.title}</Heading>
        <Body paragraphs={P.indeling.body} tone="dark" />
        <Points items={P.indeling.punten} tone="dark" />
      </Section>

      <Section>
        <Heading>{P.romp.title}</Heading>
        <Body paragraphs={P.romp.body} />
        <p className="type-body mt-6 max-w-2xl text-deck">
          Meer over dit romptype staat op{' '}
          <a href="/aluminium-v-jon/" className="text-hull underline decoration-red underline-offset-4 hover:text-red">
            de pagina over de aluminium V-jon
          </a>
          .
        </p>
      </Section>

      <Section tone="dark">
        <Heading tone="dark">{P.besturing.title}</Heading>
        <Body paragraphs={P.besturing.body} tone="dark" />
      </Section>

      <Section>
        <Heading lead="Acht dingen die het verschil maken tussen boten die op papier op elkaar lijken.">
          {P.checklist.title}
        </Heading>
        <Bullets items={P.checklist.items} />
      </Section>

      {/* De eigen boot als afsluiting, niet als onderbreking van de uitleg. */}
      <Section tone="dark">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Heading tone="dark">{P.assault.title}</Heading>
            <Body paragraphs={P.assault.body} tone="dark" />
          </div>
          <div className="lg:col-span-7">
            <NextLinks
              tone="dark"
              items={[
                {
                  label: 'Assault 500 Fish',
                  description: 'Vast werpdek, drie afsluitbare bakken, aparte hengelberging.',
                  href: '/assault-500-fish/',
                },
                { label: 'Assault 500', description: 'De open uitvoering, vrij in te richten.', href: '/assault-500/' },
              ]}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
