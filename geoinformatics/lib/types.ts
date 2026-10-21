export type ArticleKind = 'news' | 'analysis' | 'interview' | 'feature' | 'opinion';

export type GeoPoint = { name: string; lat: number; lon: number };

export type Visual =
  | 'orbit'
  | 'pointcloud'
  | 'contours'
  | 'bathymetry'
  | 'constellation'
  | 'wireframe'
  | 'triangulation'
  | 'classification'
  | 'tiles'
  | 'graticule';

export type Category = {
  slug: string;
  name: string;
  /** Short mono code used as a typographic identity mark (e.g. "EO"). */
  code: string;
  description: string;
  visual: Visual;
  path: string;
};

export type Author = {
  slug: string;
  name: string;
  role?: string;
  bio?: string;
  path?: string;
};

export type Media = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  credit?: string;
};

export type Sponsorship = {
  sponsor: string;
  url?: string;
  label: 'Sponsored' | 'Advertisement' | 'Partner content';
};

export type Article = {
  id: string;
  slug: string;
  /** Path on this site, identical to the WordPress permalink path. */
  path: string;
  title: string;
  /** Standfirst: one or two sentences that sit under the headline. */
  excerpt: string;
  /** Sanitized HTML body; absent in list queries. */
  html?: string;
  kind: ArticleKind;
  category: Category;
  categories: Category[];
  tags: { slug: string; name: string }[];
  author: Author;
  publishedAt: string;
  updatedAt: string;
  image: Media | null;
  readingMinutes: number;
  breaking: boolean;
  featured: 'lead' | 'secondary' | null;
  sponsored: Sponsorship | null;
  /** Editor-set position in the trending list (1–5), overrides measured ranking. */
  trendingRank: number | null;
  /** Where the story happens or is datelined; drives the news globe. */
  location?: GeoPoint;
  /** Source attribution for press releases or syndicated content. */
  source?: { name: string; url?: string };
  seo: { title?: string; description?: string; canonical?: string; noindex?: boolean };
};

export type ArticleList = { items: Article[]; total: number; totalPages: number; page: number };

export type EventItem = {
  id: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  /** Shown instead of dates while the organiser has not confirmed them. */
  dateNote?: string;
  city: string;
  country: string;
  online: boolean;
  url: string;
  description: string;
  kind: 'Conference' | 'Expo' | 'Summit' | 'Webinar' | 'Workshop';
  topics: string[];
};

export type Organization = {
  id: string;
  name: string;
  abbr: string;
  url: string;
  description: string;
  scope: 'Global' | 'Europe' | 'Americas' | 'Asia-Pacific' | 'Africa';
  focus: string[];
};

export type BreakingItem = { id: string; title: string; path: string; live: boolean };
