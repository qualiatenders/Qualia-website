import { PageHero } from '@/components/PageHero';
import { Body, Heading, Section } from '@/components/Prose';
import { P_PRIVACY as P } from '@/lib/pages';
import { pageMetadata } from '@/lib/seo';
import { COMPANY } from '@/lib/site';

export const metadata = pageMetadata({
  route: 'privacy',
  title: 'Privacyverklaring',
  description: 'Welke gegevens Assault Boats verwerkt als je contact opneemt, waarom, hoe lang en welke rechten je hebt.',
});

/*
  Deze tekst beschrijft alleen wat de site daadwerkelijk doet:
  - geen cookies zolang er geen meet-ID is ingesteld
  - het contactformulier verstuurt naar het ingestelde endpoint, of opent
    de mailclient
  Verandert daar iets aan, dan hoort deze pagina mee te veranderen.

  TODO (juridisch, aan te leveren door Assault): KvK-nummer, postcode en
  eventueel een vaste bewaartermijn. Zolang die er niet zijn, staan ze
  hier bewust niet — een verzonnen nummer is erger dan geen nummer.
*/
export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow={P.eyebrow}
        title={P.title}
        lead={P.lead}
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Privacy', path: '/privacy/' },
        ]}
      />

      <Section>
        <Heading>Wie verwerkt je gegevens</Heading>
        <Body
          paragraphs={[
            `${COMPANY.name}, ${COMPANY.street} in ${COMPANY.city}, is verantwoordelijk voor de verwerking van persoonsgegevens die via deze website binnenkomen.`,
            `Vragen over je gegevens? Mail ${COMPANY.email} of bel ${COMPANY.phoneDisplay}.`,
          ]}
        />
      </Section>

      <Section tone="dark">
        <Heading tone="dark">Welke gegevens en waarom</Heading>
        <Body
          tone="dark"
          paragraphs={[
            'Vul je het contactformulier in, dan verwerken we je naam, e-mailadres, eventueel je telefoonnummer, de uitvoering waarin je geïnteresseerd bent en je bericht. We gebruiken die gegevens om je vraag te beantwoorden en, als daar een offerte of afspraak uit komt, om die af te handelen.',
            'De grondslag is je eigen verzoek om contact. Je bent nergens toe verplicht, maar zonder naam en e-mailadres kunnen we niet reageren.',
            'We verkopen je gegevens niet, en we gebruiken ze niet voor reclame of nieuwsbrieven.',
          ]}
        />
      </Section>

      <Section>
        <Heading>Cookies en meting</Heading>
        <Body
          paragraphs={[
            'Deze website plaatst uit zichzelf geen cookies en gebruikt geen trackers. Je kunt de hele site bekijken zonder dat er iets over jou wordt opgeslagen.',
            'Zetten we later anonieme bezoekstatistieken aan (Google Analytics 4), dan zie je eerst een keuze: accepteren of weigeren. Weiger je, of maak je geen keuze, dan wordt het script niet geladen en wordt er niets opgeslagen. Je keuze bewaren we in de opslag van je eigen browser, zodat we het niet steeds opnieuw vragen.',
            'De prijslijst is een PDF op deze website; die opent zonder dat er gegevens naar derden gaan.',
          ]}
        />
      </Section>

      <Section tone="dark">
        <Heading tone="dark">Wie je gegevens verder kan zien</Heading>
        <Body
          tone="dark"
          paragraphs={[
            'De website draait bij onze hostingpartij, die daarvoor logbestanden bijhoudt met onder meer IP-adressen. Dat is nodig om de site te laten werken en te beveiligen.',
            'Berichten uit het contactformulier komen binnen in onze mailbox. Verloopt het formulier via een externe formulierdienst, dan verwerkt die dienst je bericht om het bij ons af te leveren.',
            'Verder delen we niets met derden, behalve als de wet ons daartoe verplicht.',
          ]}
        />
      </Section>

      <Section>
        <Heading>Hoe lang we het bewaren</Heading>
        <Body
          paragraphs={[
            'Correspondentie bewaren we zolang die nodig is om je vraag af te handelen en, als je klant wordt, zolang de wet ons verplicht de administratie te bewaren.',
            'Wil je dat we je gegevens eerder verwijderen, laat het weten.',
          ]}
        />
      </Section>

      <Section tone="dark">
        <Heading tone="dark">Je rechten</Heading>
        <Body
          tone="dark"
          paragraphs={[
            'Je mag opvragen welke gegevens we van je hebben, ze laten corrigeren of laten verwijderen, en je mag bezwaar maken tegen de verwerking. Stuur daarvoor een mail; we reageren zo snel als het kan.',
            'Kom je er met ons niet uit, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.',
          ]}
        />
        <p className="type-label mt-10 text-mill">Laatst bijgewerkt: {P.laatstBijgewerkt}</p>
      </Section>
    </>
  );
}
