import { content } from '@/lib/content';
import { intelligenceKinds } from '@/lib/taxonomy';
import type { Article } from '@/lib/types';
import { Ticker } from '@/components/Ticker';
import { TopStories, DeskGrid, MostReadRow, AnalysisRow, RadarRow, ModulesRow } from '@/components/front/Front';
import { NewsGlobe } from '@/components/home/NewsGlobe';
import { sortEvents } from '@/components/EventList';
import { AdSlot } from '@/components/ads/AdSlot';
import { briefing } from '@/lib/briefings';

export const revalidate = 300;


/**
 * The homepage is a newspaper front: top stories with a live newswire, then
 * every desk with its own block, most read, analysis, products and deals.
 * Ads sit between sections, never inside the news blocks: a billboard after
 * the top stories, a leaderboard mid-page and a rectangle beside the lists.
 */
export default async function HomePage() {
  const [featured, latest, breaking, mostRead, intel, events, desks] = await Promise.all([
    content.featured(),
    content.list({ perPage: 60 }),
    content.breaking(),
    content.mostRead(5),
    content.list({ perPage: 8, kinds: intelligenceKinds }),
    content.events(),
    content.categories(),
  ]);

  const editorial = latest.items.filter((a) => !a.sponsored);
  const used = new Set<string>();
  const take = (a: Article | undefined) => (a && !used.has(a.id) ? (used.add(a.id), a) : undefined);
  const lead = take(featured.find((a) => a.featured === 'lead')) ?? take(editorial[0])!;
  const side: Article[] = [];
  for (const a of [...featured.filter((f) => f.featured === 'secondary'), ...editorial]) {
    if (side.length === 2) break;
    const t = take(a);
    if (t) side.push(t);
  }
  const related = editorial.filter((a) => !used.has(a.id) && a.category.slug === lead.category.slug).slice(0, 2);
  related.forEach((a) => used.add(a.id));
  // The newswire is strictly chronological and may repeat a top story: it is the clock of the site.
  const river = latest.items.slice(0, 9);

  const blocks = desks.map((desk) => ({ desk, items: latest.items.filter((a) => a.category.slug === desk.slug && !used.has(a.id)).slice(0, 4) }));
  blocks.sort((a, b) => b.items.length - a.items.length);

  const analysis = intel.items.filter((a) => a.id !== lead.id).slice(0, 4);
  const [launches, deals] = await Promise.all([briefing('products', 5), briefing('deals', 5)]);

  const located = latest.items.filter((a) => a.location);
  const ticker = breaking.length
    ? { mode: 'breaking' as const, items: breaking }
    : { mode: 'latest' as const, items: latest.items.slice(0, 8).map((a) => ({ id: a.id, title: a.title, path: a.path, live: false })) };

  return (
    <>
      <Ticker items={ticker.items} mode={ticker.mode} />
      <TopStories lead={lead} side={side} related={related} river={river} />
      <AdSlot placement="home-takeover" className="bg-ink pb-10" />
      <MostReadRow items={mostRead} />
      <DeskGrid blocks={blocks} />
      <AdSlot placement="home-leaderboard" className="surface-paper border-y border-line py-10" />
      <AnalysisRow items={analysis} />
      <RadarRow launches={launches} deals={deals} />
      <ModulesRow
        mapCount={Math.min(located.length, 20)}
        places={new Set(located.slice(0, 20).map((a) => a.location!.name)).size}
        events={sortEvents(events).slice(0, 3)}
        mapSlot={<NewsGlobe articles={latest.items} variant="mini" />}
      />
    </>
  );
}
