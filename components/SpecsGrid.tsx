import { SPECS, SPECS_PLAN } from '@/lib/content';
import { Media } from './Media';
import { Reveal } from './Reveal';
import { SectionHeader } from './SectionHeader';

/**
 * 03 — the numbers.
 *
 * One strict grid: two columns on a phone, four from the small breakpoint
 * up. Eight specs divide evenly into both, so no row is ever left ragged
 * and every hairline lines up across the block.
 */
export function SpecsGrid() {
  return (
    <section id="specs" className="border-t border-black/10 bg-bone py-24 text-hull lg:py-36">
      <div className="shell">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <SectionHeader
            index="03"
            eyebrow="The numbers"
            title="De Assault in cijfers."
            tone="light"
            className="lg:col-span-5"
          />

          <Reveal delay={0.1} className="lg:col-span-7">
            <Media media={SPECS_PLAN} sizes="(max-width: 1024px) 100vw, 55vw" className="w-full" />
            {/* Measurement rule under the plan view. */}
            <div className="mt-4 flex items-center gap-3" aria-hidden="true">
              <span className="type-label text-mill">0</span>
              <div className="relative h-3 flex-1 border-t border-black/20">
                {Array.from({ length: 11 }).map((_, i) => (
                  <span
                    key={i}
                    className="absolute top-0 w-px bg-black/20"
                    style={{ left: `${i * 10}%`, height: i % 5 === 0 ? '12px' : '6px' }}
                  />
                ))}
              </div>
              <span className="type-label text-mill">5,00 m</span>
            </div>
          </Reveal>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-x-5 sm:grid-cols-4 lg:mt-24 lg:gap-x-10">
          {SPECS.map((spec, i) => (
            <Reveal
              key={spec.label}
              delay={Math.min(i, 6) * 0.04}
              y={18}
              className="flex flex-col border-t border-black/15 pb-7 pt-4 lg:pb-9 lg:pt-5"
            >
              {/* Two label lines are reserved, so a wrapping label never pushes
                  its value out of line with the rest of the row. */}
              <div className="flex min-h-[2.25rem] items-baseline justify-between gap-3">
                <dt className="type-label text-deck">{spec.label}</dt>
                <span className="type-label text-mill/70" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <dd className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.5rem,3.4vw,2.75rem)] font-bold leading-[0.95] tracking-[-0.03em] text-hull [font-variant-numeric:tabular-nums]">
                {spec.value}
              </dd>
              <span className="type-label mt-2 text-mill">{spec.unit}</span>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
