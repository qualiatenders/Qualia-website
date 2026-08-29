import { PRICE_CTA } from '@/lib/content';
import { ArrowLink } from './ArrowLink';
import { Reveal } from './Reveal';

/** The conversion block. Red earns its weight here by being the only colour. */
export function PriceListCTA() {
  return (
    <section id="prijslijst" className="relative overflow-hidden border-t border-red/40 bg-hull py-24 lg:py-32">
      {/* A single wash of red, kept far from saturation. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(192,39,44,0.22),transparent_70%)]"
      />

      <div className="shell relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Reveal>
            <p className="type-label text-mill">{PRICE_CTA.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.08} className="mt-6">
            <h2 className="type-display text-bone">{PRICE_CTA.title}</h2>
          </Reveal>
        </div>

        <Reveal delay={0.14} className="lg:max-w-sm lg:pb-4">
          <p className="type-body text-mill">{PRICE_CTA.body}</p>
          <ArrowLink href={PRICE_CTA.cta.href} className="mt-7">
            {PRICE_CTA.cta.label}
          </ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}
