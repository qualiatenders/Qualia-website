import { SectionHeader } from '../Section';
import { ArrowLink } from '../Button';
import { TechnicalDrawing } from '../TechnicalDrawing';
import { qualityPoints } from '@/lib/content/nl/process';
import { href } from '@/lib/i18n/routes';

export function Quality() {
  return (
    <section className="relative border-t border-line py-24 md:py-36" aria-labelledby="quality-title">
      <div className="container-x grid gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <SectionHeader index="05" eyebrow="Kwaliteit & technische expertise" title={<span id="quality-title">Tekeningen en toleranties eerst.</span>} className="lg:!grid-cols-1" />
          <p className="mt-6 max-w-xl text-[length:var(--text-lead)] leading-relaxed text-mist" data-reveal>
            Kwaliteit begint vóór de productie: bij een volledige tekening, heldere afspraken en de juiste vragen. Afspraak is afspraak.
          </p>
          <dl className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {qualityPoints.map((q, i) => (
              <div key={q.title} className="border-t border-line pt-5" data-reveal style={{ '--reveal-delay': i * 60 } as React.CSSProperties}>
                <dt className="flex items-center gap-3 font-black text-offwhite">
                  <span className="h-0.5 w-4 bg-red" aria-hidden="true" />
                  {q.title}
                </dt>
                <dd className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted">{q.text}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-12">
            <ArrowLink href={href('process')}>Zo borgen we kwaliteit</ArrowLink>
          </div>
        </div>
        <div className="lg:col-span-6 lg:pl-6">
          <div className="sticky top-[calc(var(--header-h)+2rem)] rounded-md border border-line bg-charcoal/60 p-3 sm:p-5">
            <TechnicalDrawing className="h-auto w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
