import { ArrowLink } from '@/components/ArrowLink';
import { PageHero } from '@/components/PageHero';
import { Body, Heading, NextLinks, Section } from '@/components/Prose';
import { P_BEDANKT as P } from '@/lib/pages';
import { pageMetadata } from '@/lib/seo';
import { COMPANY, WHATSAPP_URL } from '@/lib/site';

/** Staat op noindex via lib/site.ts — dit is een conversiepagina, geen zoekresultaat. */
export const metadata = pageMetadata({
  route: 'bedankt',
  title: 'Bericht ontvangen',
  description: 'Je bericht is bij ons binnen. We nemen zo snel mogelijk contact met je op.',
});

export default function BedanktPage() {
  return (
    <>
      <PageHero eyebrow={P.eyebrow} title={P.title} lead={P.lead} />

      <Section>
        <Heading>Wat er nu gebeurt</Heading>
        <Body
          paragraphs={[
            'We lezen je bericht en reageren zelf — geen callcenter, geen standaardantwoord. Meestal binnen een werkdag.',
            'Wil je sneller schakelen, bel of app dan gerust even.',
          ]}
        />
        <div className="mt-10 flex flex-wrap gap-3">
          <ArrowLink href={`tel:${COMPANY.phoneE164}`}>{COMPANY.phoneDisplay}</ArrowLink>
          <ArrowLink href={WHATSAPP_URL} target="_blank" rel="noreferrer noopener" variant="ghost">
            WhatsApp
          </ArrowLink>
        </div>
      </Section>

      <Section tone="dark">
        <Heading tone="dark">Ondertussen</Heading>
        <NextLinks
          tone="dark"
          items={[
            { label: 'Assault 500', description: 'De open uitvoering, vrij in te richten.', href: '/assault-500/' },
            { label: 'Assault 500 Fish', description: 'Vast werpdek met drie afsluitbare bakken.', href: '/assault-500-fish/' },
          ]}
        />
      </Section>
    </>
  );
}
