import { NewsletterForm } from '../NewsletterForm';

/** Newsletter conversion band. Large type, one field, nothing else to decide. */
export function NewsletterBand({ source = 'home' }: { source?: string }) {
  return (
    <section aria-labelledby="nl-title" className="relative overflow-hidden bg-red text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:4.5rem_4.5rem]" />
      <div className="shell relative grid gap-10 py-16 lg:grid-cols-12 lg:items-end lg:gap-12 lg:py-24">
        <div className="lg:col-span-7" data-reveal>
          <p className="kicker text-white">The GeoInformatics newsletter</p>
          <h2 id="nl-title" className="mt-5 font-display text-[clamp(2.4rem,1.2rem+4.6vw,5.75rem)] leading-[1] font-medium tracking-[-0.02em]">
            The world of geospatial. Delivered.
          </h2>
        </div>
        <div className="lg:col-span-5" data-reveal style={{ ['--reveal-delay' as string]: '120ms' }}>
          <p className="mb-6 text-lg leading-relaxed text-white">The stories that matter across surveying, mapping, Earth observation and GeoAI — curated by our editors, in one concise briefing. Free.</p>
          <div className="[&_.btn-red]:bg-ink [&_.btn-red:hover]:bg-graphite [&_input]:border-white/40 [&_input]:bg-white/10 [&_label]:text-white [&_.text-fog]:text-white [&_[role=alert]]:text-white">
            <NewsletterForm source={source} size="lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
