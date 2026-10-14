import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';
import { href } from '@/lib/i18n/routes';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ title: 'Disclaimer', description: 'Voorwaarden voor het gebruik van de website van GROTECH: geen aanbod, illustratief beeldmateriaal, intellectueel eigendom en aansprakelijkheid.', path: href('disclaimer') });

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" path={href('disclaimer')} intro="De informatie op deze website is met zorg samengesteld en bedoeld als algemene informatie over de diensten van GROTECH.">
      <h2>Geen aanbod</h2>
      <p>
        De informatie op deze website vormt geen aanbod. Mogelijkheden, materialen, toleranties, oppervlaktebehandelingen en levertijden worden per aanvraag beoordeeld en uitsluitend in een schriftelijke offerte bevestigd. Aan de inhoud van deze website kunnen geen rechten worden ontleend.
      </p>
      <h2>Beeldmateriaal</h2>
      <p>
        Foto&apos;s en renders op deze website zijn illustratief. Ze tonen voorbeelden van bewerkingen en onderdelen, en geen specifieke productielocatie of gerealiseerd klantproject.
      </p>
      <h2>Offerteaanvragen</h2>
      <p>
        Het versturen van een aanvraag via deze website verplicht je tot niets. Een overeenkomst komt pas tot stand na schriftelijke aanvaarding van een offerte. Prijzen worden niet automatisch berekend; elke aanvraag wordt handmatig beoordeeld.
      </p>
      <h2>Intellectueel eigendom</h2>
      <p>
        Teksten, beelden, het GROTECH-logo en de vormgeving van deze website zijn eigendom van GROTECH of haar licentiegevers. Overnemen is niet toegestaan zonder voorafgaande schriftelijke toestemming. Technische tekeningen die je met ons deelt, blijven jouw eigendom en worden vertrouwelijk behandeld.
      </p>
      <h2>Aansprakelijkheid</h2>
      <p>
        GROTECH spant zich in om de website correct en beschikbaar te houden, maar staat niet in voor de volledigheid of foutloosheid van de informatie. GROTECH is niet aansprakelijk voor schade die voortvloeit uit het gebruik van deze website of uit (tijdelijke) onbeschikbaarheid ervan, behoudens opzet of bewuste roekeloosheid.
      </p>
      <h2>Vragen</h2>
      <p>
        Heb je vragen over deze disclaimer? Neem dan <Link href={href('contact')}>contact</Link> met ons op.
      </p>
    </LegalPage>
  );
}
