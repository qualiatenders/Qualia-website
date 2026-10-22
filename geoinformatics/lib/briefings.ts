import { content } from '@/lib/content';
import type { Article } from '@/lib/types';

/**
 * Product launches and deals are editorial lists. In WordPress the desk tags
 * stories with `product-launch` or `deal`; until a tag has stories, the list
 * falls back to recognising them from the headline.
 */
export const briefings = {
  products: { tag: 'product-launch', match: /\b(launch|launches|introduces|unveils|releases|debuts|new\b|preview|available)/i },
  deals: { tag: 'deal', match: /\b(acquire|acquires|acquisition|partner|partnership|contract|agreement|collaborat|selects|selected|awarded|joins|integrat|elevated)/i },
} as const;

export type BriefingKind = keyof typeof briefings;

export async function briefing(kind: BriefingKind, limit = 60): Promise<Article[]> {
  const b = briefings[kind];
  const tagged = await content.list({ tag: b.tag, perPage: limit });
  if (tagged.items.length) return tagged.items;
  const recent = (await content.list({ perPage: 100 })).items.filter((a) => !a.sponsored);
  const other = briefings[kind === 'products' ? 'deals' : 'products'].match;
  // A headline that is clearly a deal is not also a product launch.
  return recent.filter((a) => b.match.test(a.title) && (kind === 'deals' || !other.test(a.title))).slice(0, limit);
}

/** Every tag used in recent coverage, with how often it appears. */
export async function topics(): Promise<{ slug: string; name: string; count: number }[]> {
  const recent = (await content.list({ perPage: 100 })).items;
  const map = new Map<string, { slug: string; name: string; count: number }>();
  for (const a of recent) for (const t of a.tags) map.set(t.slug, { ...t, count: (map.get(t.slug)?.count ?? 0) + 1 });
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}
