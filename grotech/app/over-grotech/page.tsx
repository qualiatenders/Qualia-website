import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';
import { CtaBand } from '@/components/CtaBand';
import { ButtonLink } from '@/components/Button';
import { Icon, type IconName } from '@/components/Icon';
import { PartnerDiagram } from '@/components/PartnerDiagram';
import { href } from '@/lib/i18n/routes';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Over GROTECH',
  description: 'GROTECH is een onafhankelijke Nederlandse B2B-partner voor de inkoop en realisatie van technische maatwerkonderdelen, via geselecteerde productiepartners en in eigen beheer.',
  path: href('about'),
});

const values: { icon: IconName; title: string; text: string }[] = [
  { icon: 'target', title: 'Precisie', text: 'Tekeningen en toleranties eerst. We beginnen bij wat er technisch gevraagd wordt.' },
  { icon: 'gear', title: 'Efficiënt', text: 'Een gestroomlijnd proces: één aanvraag, één aanspreekpunt, korte lijnen.' },
  { icon: 'shield', title: 'Vertrouwen', text: 'Afspraak is afspraak. Duidelijk over wat we wel en niet beloven.' },
  { icon: 'globe', title: 'Wereldwijd', text: 'Toegang tot internationale productiecapaciteit, met regie vanuit Nederland.' },
];

const audiences = ['Machinebouwers', 'Engineeringbureaus', 'Jachtbouwers', 'Technische inkopers', 'Bedrijven met terugkerend maatwerk'];

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: 'Home', path: '/' }, { name: 'Over GROTECH', path: href('about') }]}
        eyebrow="Over GROTECH"
        title={<>Niet goedkoop. <span className="text-mist">Wel slim.</span></>}
        lead="GROTECH is een onafhankelijke B2B-partner voor de inkoop en realisatie van technische maatwerkonderdelen. Van CNC-frezen en -draaien tot plaatwerk en laswerk: heldere specificaties, slimme productie-inkoop en één Nederlands aanspreekpunt."
      />

      <section className="py-20 md:py-28" aria-labelledby="model-title">
        <div className="container-x grid gap-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="eyebrow" data-reveal>Ons model</p>
            <h2 id="model-title" className="mt-5 text-[length:var(--text-h2)] text-offwhite" data-reveal>Transparant over hoe we produceren.</h2>
            <div className="prose-grotech mt-6" data-reveal>
              <p>
                GROTECH is <strong>geen eigenaar van grote CNC-fabrieken</strong>, en dat presenteren we ook niet zo. We produceren via zorgvuldig geselecteerde nationale en internationale productiepartners. Bepaalde werkzaamheden voeren we in eigen beheer uit.
              </p>
              <p>
                Onze waarde zit in de regie: we lezen en beoordelen je tekening, kiezen de passende productiepartner per techniek, bewaken de kwaliteit en communiceren helder over planning en uitvoering. Jij houdt één aanspreekpunt in Nederland.
              </p>
              <p>Zo combineer je technische kennis en persoonlijk contact met de capaciteit en prijs van een internationaal netwerk.</p>
            </div>
          </div>
          <div className="lg:col-span-7" data-reveal="fade">
            <div className="rounded-md border border-line bg-charcoal/50 p-4 sm:p-8">
              <PartnerDiagram className="h-auto w-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-charcoal/40 py-20 md:py-28" aria-labelledby="values-title">
        <div className="container-x">
          <p className="eyebrow" data-reveal>Merkessentie</p>
          <h2 id="values-title" className="mt-5 text-[length:var(--text-h2)] text-offwhite" data-reveal>Technische precisie. <span className="text-red">Zonder onnodige complexiteit.</span></h2>
          <ul className="mt-14 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <li key={v.title} className="bg-black p-8" data-reveal style={{ '--reveal-delay': i * 80 } as React.CSSProperties}>
                <Icon name={v.icon} size={40} strokeWidth={1.3} className="text-red" />
                <h3 className="mt-8 text-xl font-black tracking-wide text-offwhite uppercase">{v.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-mist">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line py-20 md:py-28" aria-labelledby="for-title">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5" data-reveal>
            <p className="eyebrow">Voor wie</p>
            <h2 id="for-title" className="mt-5 text-[length:var(--text-h2)] text-offwhite">Gebouwd voor technische teams.</h2>
          </div>
          <div className="lg:col-span-7" data-reveal>
            <ul className="flex flex-wrap gap-3">
              {audiences.map((a) => <li key={a} className="rounded-full border border-line-strong px-5 py-2.5 font-bold text-offwhite">{a}</li>)}
            </ul>
            <p className="mt-8 text-[length:var(--text-lead)] leading-relaxed text-mist">
              We werken primair voor opdrachtgevers in Nederland en breiden uit naar Europa. Of je nu één prototype nodig hebt of een terugkerende serie: je aanvraag krijgt dezelfde technische aandacht.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={href('contact')} variant="secondary" size="lg">Maak kennis</ButtonLink>
              <ButtonLink href={href('process')} variant="ghost" size="lg">Onze werkwijze</ButtonLink>
            </div>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
