import { SectionHeader } from '../Section';
import { ArrowLink } from '../Button';
import { processSteps } from '@/lib/content/nl/process';
import { href } from '@/lib/i18n/routes';

export function Process() {
  return (
    <section className="relative overflow-hidden border-t border-line py-24 md:py-36" aria-labelledby="process-title">
      <div className="tech-grid absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden="true" />
      <div className="container-x">
        <SectionHeader
          index="03"
          eyebrow="Werkwijze"
          title={<span id="process-title">Van tekening tot levering, in vier stappen.</span>}
          intro="Geen automatische prijsberekening, maar een technische beoordeling door mensen die tekeningen lezen. Zo weet je vooraf waar je aan toe bent."
        />
        <ol className="relative mt-16 grid gap-10 md:mt-24 md:grid-cols-4 md:gap-8">
          <div className="absolute top-[1.375rem] right-0 left-0 hidden h-px bg-line-strong md:block" aria-hidden="true" />
          <div className="absolute top-[1.375rem] left-0 hidden h-px w-full origin-left bg-red md:block" data-reveal="line" style={{ '--reveal-delay': 200 } as React.CSSProperties} aria-hidden="true" />
          {processSteps.map((s, i) => (
            <li key={s.index} className="relative pl-16 md:pl-0" data-reveal style={{ '--reveal-delay': 150 + i * 140 } as React.CSSProperties}>
              <div className="absolute top-0 bottom-[-2.5rem] left-[1.375rem] w-px bg-line-strong md:hidden" aria-hidden="true" />
              <span className="absolute top-0 left-0 grid size-11 place-items-center rounded-full border border-red bg-black text-sm font-black text-offwhite md:relative">
                {s.index}
              </span>
              <h3 className="mt-0 text-xl font-black tracking-tight text-offwhite md:mt-8">{s.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{s.short}</p>
            </li>
          ))}
        </ol>
        <div className="mt-14 md:mt-20">
          <ArrowLink href={href('process')}>Meer over werkwijze & kwaliteit</ArrowLink>
        </div>
      </div>
    </section>
  );
}
