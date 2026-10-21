import 'server-only';
import { isPlacementId, type PlacementId } from './placements';
import type { Creative } from './types';

/**
 * Direct-sold ads, managed in WordPress (GeoInformatics → Campaigns).
 * The plugin's /gi/v1/ads endpoint returns every creative that is active
 * right now (status, flight dates); this module filters by placement and
 * desk. One cached request serves all slots on a page.
 *
 * Without WordPress, the slots carry GeoInformatics house promotions so the
 * layout can be reviewed — never invented third-party advertisers.
 */

type ServerCreative = Creative & { url: string; categories: string[] };

type WpCreative = {
  id: number;
  campaign_id: number;
  advertiser: string;
  placement: string;
  image: string;
  image_mobile?: string;
  alt?: string;
  url: string;
  priority?: number;
  categories?: string[];
};

const house: ServerCreative[] = [
  { id: 'house-advertise', campaignId: 'house', advertiser: 'GeoInformatics', placement: 'home-leaderboard', image: '', alt: 'Advertise with GeoInformatics', priority: 1, house: 'advertise', url: '/advertise/', categories: [] },
  { id: 'house-newsletter-side', campaignId: 'house', advertiser: 'GeoInformatics', placement: 'sidebar-rectangle', image: '', alt: 'Subscribe to the GeoInformatics newsletter', priority: 1, house: 'newsletter', url: '/newsletter/', categories: [] },
  { id: 'house-advertise-half', campaignId: 'house', advertiser: 'GeoInformatics', placement: 'article-halfpage', image: '', alt: 'Advertise with GeoInformatics', priority: 1, house: 'advertise', url: '/advertise/', categories: [] },
];

export async function allActiveCreatives(): Promise<ServerCreative[]> {
  const wp = process.env.WORDPRESS_URL?.replace(/\/$/, '');
  if (!wp) return process.env.ADS_HOUSE_PREVIEW === 'false' ? [] : house;
  try {
    const res = await fetch(`${wp}/wp-json/gi/v1/ads`, { next: { revalidate: 60, tags: ['ads'] } });
    if (!res.ok) return [];
    const rows = (await res.json()) as WpCreative[];
    return rows
      .filter((r) => isPlacementId(r.placement) && r.image && r.url)
      .map((r) => ({
        id: String(r.id),
        campaignId: String(r.campaign_id),
        advertiser: r.advertiser,
        placement: r.placement as PlacementId,
        image: r.image,
        imageMobile: r.image_mobile || undefined,
        alt: r.alt || `Advertisement: ${r.advertiser}`,
        priority: Math.min(10, Math.max(1, r.priority ?? 5)),
        url: r.url,
        categories: r.categories ?? [],
      }));
  } catch {
    // Ads must never take a page down.
    return [];
  }
}

/** Creatives for one slot. Category-targeted creatives only show on their desks. */
export async function creativesFor(placement: PlacementId, category?: string): Promise<Creative[]> {
  const all = await allActiveCreatives();
  return all
    .filter((c) => c.placement === placement && (!c.categories.length || (category && c.categories.includes(category))))
    .map(({ url: _url, categories: _c, ...pub }) => pub);
}

export async function destinationFor(creativeId: string) {
  const all = await allActiveCreatives();
  return all.find((c) => c.id === creativeId) ?? null;
}
