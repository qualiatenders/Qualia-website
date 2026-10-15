import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, CompanyBlock } from '@/components/LegalPage';
import { href } from '@/lib/i18n/routes';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ title: 'Privacyverklaring', description: 'Hoe GROTECH omgaat met persoonsgegevens, cookies en vertrouwelijke technische bestanden die via deze website worden verstrekt.', path: href('privacy') });

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacyverklaring" path={href('privacy')} intro="GROTECH verwerkt persoonsgegevens en technische bestanden zorgvuldig en in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG). In deze verklaring lees je welke gegevens we via deze website verwerken, waarom, en welke rechten je hebt.">
      <h2>1. Wie is verantwoordelijk?</h2>
      <CompanyBlock />

      <h2>2. Welke gegevens verwerken we?</h2>
      <h3>Offerteaanvraag</h3>
      <ul>
        <li>Bedrijfsnaam, naam contactpersoon, e-mailadres en telefoonnummer;</li>
        <li>eventuele eigen referentie en aanvullende informatie die je zelf invult;</li>
        <li>technische specificaties: productietechniek, materiaal, aantal, oppervlaktebehandeling, toleranties, leverdatum en opmerkingen;</li>
        <li>de technische bestanden die je uploadt (zoals STEP-, DXF- of PDF-tekeningen).</li>
      </ul>
      <h3>Contactformulier</h3>
      <ul>
        <li>Naam, e-mailadres, en optioneel bedrijfsnaam, telefoonnummer en onderwerp;</li>
        <li>de inhoud van je bericht.</li>
      </ul>
      <h3>Technische gegevens</h3>
      <p>
        Ter bescherming tegen misbruik (spam en overbelasting) gebruiken we je IP-adres kortstondig in het werkgeheugen van de server, uitsluitend in gehashte vorm, om het aantal verzoeken te beperken. Dit wordt niet bij je aanvraag opgeslagen. Onze hostingpartij kan standaard serverlogs bijhouden voor beveiliging en storingsanalyse.
      </p>

      <h2>3. Waarvoor en op welke grondslag?</h2>
      <ul>
        <li><strong>Beoordelen en offreren van je aanvraag</strong> en het daarover met je communiceren — noodzakelijk voor het nemen van maatregelen op jouw verzoek voorafgaand aan een overeenkomst (art. 6 lid 1 sub b AVG).</li>
        <li><strong>Uitvoeren van een opdracht</strong>, waaronder het laten produceren van onderdelen — uitvoering van de overeenkomst (art. 6 lid 1 sub b AVG).</li>
        <li><strong>Beantwoorden van contactberichten</strong> en <strong>beveiliging van de website</strong> — ons gerechtvaardigd belang (art. 6 lid 1 sub f AVG).</li>
        <li><strong>Bewaren van administratie</strong> bij een opdracht — wettelijke verplichting (art. 6 lid 1 sub c AVG).</li>
      </ul>
      <p>We gebruiken je gegevens niet voor geautomatiseerde besluitvorming of profilering en verkopen ze niet aan derden.</p>

      <h2>4. Vertrouwelijkheid van technische bestanden</h2>
      <p>
        Technische tekeningen behandelen we als vertrouwelijk. Geüploade bestanden worden via een versleutelde verbinding (HTTPS) verzonden, buiten de publiek toegankelijke delen van de website opgeslagen en versleuteld bewaard. Alleen daartoe bevoegde medewerkers van GROTECH hebben toegang. Bestanden worden niet als bijlage per e-mail rondgestuurd.
      </p>

      <h2>5. Met wie delen we gegevens?</h2>
      <ul>
        <li>
          <strong>Productiepartners.</strong> Om een offerte op te stellen of een opdracht uit te voeren, delen we de technische bestanden en specificaties met de productiepartner(s) die voor jouw onderdeel in aanmerking komen. We delen daarbij niet meer contactgegevens dan nodig. Is een productiepartner buiten de Europese Economische Ruimte gevestigd, dan zorgen we voor passende waarborgen, zoals de standaardcontractbepalingen van de Europese Commissie, en beperken we het delen tot wat voor de productie noodzakelijk is. Wil je dat je tekeningen alleen binnen de EER worden gedeeld, vermeld dit dan in je aanvraag.
        </li>
        <li><strong>Dienstverleners</strong> die ons ondersteunen, zoals hosting en e-mail. Met hen sluiten we verwerkersovereenkomsten.</li>
        <li><strong>Instanties</strong> als we daartoe wettelijk verplicht zijn.</li>
      </ul>

      <h2>6. Hoe lang bewaren we gegevens?</h2>
      <ul>
        <li>Offerteaanvragen zonder vervolgopdracht, inclusief bestanden: uiterlijk 24 maanden na het laatste contact, zodat we bij een herhaalvraag kunnen terugvallen op eerdere informatie. Je kunt eerder om verwijdering vragen.</li>
        <li>Aanvragen die tot een opdracht leiden: zolang nodig voor de uitvoering en daarna conform de wettelijke bewaartermijn voor de administratie (in de regel 7 jaar).</li>
        <li>Contactberichten: uiterlijk 12 maanden na afhandeling.</li>
      </ul>

      <h2>7. Beveiliging</h2>
      <p>
        We nemen passende technische en organisatorische maatregelen, waaronder versleutelde verbindingen, versleutelde opslag van bestanden, beperkte en beveiligde toegang tot de beheeromgeving, bescherming tegen spam en misbruik, en het minimaliseren van persoonsgegevens in logbestanden.
      </p>

      <h2>8. Jouw rechten</h2>
      <p>
        Je hebt het recht op inzage, rectificatie, verwijdering, beperking van de verwerking, overdraagbaarheid van gegevens en bezwaar. Neem hiervoor contact met ons op via de <Link href={href('contact')}>contactpagina</Link>. We reageren binnen een maand. Ben je niet tevreden over hoe we met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens (autoriteitpersoonsgegevens.nl).
      </p>

      <h2 id="cookies">9. Cookies</h2>
      <p>
        Deze website plaatst geen tracking-, advertentie- of social-mediacookies; daarom is er ook geen cookiebanner. We gebruiken alleen strikt noodzakelijke opslag:
      </p>
      <ul>
        <li><strong>Concept van je offerteaanvraag</strong> — de ingevulde velden (zonder bestanden) blijven tijdelijk in de sessie-opslag van je eigen browser staan, zodat je niets kwijtraakt bij vernieuwen. Ze verdwijnen als je het tabblad sluit.</li>
        <li><strong>Beheeromgeving</strong> — medewerkers van GROTECH krijgen bij inloggen een strikt noodzakelijk sessiecookie. Bezoekers krijgen dit niet.</li>
      </ul>
      <p>
        {process.env.NEXT_PUBLIC_ANALYTICS_SRC
          ? 'Voor statistieken gebruiken we een cookieloze, privacyvriendelijke dienst die geen IP-adressen opslaat en geen profielen maakt.'
          : 'We gebruiken geen statistiekendienst. Als we dat later doen, kiezen we een cookieloze, privacyvriendelijke oplossing en passen we deze tekst aan.'}
      </p>

      <h2>10. Wijzigingen</h2>
      <p>We kunnen deze privacyverklaring aanpassen, bijvoorbeeld bij nieuwe functionaliteit. De datum bovenaan geeft aan wanneer de tekst voor het laatst is bijgewerkt.</p>
    </LegalPage>
  );
}
