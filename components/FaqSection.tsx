import { FAQ_HOME, FAQ_LINKS } from '@/lib/content';
import { Faq, NextLinks } from './Prose';
import { SectionHeader } from './SectionHeader';

/**
 * 05 — veelgestelde vragen.
 *
 * Dichte sectie, zelfde zwart als de hero: de vragen staan dichtgeklapt, dus
 * het blok is kort en de pagina wordt er geen tekstmuur van. De antwoorden
 * staan wél volledig in de HTML — dichtgeklapte details blijven leesbaar voor
 * een zoekmachine en voor iemand die Ctrl+F gebruikt.
 *
 * Hieronder de verwijzingen naar de onderpagina's. Die staan niet in het
 * hoofdmenu, maar ze moeten ergens via een gewone link te bereiken zijn.
 */
export function FaqSection() {
  return (
    <section id="vragen" className="border-t border-white/10 bg-hull py-24 text-bone lg:py-36">
      <div className="shell">
        <SectionHeader
          index="05"
          eyebrow="Veelgestelde vragen"
          title="Wat kopers ons vragen."
          subcopy="De vragen die vóór een proefvaart langskomen, met het antwoord erbij."
          className="max-w-xl"
        />
        <Faq items={FAQ_HOME} tone="dark" />
        <NextLinks items={FAQ_LINKS} tone="dark" />
      </div>
    </section>
  );
}
