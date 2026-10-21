/**
 * Ad placement registry — the single source of truth for every slot on the
 * site. The WordPress plugin, the media kit PDF and the Advertise page all
 * read from this list (the plugin via /api/ads/placements), so adding a slot
 * here makes it bookable everywhere.
 *
 * Sizes are the creative sizes advertisers deliver. On screen each slot
 * scales down proportionally inside its column, and its space is reserved
 * before the creative loads (no layout shift).
 */

export type Size = { w: number; h: number };

export type Placement = {
  id: string;
  name: string;
  format: string;
  where: string;
  desktop: Size;
  /** Creative for screens below 768px. Omit to hide the slot on mobile. */
  mobile?: Size;
  /** Desktop-only slots are hidden below 1024px. */
  desktopOnly?: boolean;
  premium?: boolean;
};

export const placements = [
  {
    id: 'home-takeover',
    name: 'Homepage Premium Takeover',
    format: 'Custom billboard',
    where: 'Full-width billboard directly below the homepage hero. One advertiser per day; exclusive.',
    desktop: { w: 1600, h: 400 },
    mobile: { w: 320, h: 100 },
    premium: true,
  },
  {
    id: 'home-leaderboard',
    name: 'Desktop Leaderboard',
    format: '970 × 250',
    where: 'Between the latest news feed and the Intelligence section on the homepage.',
    desktop: { w: 970, h: 250 },
    mobile: { w: 320, h: 100 },
  },
  {
    id: 'site-leaderboard',
    name: 'Standard Leaderboard',
    format: '728 × 90',
    where: 'Below the navigation on article, category and latest-news pages.',
    desktop: { w: 728, h: 90 },
    mobile: { w: 320, h: 100 },
  },
  {
    id: 'sidebar-rectangle',
    name: 'Sidebar Rectangle',
    format: '300 × 250',
    where: 'Right column of the homepage feed, category pages and articles.',
    desktop: { w: 300, h: 250 },
    mobile: { w: 300, h: 250 },
  },
  {
    id: 'article-halfpage',
    name: 'Half Page',
    format: '300 × 600',
    where: 'Sticky right column alongside the article body. Desktop only.',
    desktop: { w: 300, h: 600 },
    desktopOnly: true,
  },
  {
    id: 'article-inline',
    name: 'In-Article Advertisement',
    format: 'Responsive · 640 × 360 / 300 × 250',
    where: 'Inside long articles, after the third paragraph. Clearly labelled; never interrupts a heading or quote.',
    desktop: { w: 640, h: 360 },
    mobile: { w: 300, h: 250 },
  },
  {
    id: 'article-end',
    name: 'End-of-Article Leaderboard',
    format: '728 × 90',
    where: 'After the article body, before related stories.',
    desktop: { w: 728, h: 90 },
    mobile: { w: 320, h: 100 },
  },
  {
    id: 'category-leaderboard',
    name: 'Category Leaderboard',
    format: '970 × 250',
    where: 'Top of a specific industry desk (e.g. only LiDAR or only Hydrography). Category-targeted.',
    desktop: { w: 970, h: 250 },
    mobile: { w: 320, h: 100 },
  },
] as const satisfies readonly Placement[];

export type PlacementId = (typeof placements)[number]['id'];

export const placementById = (id: string): Placement | undefined => placements.find((p) => p.id === id);
export const isPlacementId = (id: string): id is PlacementId => placements.some((p) => p.id === id);

/** Other commercial formats that are not display slots (shown on the Advertise page and in the media kit). */
export const otherFormats = [
  { title: 'Sponsored content', body: 'Articles written by or with your team, published on GeoInformatics and clearly labelled “Sponsored”. Kept separate from independent editorial content and excluded from news indexes.' },
  { title: 'Newsletter sponsorship', body: 'Presenting-partner position or a native placement in the GeoInformatics newsletter, delivered directly to subscribers’ inboxes.' },
  { title: 'Event promotion', body: 'Featured listing in the industry calendar, combined with display and newsletter placements in the run-up to your event.' },
  { title: 'Custom partnerships', body: 'Webinars, reports, themed editorial series with a presenting partner, and multi-channel campaigns built around your launch.' },
];

export const targetingOptions = [
  { title: 'Industry desk', body: 'Appear only on the desks your buyers read — from Hydrography to GeoAI.' },
  { title: 'Placement', body: 'Choose specific positions, from homepage takeover to in-article.' },
  { title: 'Device', body: 'Separate desktop and mobile creatives, each served at the right size.' },
  { title: 'Flight dates', body: 'Campaigns start and stop automatically, aligned with launches and events.' },
];
