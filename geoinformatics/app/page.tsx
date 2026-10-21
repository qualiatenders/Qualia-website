import Link from 'next/link';
import { content } from '@/lib/content';
import { intelligenceKinds } from '@/lib/taxonomy';
import type { Article } from '@/lib/types';
import { Ticker } from '@/components/Ticker';
import { Hero } from '@/components/home/Hero';
import { LatestTeaser } from '@/components/home/LatestTeaser';
import { NewsGlobe } from '@/components/home/NewsGlobe';
import { Intelligence } from '@/components/home/Intelligence';
import { IndustriesStrip } from '@/components/home/IndustriesStrip';
import { NewsletterBand } from '@/components/home/NewsletterBand';
import { AdvertiseBand } from '@/components/home/AdvertiseBand';
import { EventList, sortEvents } from '@/components/EventList';
import { AdSlot } from '@/components/ads/AdSlot';
import { Icon } from '@/components/Icon';

export const revalidate = 300;

/**
 * The homepage is a front page, not an archive: every block is a short,
 * curiosity-driven teaser with one clear way through to its own page
 * (latest, news map, analysis, industries, events). Three ad positions only:
 * billboard under the hero, rectangle beside Most read, one leaderboard
 * between Intelligence and the industries.
 */
export default async function HomePage() {
  const [featured, latest, breaking, mostRead, intel, events, desks] = await Promise.all([
    content.featured(),
    content.list({ perPage: 40 }),
    content.breaking(),
    content.mostRead(5),
    content.list({ perPage: 4, kinds: intelligenceKinds }),
    content.events(),
    content.categories(),
  ]);

  // Lead and secondaries come from the editors' choices; the newest editorial stories fill any gap.
  const editorial = latest.items.filter((a) => !a.sponsored);
  const used = new Set<string>();
  const take = (a: Article | undefined) => (a && !used.has(a.id) ? (used.add(a.id), a) : undefined);
  const lead = take(featured.find((a) => a.featured === 'lead')) ?? take(editorial[0])!;
  const secondary = [...featured.filter((a) => a.featured === 'secondary').map(take), ...editorial.map((a) => (used.size < 3 ? take(a) : undefined))]
    .filter((a): a is Article => Boolean(a))
    .slice(0, 2);
  const headlines = latest.items.filter((a) => !used.has(a.id)).slice(0, 5);
  headlines.forEach((a) => used.add(a.id));
  const teaser = latest.items.filter((a) => !used.has(a.id)).slice(0, 6);
  const intelItems = intel.items.filter((a) => a.id !== lead.id).slice(0, 3);

  const counts = Object.fromEntries(await Promise.all(desks.map(async (c) => [c.slug, (await content.list({ category: c.slug, perPage: 1 })).total] as const)));

  const ticker = breaking.length
    ? { mode: 'breaking' as const, items: breaking }
    : { mode: 'latest' as const, items: latest.items.slice(0, 8).map((a) => ({ id: a.id, title: a.title, path: a.path, live: false })) };
  const upcoming = sortEvents(events).slice(0, 3);

  return (
    <>
      <Ticker items={ticker.items} mode={ticker.mode} />
      {lead && <Hero lead={lead} secondary={secondary} headlines={headlines} desks={desks} />}

      <AdSlot placement="home-takeover" className="bg-ink pb-10" />

      <LatestTeaser items={teaser} total={latest.total} mostRead={mostRead} />

      <NewsGlobe articles={latest.items} variant="teaser" />

      <Intelligence items={intelItems} compact />

      <AdSlot placement="home-leaderboard" className="surface-white border-b border-line py-10" />

      <IndustriesStrip desks={desks} counts={counts} />

      {upcoming.length > 0 && (
        <section aria-labelledby="events-title" className="surface-paper py-14 lg:py-20">
          <div className="shell grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="kicker text-accent">Industry calendar</p>
              <h2 id="events-title" className="mt-2 font-sans text-[clamp(1.6rem,1.2rem+1.4vw,2.5rem)] font-extrabold tracking-[-0.01em] uppercase">
                Where to be next
              </h2>
              <p className="mt-4 max-w-sm">Conferences, expos and summits where the geospatial industry meets.</p>
              <Link href="/events/" className="group btn btn-dark mt-6">
                Full events calendar <Icon name="arrow" className="arrow size-4" />
              </Link>
            </div>
            <div className="lg:col-span-8">
              <div className="[&_li:nth-child(3)]:max-sm:hidden">
                <EventList events={upcoming} compact />
              </div>
            </div>
          </div>
        </section>
      )}

      <NewsletterBand />
      <AdvertiseBand />
    </>
  );
}
