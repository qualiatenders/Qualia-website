import Link from 'next/link';
import { content } from '@/lib/content';
import { intelligenceKinds } from '@/lib/taxonomy';
import type { Article } from '@/lib/types';
import { Ticker } from '@/components/Ticker';
import { Hero } from '@/components/home/Hero';
import { Intelligence } from '@/components/home/Intelligence';
import { Industries } from '@/components/home/Industries';
import { DeskBlocks } from '@/components/home/DeskBlocks';
import { NewsletterBand } from '@/components/home/NewsletterBand';
import { AdvertiseBand } from '@/components/home/AdvertiseBand';
import { LatestFeed } from '@/components/LatestFeed';
import { Trending } from '@/components/Trending';
import { SectionHeading } from '@/components/SectionHeading';
import { EventList, sortEvents } from '@/components/EventList';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 300;

const FEED = 9;

export default async function HomePage() {
  const [featured, latest, breaking, mostRead, intel, events, desks] = await Promise.all([
    content.featured(),
    content.list({ perPage: 30 }),
    content.breaking(),
    content.mostRead(5),
    content.list({ perPage: 5, kinds: intelligenceKinds }),
    content.events(),
    content.categories(),
  ]);

  // Lead and secondaries come from the editors' choices; the newest editorial stories fill any gap.
  const editorial = latest.items.filter((a) => !a.sponsored);
  const used = new Set<string>();
  const take = (a: Article | undefined) => (a && !used.has(a.id) ? (used.add(a.id), a) : undefined);
  const lead = take(featured.find((a) => a.featured === 'lead')) ?? take(editorial[0])!;
  const secondary = [
    ...featured.filter((a) => a.featured === 'secondary').map(take),
    ...editorial.map((a) => (used.size < 3 ? take(a) : undefined)),
  ]
    .filter((a): a is Article => Boolean(a))
    .slice(0, 2);
  const headlines = latest.items.filter((a) => !used.has(a.id)).slice(0, 6);
  headlines.forEach((a) => used.add(a.id));

  const feedExclude = [...used];
  const feed = latest.items.filter((a) => !used.has(a.id)).slice(0, FEED);
  const intelItems = intel.items.filter((a) => a.id !== lead.id);

  const perDesk = await Promise.all(desks.map(async (c) => ({ desk: c, items: (await content.list({ category: c.slug, perPage: 4 })).items })));
  const deskLatest = Object.fromEntries(perDesk.map((d) => [d.desk.slug, d.items[0]]));
  // The four busiest desks get their own block on the homepage.
  const deskBlocks = [...perDesk].sort((a, b) => b.items.length - a.items.length).slice(0, 4);

  const ticker = breaking.length
    ? { mode: 'breaking' as const, items: breaking }
    : { mode: 'latest' as const, items: latest.items.slice(0, 8).map((a) => ({ id: a.id, title: a.title, path: a.path, live: false })) };

  return (
    <>
      <Ticker items={ticker.items} mode={ticker.mode} />
      {lead && <Hero lead={lead} secondary={secondary} headlines={headlines} desks={desks} />}

      <AdSlot placement="home-takeover" className="bg-ink pb-10" />

      <section aria-labelledby="latest-title" className="surface-paper py-14 lg:py-20">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          <div className="min-w-0 lg:col-span-8">
            <SectionHeading index="01" id="latest-title" title="Latest news" href="/latest/" linkLabel="All news" />
            <LatestFeed initial={feed} totalPages={Math.ceil(Math.max(0, latest.total - feedExclude.length) / FEED)} categories={desks} perPage={FEED} exclude={feedExclude} />
          </div>
          <div className="lg:col-span-4">
            <div className="space-y-10 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              <Trending items={mostRead} />
              <AdSlot placement="sidebar-rectangle" />
            </div>
          </div>
        </div>
      </section>

      <AdSlot placement="home-leaderboard" className="surface-paper border-t border-line py-10" />

      <Intelligence items={intelItems} />

      <DeskBlocks blocks={deskBlocks} />

      <Industries desks={desks} latest={deskLatest} />

      {events.length > 0 && (
        <section aria-labelledby="events-title" className="surface-paper py-16 lg:py-24">
          <div className="shell grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHeading index="05" id="events-title" title="Events" />
              <p className="max-w-sm text-fg-muted" data-reveal>
                Conferences, expos and summits where the geospatial industry meets. Organising one? Tell our editors.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/events/" className="group btn btn-dark">
                  Full calendar <span className="arrow" aria-hidden="true">→</span>
                </Link>
                <Link href="/contact/?topic=event" className="btn btn-outline">
                  Submit an event
                </Link>
              </div>
            </div>
            <div className="lg:col-span-8">
              <EventList events={sortEvents(events).slice(0, 5)} compact />
            </div>
          </div>
        </section>
      )}

      <NewsletterBand />
      <AdvertiseBand />
    </>
  );
}
