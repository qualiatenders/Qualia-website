import type { Visual } from '@/lib/types';
import { GeoArt } from './GeoArt';
import { Breadcrumbs } from './Breadcrumbs';

/** Dark page opener used by section and utility pages. */
export function PageHero({
  kicker,
  title,
  intro,
  crumbs,
  visual,
  code,
  children,
}: {
  kicker?: string;
  title: string;
  intro?: string;
  crumbs?: { name: string; path: string }[];
  visual?: Visual;
  code?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-ink pt-8 pb-12 lg:pt-12 lg:pb-16">
      {visual && (
        <div aria-hidden="true" className="absolute inset-y-0 right-0 w-full opacity-55 [mask-image:linear-gradient(to_right,transparent,black_55%)] lg:w-2/3">
          <GeoArt visual={visual} seed={title} className="size-full" />
        </div>
      )}
      <div className="shell relative">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div className="mt-10 max-w-4xl lg:mt-16" data-reveal>
          {kicker && (
            <p className="kicker flex items-center gap-3 text-red-ink">
              <span className="rule-red" aria-hidden="true" />
              {kicker}
            </p>
          )}
          <h1 className="mt-5 font-display text-mega leading-[0.9] font-semibold tracking-[-0.02em]">
            {code && <span className="mr-4 align-top font-mono text-base font-normal tracking-[0.1em] text-red-ink">{code}</span>}
            {title}
          </h1>
          {intro && <p className="mt-6 max-w-2xl text-lead leading-relaxed text-fog">{intro}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
