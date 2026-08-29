import { MERCH } from '@/lib/content';
import { Media } from './Media';
import { Reveal } from './Reveal';

/** 05 — merch. Two words and three frames. Nothing else. */
export function MerchSection() {
  return (
    <section id="merch" className="border-t border-white/10 bg-hull py-24 lg:py-36">
      <div className="shell">
        <Reveal className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4">
          <h2 className="type-display text-bone">
            {MERCH.wordmark}
            <span className="align-super text-[0.18em] text-red">&reg;</span>
          </h2>
          <p className="type-label text-mill">{MERCH.drop}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-4 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {MERCH.media.map((item, i) => (
            <Reveal
              key={item.slot}
              delay={i * 0.08}
              className={i === 2 ? 'col-span-2 lg:col-span-1' : ''}
            >
              <Media media={item} sizes="(max-width: 1024px) 50vw, 32vw" hoverZoom />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
