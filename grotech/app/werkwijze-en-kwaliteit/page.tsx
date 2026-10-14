import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';
import { CtaBand } from '@/components/CtaBand';
import { ButtonLink } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { TechnicalDrawing } from '@/components/TechnicalDrawing';
import { processSteps, qualityPoints } from '@/lib/content/nl/process';
import { uploadLimits } from '@/lib/quote/options';
import { href, quoteHref } from '@/lib/i18n/routes';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Werkwijze & kwaliteit',
  description: 'Van tekening tot levering: technische beoordeling, heldere offerte, proefexemplaar bij series en controle volgens afspraak. Zo werkt GROTECH.',
  path: href('process'),
});

const checklist = [
  'Een 3D-model (STEP/STP) en/of een volledig bemaatte 2D-tekening (PDF)',
  'Materiaal en, indien bekend, de gewenste kwaliteit',
  'Aantallen per onderdeel en verwachte herhaalorders',
  'Toleranties, passingen en ruwheidseisen op de tekening',
  'Oppervlaktebehandeling of nabewerking',
  'Gewenste leverdatum en afleveradres',
  'Eventuele eisen aan documentatie, zoals meetrapporten of materiaalcertificaten',
];

export default function ProcessPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: 'Home', path: '/' }, { name: 'Werkwijze & kwaliteit', path: href('process') }]}
        eyebrow="Werkwijze & kwaliteit"
        title={<>Precisie in elke stap<span className="text-red">.</span></>}
        lead="Een goede productie begint bij een goede aanvraag. We beoordelen elke tekening technisch, maken heldere afspraken en controleren volgens die afspraken. Geen automatische prijzen, wel duidelijkheid vooraf."
        actions={<ButtonLink href={quoteHref()} size="lg" icon="upload">Start een aanvraag</ButtonLink>}
      />

      <section className="py-20 md:py-28" aria-labelledby="steps-title">
        <div className="container-x">
          <h2 id="steps-title" className="sr-only">Van tekening tot levering</h2>
          <ol className="relative">
            {processSteps.map((s, i) => (
              <li key={s.index} className="relative grid gap-6 border-t border-line py-10 md:grid-cols-12 md:py-14" data-reveal>
                <div className="md:col-span-2">
                  <span className="text-5xl font-black text-red md:text-6xl">{s.index}</span>
                </div>
                <div className="md:col-span-4">
                  <h3 className="text-2xl font-black text-offwhite md:text-3xl">{s.title}</h3>
                  <p className="mt-3 font-bold text-mist">{s.short}</p>
                </div>
                <div className="md:col-span-6">
                  <p className="text-mist">{s.detail}</p>
                  {i === 0 && (
                    <p className="mt-4 text-[0.9375rem] text-muted">
                      Ondersteunde formaten: {uploadLimits.extensions.map((e) => e.toUpperCase()).join(', ')}. Maximaal {uploadLimits.maxFiles} bestanden, {uploadLimits.maxFileBytes / 1024 / 1024} MB per bestand.
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-line bg-charcoal/40 py-20 md:py-28" aria-labelledby="q-title">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow" data-reveal>Kwaliteit</p>
            <h2 id="q-title" className="mt-5 text-[length:var(--text-h2)] text-offwhite" data-reveal>Afspraak is afspraak.</h2>
            <p className="mt-6 text-[length:var(--text-lead)] leading-relaxed text-mist" data-reveal>
              Kwaliteit is geen sticker, maar een reeks concrete afspraken. We leggen vooraf vast wat er geproduceerd wordt, hoe het wordt gecontroleerd en wat je ontvangt.
            </p>
            <div className="mt-10 rounded-md border border-line bg-black p-3" data-reveal>
              <TechnicalDrawing className="h-auto w-full" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <ul className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
              {qualityPoints.map((q, i) => (
                <li key={q.title} className="bg-black p-7" data-reveal style={{ '--reveal-delay': i * 60 } as React.CSSProperties}>
                  <span className="font-mono text-xs text-red">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-3 text-lg font-black text-offwhite">{q.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-mist">{q.text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-3 rounded-md border border-line p-6 text-[0.9375rem] text-mist" data-reveal>
              <Icon name="info" size={20} className="mt-0.5 shrink-0 text-red" />
              <p>
                Heeft je project specifieke eisen — zoals een bepaalde norm, certificering, meetrapport of materiaalcertificaat? Vermeld dit in je aanvraag. We bevestigen per opdracht wat we kunnen leveren en noemen geen certificeringen die niet op jouw opdracht van toepassing zijn.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-20 md:py-28" aria-labelledby="check-title">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5" data-reveal>
            <p className="eyebrow">Checklist</p>
            <h2 id="check-title" className="mt-5 text-[length:var(--text-h2)] text-offwhite">Een complete aanvraag in één keer.</h2>
            <p className="mt-5 text-mist">Hoe completer je aanvraag, hoe sneller en nauwkeuriger de offerte. Ontbreekt er iets? Geen probleem — dan vragen we het na.</p>
          </div>
          <ul className="space-y-0 border-t border-line lg:col-span-7" data-reveal>
            {checklist.map((c) => (
              <li key={c} className="flex gap-4 border-b border-line py-4 text-offwhite">
                <span className="grid size-6 shrink-0 place-items-center rounded-sm border border-red text-red"><Icon name="check" size={14} strokeWidth={2.4} /></span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
