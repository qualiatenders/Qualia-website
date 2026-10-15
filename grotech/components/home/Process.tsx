import { processSteps } from '@/lib/content/nl/process';

export function Process() {
  return (
    <section id="werkwijze" className="theme-light bg-tint scroll-mt-20 py-20 md:py-28" aria-labelledby="process-title">
      <div className="container-x">
        <div className="max-w-2xl" data-reveal>
          <p className="eyebrow">Werkwijze</p>
          <h2 id="process-title" className="mt-5 text-[length:var(--text-h2)]">Van tekening tot levering.</h2>
          <p className="mt-5 text-mist">Geen automatische prijs, maar een technische beoordeling door mensen die tekeningen lezen. Zo weet je vooraf waar je aan toe bent.</p>
        </div>
        <ol className="relative mt-12 grid gap-8 md:mt-16 md:grid-cols-4 md:gap-6">
          <div className="absolute top-[1.375rem] right-0 left-0 hidden h-px bg-line-strong md:block" aria-hidden="true" />
          <div className="absolute top-[1.375rem] left-0 hidden h-px w-full origin-left bg-red md:block" data-reveal="line" aria-hidden="true" />
          {processSteps.map((s, i) => (
            <li key={s.index} className="relative pl-16 md:pl-0" data-reveal style={{ '--reveal-delay': 120 + i * 120 } as React.CSSProperties}>
              <span className="absolute top-0 left-0 grid size-11 place-items-center rounded-full border border-red bg-black text-sm font-black md:relative">{s.index}</span>
              <h3 className="text-lg font-black md:mt-6">{s.title}</h3>
              <p className="mt-2 text-[0.9375rem] text-mist">{s.short}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
