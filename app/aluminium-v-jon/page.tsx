import { Media } from '@/components/Media';
import { PageHero } from '@/components/PageHero';
import { Body, Heading, NextLinks, Points, Section } from '@/components/Prose';
import { SpecList } from '@/components/SpecList';
import { SPECS_PLAN } from '@/lib/content';
import { P_VJON as P } from '@/lib/pages';
import { breadcrumbSchema, jsonLd, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  route: 'aluminium-v-jon',
  title: 'Aluminium V-jon — wat het is en hoe het vaart',
  ogTitle: 'Aluminium V-jon — wat het is en hoe het vaart',
  description:
    'Een V-jon zit tussen een vlakke jon boat en een diepe V in. Uitleg over vaargedrag, stabiliteit, ondiepe gang, materiaal en motorisering — inclusief wat je inlevert.',
});

const kruimels = [
  { name: 'Home', path: '/' },
  { name: 'Aluminium V-jon', path: '/aluminium-v-jon/' },
];

export default function VJonPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbSchema(kruimels))} />

      <PageHero eyebrow={P.eyebrow} title={P.title} lead={P.lead} crumbs={kruimels} />

      <Section>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Heading>{P.wat.title}</Heading>
            <Body paragraphs={P.wat.body} />
          </div>
          <div className="lg:col-span-6">
            <Media media={SPECS_PLAN} sizes="(max-width: 1024px) 100vw, 50vw" className="w-full" />
            <p className="type-label mt-4 text-deck">Bovenaanzicht · V voorin, vlakker naar achteren</p>
          </div>
        </div>
      </Section>

      <Section tone="dark">
        <Heading tone="dark">{P.gedrag.title}</Heading>
        <Points items={P.gedrag.punten} tone="dark" />
      </Section>

      {/* Eerlijk over de nadelen: dat is precies waarom iemand dit leest. */}
      <Section>
        <Heading>{P.eerlijk.title}</Heading>
        <Body paragraphs={P.eerlijk.body} />
      </Section>

      <Section tone="dark">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Heading tone="dark">{P.materiaal.title}</Heading>
            <Body paragraphs={P.materiaal.body} tone="dark" />
          </div>
          <div>
            <Heading tone="dark">{P.motor.title}</Heading>
            <Body paragraphs={P.motor.body} tone="dark" />
          </div>
        </div>
      </Section>

      <Section>
        <Heading lead={P.assault.body[0]}>{P.assault.title}</Heading>
        <SpecList />
        <NextLinks
          items={[
            { label: 'Assault 500', description: 'De open uitvoering, met een vrij in te richten dek.', href: '/assault-500/' },
            {
              label: 'Assault 500 Fish',
              description: 'Dezelfde romp met een vast werpdek en opbergruimte.',
              href: '/assault-500-fish/',
            },
            {
              label: 'Aluminium visboot kiezen',
              description: 'Waar je op let bij materiaal, indeling en besturing.',
              href: '/aluminium-visboot/',
            },
            { label: 'Contact', description: 'Kom hem in het echt bekijken in Zwartsluis.', href: '/contact/' },
          ]}
        />
      </Section>
    </>
  );
}
