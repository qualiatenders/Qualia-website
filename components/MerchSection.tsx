import { MERCH } from '@/lib/content';
import { Media } from './Media';
import { Reveal } from './Reveal';
import { SectionHeader } from './SectionHeader';

/** 05 — the drop. Photography does the work; the copy stays out of the way. */
export function MerchSection() {
  return (
    <section id="merch" className="border-t border-white/10 bg-hull py-24 lg:py-36">
      <div className="shell">
        <SectionHeader index={MERCH.index} eyebrow="Merch" title={MERCH.drop} className="max-w-xl" />

        <div className="mt-12 grid grid-cols-2 gap-3 lg:mt-16 lg:grid-cols-3 lg:gap-4">
          {MERCH.media.map((item, i) => (
            <Reveal key={item.slot + i} delay={Math.min(i, 3) * 0.07}>
              <Media media={item} sizes="(max-width: 1024px) 50vw, 32vw" hoverZoom />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
