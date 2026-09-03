import { SPECS } from '@/lib/content';
import { Reveal } from './Reveal';

/**
 * De specificaties als compact raster, voor de productpagina's.
 *
 * Acht specs delen gelijk door twee en vier kolommen, dus geen rij blijft
 * rafelig achter. Een dl is hier het juiste element: het zijn paren van een
 * naam en een waarde, geen tabel met assen.
 */
export function SpecList({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const rand = tone === 'dark' ? 'border-white/15' : 'border-black/15';
  const waarde = tone === 'dark' ? 'text-bone' : 'text-hull';
  const label = tone === 'dark' ? 'text-mill' : 'text-deck';

  return (
    <dl className="mt-12 grid grid-cols-2 gap-x-5 sm:grid-cols-4 lg:mt-16 lg:gap-x-10">
      {SPECS.map((spec, i) => (
        <Reveal key={spec.label} delay={Math.min(i, 6) * 0.04} y={18} className={`flex flex-col border-t ${rand} pb-7 pt-4`}>
          {/* Twee labelregels gereserveerd, zodat een omslaand label zijn
              waarde niet uit de lijn van de rij duwt. */}
          <div className="flex min-h-[2.25rem] items-baseline justify-between gap-3">
            <dt className={`type-label ${label}`}>{spec.label}</dt>
            <span className="type-label text-mill/70" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
          </div>
          <dd
            className={`mt-4 font-[family-name:var(--font-display)] text-[clamp(1.5rem,3.4vw,2.5rem)] font-bold leading-[0.95] tracking-[-0.03em] ${waarde} [font-variant-numeric:tabular-nums]`}
          >
            {spec.value}
          </dd>
          <span className="type-label mt-2 text-mill">{spec.unit}</span>
        </Reveal>
      ))}
    </dl>
  );
}
