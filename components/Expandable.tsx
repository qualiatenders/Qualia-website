import { EXPAND } from '@/lib/content';
import { Reveal } from './Reveal';

/**
 * Sluit sectie 02 af — bewust geen eigen genummerde sectie.
 *
 * Het verhaal ("koop wat je nu nodig hebt, breid later uit") hoort bij het
 * kiezen van een uitvoering, dus het staat eronder in plaats van ernaast.
 * Zo blijft de nummering 01–05 intact en groeit de navigatie niet.
 */
export function Expandable() {
  return (
    <div className="mt-24 border-t border-black/15 pt-12 lg:mt-32 lg:pt-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <span className="type-label text-deck">{EXPAND.eyebrow}</span>
          <h3 className="type-h3 mt-6">{EXPAND.title}</h3>
          <span className="rule-red mt-6" aria-hidden="true" />
          <p className="type-body mt-6 max-w-md text-deck">{EXPAND.body}</p>
        </Reveal>

        {/* Eén cel gap op een zwarte grid geeft haarlijnen tussen de stappen
            zonder per stap een border te hoeven zetten. */}
        <ol className="grid gap-px bg-black/15 sm:grid-cols-3 lg:col-span-7">
          {EXPAND.steps.map((step, i) => (
            <Reveal
              key={step.title}
              as="li"
              delay={0.08 + i * 0.07}
              className="bg-bone py-6 sm:px-6 sm:py-0 sm:first:pl-0"
            >
              <span className="type-label text-red">{String(i + 1).padStart(2, '0')}</span>
              <h4 className="mt-4 font-[family-name:var(--font-display)] text-[1.125rem] font-bold uppercase leading-[1.1] tracking-[-0.02em] text-hull">
                {step.title}
              </h4>
              <p className="type-body mt-2 text-deck">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>

      <Reveal
        delay={0.24}
        className="mt-12 flex flex-col gap-7 border-t border-black/15 pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-12 lg:mt-16"
      >
        <p className="type-body max-w-2xl text-mill">{EXPAND.note}</p>
        <a
          href={EXPAND.cta.href}
          target="_blank"
          rel="noreferrer"
          className="cut-tag flex shrink-0 items-center justify-center gap-3 bg-red px-6 py-4 type-label text-white transition-colors duration-300 hover:bg-red-hot"
        >
          {EXPAND.cta.label}
          <svg viewBox="0 0 16 12" className="h-3 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M0 6h14M9.5 1.5 14.5 6l-5 4.5" />
          </svg>
        </a>
      </Reveal>
    </div>
  );
}
