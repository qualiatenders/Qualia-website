import { ArrowLink } from '@/components/ArrowLink';
import { PageHero } from '@/components/PageHero';
import { Body, Heading, Section } from '@/components/Prose';
import { P_VOORWAARDEN as P } from '@/lib/pages';
import { pageMetadata } from '@/lib/seo';
import { COMPANY } from '@/lib/site';

export const metadata = pageMetadata({
  route: 'algemene-voorwaarden',
  title: 'Algemene voorwaarden',
  description: 'De algemene voorwaarden van Assault Boats bij offertes, orders en levering.',
});

/*
  TODO — AAN TE LEVEREN DOOR ASSAULT.

  Hier hoort de daadwerkelijke tekst van de algemene voorwaarden. Die is
  bewust niet geschreven: voorwaarden verzinnen is juridisch waardeloos en
  kan tegen Assault werken zodra er een geschil is.

  Twee routes:
  1. Eigen voorwaarden laten opstellen of laten controleren, en de tekst
     hieronder plaatsen.
  2. Aansluiten bij een brancheregeling (bijvoorbeeld die van HISWA) en
     hier naar de vindplaats van die voorwaarden verwijzen.

  Tot die tijd staat deze pagina er als vindplaats, met de vermelding dat
  de voorwaarden bij een offerte worden meegestuurd — dat is waar, en het
  is beter dan een lege of verzonnen pagina.
*/
export default function VoorwaardenPage() {
  return (
    <>
      <PageHero
        eyebrow={P.eyebrow}
        title={P.title}
        lead={P.lead}
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Algemene voorwaarden', path: '/algemene-voorwaarden/' },
        ]}
      />

      <Section>
        <Heading>Op te vragen bij een offerte</Heading>
        <Body
          paragraphs={[
            'Onze algemene voorwaarden worden meegestuurd met elke offerte, zodat je ze bij de hand hebt op het moment dat ze ertoe doen.',
            `Wil je ze eerder inzien, vraag ze dan gerust op via ${COMPANY.email} of ${COMPANY.phoneDisplay}. Je krijgt ze dan per mail toegestuurd.`,
          ]}
        />
        <div className="mt-10 flex flex-wrap gap-3">
          <ArrowLink href={`mailto:${COMPANY.email}?subject=${encodeURIComponent('Verzoek algemene voorwaarden')}`}>
            Voorwaarden opvragen
          </ArrowLink>
          <ArrowLink href="/contact/" variant="ghost">
            Contact
          </ArrowLink>
        </div>
      </Section>

      <Section tone="dark">
        <Heading tone="dark">Bedrijfsgegevens</Heading>
        <Body
          tone="dark"
          paragraphs={[
            `${COMPANY.name} · ${COMPANY.street}, ${COMPANY.city} · ${COMPANY.countryName}`,
            `${COMPANY.phoneDisplay} · ${COMPANY.email}`,
          ]}
        />
      </Section>
    </>
  );
}
