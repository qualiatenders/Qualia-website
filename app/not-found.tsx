import { ArrowLink } from '@/components/ArrowLink';
import { NextLinks } from '@/components/Prose';
import { Reveal } from '@/components/Reveal';
import { PRICE_CTA } from '@/lib/content';

/**
 * 404 in de eigen huisstijl.
 *
 * De statische export schrijft dit weg als /404.html; de .htaccess wijst
 * Apache daarheen met ErrorDocument, dus de bezoeker krijgt een echte
 * 404-status en geen omgeleide homepage.
 */
export const metadata = {
  title: 'Pagina niet gevonden',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="flex min-h-[100svh] flex-col justify-center border-b border-white/10 bg-hull py-32 text-bone">
      <div className="shell">
        <Reveal>
          <span className="type-label text-mill">Fout 404</span>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="type-display mt-6">
            Deze route
            <br />
            loopt dood.
          </h1>
          <span className="rule-red mt-8" aria-hidden="true" />
        </Reveal>
        <Reveal delay={0.16}>
          <p className="type-body mt-8 max-w-lg text-mill">
            De pagina die je zocht bestaat niet of heet inmiddels anders. Vanaf hier kom je overal weer terecht.
          </p>
        </Reveal>
        <Reveal delay={0.22} className="mt-10 flex flex-wrap gap-3">
          <ArrowLink href="/">Terug naar Assault</ArrowLink>
          <ArrowLink href="/assault-500/" variant="outline">
            Bekijk de Assault 500
          </ArrowLink>
        </Reveal>
        <NextLinks
          tone="dark"
          items={[
            { label: 'Assault 500 Fish', description: 'De visuitvoering met vast werpdek.', href: '/assault-500-fish/' },
            { label: 'Bekijk prijslijst', description: 'Uitvoeringen, opties en motorisering.', href: PRICE_CTA.cta.href },
            { label: 'Aluminium visboot kiezen', description: 'Waar je op let bij aanschaf.', href: '/aluminium-visboot/' },
            { label: 'Contact', description: 'Bel, app of kom langs in Zwartsluis.', href: '/contact/' },
          ]}
        />
      </div>
    </section>
  );
}
