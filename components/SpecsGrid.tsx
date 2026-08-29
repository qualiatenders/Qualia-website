import { SPECS, SPECS_PLAN } from '@/lib/content';
import { Media } from './Media';
import { Reveal } from './Reveal';
import { SectionHeader } from './SectionHeader';

/**
 * 03 — the numbers.
 *
 * A specification grid, not a table: asymmetric spans, hairline rules,
 * large values against small engraved labels, and the plan render read as a
 * technical drawing above it.
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
            <div className="relative">
              <Media
                media={SPECS_PLAN}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="w-full bg-transparent"
              />
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
            </div>
          </Reveal>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-0 sm:grid-cols-6 lg:mt-24 lg:grid-cols-12 lg:gap-x-10">
          {SPECS.map((spec, i) => (
            <Reveal
              key={spec.label}
              delay={Math.min(i, 6) * 0.04}
              y={18}
              className={`col-span-1 border-t border-black/15 pb-8 pt-5 sm:col-span-3 ${spec.span}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <dt className="type-label text-deck">{spec.label}</dt>
                <span className="type-label text-mill/70" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <dd className="type-stat mt-4 flex flex-wrap items-baseline gap-x-2 text-hull">
                <span>{spec.value}</span>
                <span className="text-[0.32em] font-semibold uppercase tracking-[0.14em] text-mill">
                  {spec.unit}
                </span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
