import Link from 'next/link';
import { Magnetic } from '../Motion';
import { Icon } from '../Icon';

/** Quiet commercial band: present, professional, never louder than the news. */
export function AdvertiseBand() {
  return (
    <section aria-labelledby="adv-title" className="surface-paper border-t border-line py-16 lg:py-24">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-8" data-reveal>
          <p className="kicker flex items-center gap-3 text-accent">
            <span className="rule-red" aria-hidden="true" /> For brands &amp; partners
          </p>
          <h2 id="adv-title" className="mt-5 font-display text-[clamp(2rem,1.2rem+2.8vw,4rem)] leading-[0.95] font-semibold tracking-[-0.045em] uppercase">
            Reach the people shaping the geospatial industry.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-fg-muted">
            Display, sponsored content, newsletter and event partnerships — placed alongside independent journalism read by engineers, surveyors, researchers and decision-makers.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col lg:items-end" data-reveal style={{ ['--reveal-delay' as string]: '120ms' }}>
          <Magnetic>
            <Link href="/advertise/" className="group btn btn-dark min-h-14 px-7 text-base">
              Advertise with GeoInformatics <Icon name="arrow" className="arrow size-4" />
            </Link>
          </Magnetic>
          <a href="/media-kit.pdf" className="group btn btn-outline min-h-14 px-7 text-base">
            <Icon name="download" className="size-4" /> Download the media kit
          </a>
        </div>
      </div>
    </section>
  );
}
