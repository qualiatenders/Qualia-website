import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';
import { href } from '@/lib/i18n/routes';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ title: 'Cookieverklaring', description: 'GROTECH plaatst geen tracking- of marketingcookies. Lees welke technische opslag de website gebruikt.', path: href('cookies') });

const analytics = Boolean(process.env.NEXT_PUBLIC_ANALYTICS_SRC);

export default function CookiesPage() {
  return (
    <LegalPage title="Cookieverklaring" path={href('cookies')} intro="Kort samengevat: deze website plaatst geen tracking-, advertentie- of social-mediacookies. Daarom vragen we je ook niet om toestemming via een cookiebanner.">
      <h2>Functionele opslag</h2>
      <ul>
        <li>
          <strong>Concept van je offerteaanvraag</strong> — de ingevulde velden (zonder bestanden) worden tijdelijk in de sessie-opslag van je eigen browser bewaard, zodat je niets kwijtraakt als je de pagina vernieuwt. Deze gegevens verlaten je apparaat pas als je de aanvraag verstuurt, en verdwijnen zodra je het browsertabblad sluit.
        </li>
        <li>
          <strong>Beheeromgeving</strong> — medewerkers van GROTECH die inloggen op de beheeromgeving krijgen een strikt noodzakelijk sessiecookie. Bezoekers van de website krijgen dit cookie niet.
        </li>
      </ul>
      <p>Deze vormen van opslag zijn strikt noodzakelijk voor de werking van de website en vallen niet onder de toestemmingsplicht.</p>

      <h2>Statistieken</h2>
      {analytics ? (
        <p>
          We gebruiken een privacyvriendelijke, cookieloze statistiekendienst om te zien hoe de website wordt gebruikt. Deze dienst plaatst geen cookies, slaat geen IP-adressen op en maakt geen profielen van bezoekers.
        </p>
      ) : (
        <p>Op dit moment gebruiken we geen statistiekendienst. Als we dat in de toekomst doen, kiezen we een cookieloze, privacyvriendelijke oplossing en passen we deze verklaring aan.</p>
      )}

      <h2>Meer informatie</h2>
      <p>
        Lees in onze <Link href={href('privacy')}>privacyverklaring</Link> hoe we omgaan met persoonsgegevens en technische bestanden.
      </p>
    </LegalPage>
  );
}
