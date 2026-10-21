import 'server-only';
import sanitizeHtml from 'sanitize-html';
import { categories as desks, categoryBySlug } from '@/lib/taxonomy';
import type { Article, ArticleKind, ArticleList, BreakingItem, Category, EventItem, Media, Organization } from '@/lib/types';
import type { ContentSource, ListQuery } from './source';

/**
 * Headless WordPress adapter.
 *
 * Reads the standard REST API (/wp-json/wp/v2) plus the fields and endpoints
 * that the GeoInformatics Platform plugin adds (wordpress/gi-platform):
 * the `gi` field on posts, the gi_event / gi_organization post types and
 * /gi/v1/most-read. Everything is fetched server-side and cached with tags;
 * the plugin calls /api/revalidate on publish so pages refresh in seconds.
 */

const base = () => process.env.WORDPRESS_URL!.replace(/\/$/, '');
const sponsorLabels = ['Sponsored', 'Advertisement', 'Partner content'] as const;
const REVALIDATE = Number(process.env.CONTENT_REVALIDATE_SECONDS || 300);

type WpRendered = { rendered: string };
type WpTerm = { id: number; slug: string; name: string; taxonomy: string; description?: string };
type WpMedia = {
  source_url: string;
  alt_text?: string;
  caption?: WpRendered;
  media_details?: { width?: number; height?: number; sizes?: Record<string, { source_url: string; width: number; height: number }> };
  gi_credit?: string;
};
type WpPost = {
  id: number;
  slug: string;
  link: string;
  date_gmt: string;
  modified_gmt: string;
  title: WpRendered;
  excerpt: WpRendered;
  content?: WpRendered;
  yoast_head_json?: { title?: string; description?: string; canonical?: string; robots?: { index?: string } };
  gi?: {
    kind?: ArticleKind;
    breaking?: boolean;
    featured?: 'lead' | 'secondary' | '';
    sponsored?: { sponsor?: string; url?: string; label?: string } | null;
    trending_rank?: number | null;
    standfirst?: string;
    source?: { name?: string; url?: string } | null;
    author_name?: string;
    author_role?: string;
    location?: { name: string; lat: number; lon: number } | null;
  };
  _embedded?: {
    author?: { name: string; slug: string; description?: string; link?: string }[];
    'wp:featuredmedia'?: WpMedia[];
    'wp:term'?: WpTerm[][];
  };
};

async function wp<T>(path: string, init: { tags?: string[]; revalidate?: number; withTotal?: boolean } = {}): Promise<{ data: T; total: number; totalPages: number }> {
  const res = await fetch(`${base()}/wp-json${path}`, {
    headers: { accept: 'application/json' },
    next: { revalidate: init.revalidate ?? REVALIDATE, tags: ['wp', ...(init.tags ?? [])] },
  });
  if (!res.ok) {
    if (res.status === 400 || res.status === 404) return { data: [] as T, total: 0, totalPages: 0 };
    throw new Error(`WordPress ${res.status} for ${path}`);
  }
  return {
    data: (await res.json()) as T,
    total: Number(res.headers.get('x-wp-total') || 0),
    totalPages: Number(res.headers.get('x-wp-totalpages') || 0),
  };
}

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&#8230;|&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

function pathOf(link: string) {
  try {
    const p = new URL(link).pathname;
    return p.endsWith('/') ? p : `${p}/`;
  } catch {
    return `/${link.replace(/^\/|\/$/g, '')}/`;
  }
}

const neutral = (t: WpTerm): Category => ({
  slug: t.slug,
  name: decode(t.name),
  code: decode(t.name).slice(0, 3).toUpperCase(),
  description: decode(t.description ?? ''),
  visual: 'graticule',
  path: `/category/${t.slug}/`,
});

export const categoryFromWp = (t: WpTerm): Category => categoryBySlug(t.slug) ?? neutral(t);

function media(m: WpMedia | undefined, fallbackAlt: string): Media | null {
  if (!m?.source_url) return null;
  const large = m.media_details?.sizes?.full ?? m.media_details?.sizes?.large;
  return {
    src: large?.source_url ?? m.source_url,
    width: large?.width ?? m.media_details?.width ?? 1600,
    height: large?.height ?? m.media_details?.height ?? 900,
    alt: m.alt_text?.trim() || fallbackAlt,
    caption: m.caption ? decode(m.caption.rendered) || undefined : undefined,
    credit: m.gi_credit || undefined,
  };
}

/** Allow editorial markup and embeds from known video hosts; strip everything else. */
export function cleanHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption', 'iframe', 'video', 'source', 'picture', 'h2', 'h3', 'h4', 'cite']),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'srcset', 'sizes', 'alt', 'width', 'height', 'loading'],
      iframe: ['src', 'title', 'allow', 'allowfullscreen', 'loading'],
      video: ['src', 'controls', 'poster', 'preload', 'playsinline'],
      source: ['src', 'srcset', 'type', 'media'],
      '*': ['class', 'id'],
    },
    allowedIframeHostnames: ['www.youtube-nocookie.com', 'www.youtube.com', 'player.vimeo.com'],
    transformTags: {
      img: (tag, attribs) => ({ tagName: tag, attribs: { ...attribs, loading: 'lazy', decoding: 'async' } }),
      iframe: (tag, attribs) => ({ tagName: tag, attribs: { ...attribs, loading: 'lazy' } }),
      a: (tag, attribs) => {
        const external = /^https?:\/\//.test(attribs.href ?? '') && !(attribs.href ?? '').startsWith(base());
        return { tagName: tag, attribs: external ? { ...attribs, rel: 'noopener', target: '_blank' } : attribs };
      },
    },
  });
}

/** Rewrite absolute links into the WordPress host so they stay on this site. */
const localizeLinks = (html: string) => html.replaceAll(`${base()}/`, '/');

function toArticle(p: WpPost, withBody: boolean): Article {
  const terms = (p._embedded?.['wp:term'] ?? []).flat();
  const cats = terms.filter((t) => t.taxonomy === 'category' && t.slug !== 'uncategorized').map(categoryFromWp);
  const primary = cats.find((c) => desks.some((d) => d.slug === c.slug)) ?? cats[0] ?? desks[9]!;
  const author = p._embedded?.author?.[0];
  const title = decode(p.title.rendered);
  const body = p.content?.rendered ?? '';
  const words = decode(body).split(' ').length;
  const sponsored = p.gi?.sponsored?.sponsor
    ? { sponsor: p.gi.sponsored.sponsor, url: p.gi.sponsored.url || undefined, label: sponsorLabels.find((l) => l === p.gi?.sponsored?.label) ?? 'Sponsored' }
    : null;
  return {
    id: String(p.id),
    slug: p.slug,
    path: pathOf(p.link),
    title,
    excerpt: decode(p.gi?.standfirst || p.excerpt.rendered).replace(/\s*\[…\]$/, '…'),
    html: withBody ? localizeLinks(cleanHtml(body)) : undefined,
    kind: p.gi?.kind ?? 'news',
    category: primary,
    categories: cats.length ? cats : [primary],
    tags: terms.filter((t) => t.taxonomy === 'post_tag').map((t) => ({ slug: t.slug, name: decode(t.name) })),
    author: {
      slug: author?.slug ?? 'editorial',
      name: p.gi?.author_name || author?.name || 'GeoInformatics Editorial',
      role: p.gi?.author_role,
      bio: author?.description,
      path: author?.slug ? `/author/${author.slug}/` : undefined,
    },
    publishedAt: `${p.date_gmt}Z`,
    updatedAt: `${p.modified_gmt}Z`,
    image: media(p._embedded?.['wp:featuredmedia']?.[0], title),
    readingMinutes: Math.max(1, Math.round(words / 230)),
    breaking: Boolean(p.gi?.breaking),
    featured: p.gi?.featured || null,
    sponsored,
    trendingRank: p.gi?.trending_rank ?? null,
    location: p.gi?.location ?? undefined,
    source: p.gi?.source?.name ? { name: p.gi.source.name, url: p.gi.source.url } : undefined,
    seo: {
      title: p.yoast_head_json?.title,
      description: p.yoast_head_json?.description,
      noindex: p.yoast_head_json?.robots?.index === 'noindex',
    },
  };
}

const LIST_FIELDS = '_embed=author,wp:featuredmedia,wp:term';

let catIds: Promise<Map<string, number>> | null = null;
async function categoryId(slug: string) {
  catIds ??= wp<WpTerm[]>('/wp/v2/categories?per_page=100&_fields=id,slug,name,taxonomy', { tags: ['categories'], revalidate: 3600 }).then(
    (r) => new Map(r.data.map((t) => [t.slug, t.id])),
  );
  return (await catIds).get(slug);
}

async function list(q: ListQuery & { search?: string; ids?: string[]; meta?: string }): Promise<ArticleList> {
  const page = Math.max(1, q.page ?? 1);
  const params = new URLSearchParams({ per_page: String(q.perPage ?? 12), page: String(page) });
  if (q.category) {
    const id = await categoryId(q.category);
    if (!id) return { items: [], total: 0, totalPages: 0, page };
    params.set('categories', String(id));
  }
  if (q.kinds?.length) params.set('gi_kind', q.kinds.join(','));
  if (q.exclude?.length) params.set('exclude', q.exclude.join(','));
  if (q.search) params.set('search', q.search);
  if (q.ids?.length) {
    params.set('include', q.ids.join(','));
    params.set('orderby', 'include');
  }
  if (q.meta) params.set('gi_flag', q.meta);
  if (q.tag) params.set('tags_slug', q.tag);
  if (q.author) params.set('author_slug', q.author);
  const r = await wp<WpPost[]>(`/wp/v2/posts?${params}&${LIST_FIELDS}`, { tags: ['posts'] });
  return { items: r.data.map((p) => toArticle(p, false)), total: r.total, totalPages: r.totalPages, page };
}

export const wordpressSource: ContentSource = {
  mode: 'wordpress',

  list,

  async featured() {
    const r = await list({ perPage: 6, meta: 'featured' });
    return r.items;
  },

  async breaking(): Promise<BreakingItem[]> {
    const r = await list({ perPage: 8, meta: 'breaking' });
    return r.items.map((a) => ({ id: a.id, title: a.title, path: a.path, live: a.breaking }));
  },

  async mostRead(limit = 5) {
    // The plugin merges editor-pinned ranks with measured views and returns post ids in order.
    const r = await wp<{ ids: number[] }>(`/gi/v1/most-read?limit=${limit}&days=7`, { tags: ['most-read'], revalidate: 600 }).catch(() => null);
    const ids = (r?.data as { ids?: number[] } | undefined)?.ids ?? [];
    if (!ids.length) return [];
    return (await list({ ids: ids.map(String), perPage: limit })).items;
  },

  async byPath(path: string) {
    const slug = path.replace(/\/$/, '').split('/').pop();
    if (!slug) return null;
    const r = await wp<WpPost[]>(`/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=author,wp:featuredmedia,wp:term`, { tags: [`post:${slug}`] });
    const p = r.data[0];
    return p ? toArticle(p, true) : null;
  },

  async related(article, limit = 4) {
    const r = await list({ category: article.category.slug, perPage: limit + 1, exclude: [article.id] });
    return r.items.slice(0, limit);
  },

  async search(q, opts) {
    return list({ ...opts, search: q });
  },

  async events(): Promise<EventItem[]> {
    const r = await wp<
      { id: number; title: WpRendered; excerpt: WpRendered; gi_event?: Partial<EventItem> & { start?: string; end?: string } }[]
    >('/wp/v2/gi_event?per_page=50&orderby=meta_value&order=asc', { tags: ['events'] });
    return r.data.map((e) => ({
      id: String(e.id),
      title: decode(e.title.rendered),
      description: decode(e.excerpt.rendered),
      startDate: e.gi_event?.start || null,
      endDate: e.gi_event?.end || null,
      dateNote: e.gi_event?.dateNote,
      city: e.gi_event?.city ?? '',
      country: e.gi_event?.country ?? '',
      online: Boolean(e.gi_event?.online),
      url: e.gi_event?.url ?? '',
      kind: e.gi_event?.kind ?? 'Conference',
      topics: e.gi_event?.topics ?? [],
    }));
  },

  async organizations(): Promise<Organization[]> {
    const r = await wp<{ id: number; title: WpRendered; excerpt: WpRendered; gi_org?: Partial<Organization> }[]>(
      '/wp/v2/gi_organization?per_page=100&orderby=title&order=asc',
      { tags: ['organizations'], revalidate: 3600 },
    );
    return r.data.map((o) => ({
      id: String(o.id),
      name: decode(o.title.rendered),
      abbr: o.gi_org?.abbr ?? '',
      url: o.gi_org?.url ?? '',
      description: decode(o.excerpt.rendered),
      scope: o.gi_org?.scope ?? 'Global',
      focus: o.gi_org?.focus ?? [],
    }));
  },

  async allPaths() {
    const out: { path: string; updatedAt: string; publishedAt: string; title: string; sponsored: boolean }[] = [];
    for (let page = 1; page <= 50; page++) {
      const r = await wp<WpPost[]>(`/wp/v2/posts?per_page=100&page=${page}&_fields=id,link,date_gmt,modified_gmt,title,gi`, {
        tags: ['posts'],
        revalidate: 3600,
      });
      out.push(
        ...r.data.map((p) => ({
          path: pathOf(p.link),
          updatedAt: `${p.modified_gmt}Z`,
          publishedAt: `${p.date_gmt}Z`,
          title: decode(p.title.rendered),
          sponsored: Boolean(p.gi?.sponsored?.sponsor),
        })),
      );
      if (page >= r.totalPages) break;
    }
    return out;
  },

  async categories() {
    const r = await wp<(WpTerm & { count: number })[]>('/wp/v2/categories?per_page=100&hide_empty=true', { tags: ['categories'], revalidate: 3600 });
    const known = desks.filter((d) => r.data.some((t) => t.slug === d.slug));
    return known.length ? known : desks;
  },

  async tag(slug) {
    const r = await wp<WpTerm[]>(`/wp/v2/tags?slug=${encodeURIComponent(slug)}`, { tags: ['tags'], revalidate: 3600 });
    const t = r.data[0];
    return t ? { slug: t.slug, name: decode(t.name) } : null;
  },

  async author(slug) {
    const r = await wp<{ slug: string; name: string; description?: string }[]>(`/wp/v2/users?slug=${encodeURIComponent(slug)}`, {
      tags: ['authors'],
      revalidate: 3600,
    });
    const a = r.data[0];
    return a ? { slug: a.slug, name: a.name, bio: a.description, path: `/author/${a.slug}/` } : null;
  },
};
