import 'server-only';
import { categories as desks, categoryBySlug } from '@/lib/taxonomy';
import type { Article, ArticleList } from '@/lib/types';
import type { ContentSource, ListQuery } from './source';
import { previewArticles, previewEvents, previewOrganizations, SOURCE_BASE, type PreviewArticle } from './preview-data';

/** Preview content source. Active only while WORDPRESS_URL is not configured. */

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function toHtml(body: string[]) {
  return body
    .map((b) => {
      if (b.startsWith('## ')) return `<h2>${escape(b.slice(3))}</h2>`;
      if (b.startsWith('> ')) return `<figure class="pullquote"><blockquote><p>${escape(b.slice(2))}</p></blockquote></figure>`;
      return `<p>${escape(b)}</p>`;
    })
    .join('\n');
}

function toArticle(a: PreviewArticle, i: number): Article {
  const category = categoryBySlug(a.category) ?? desks[0]!;
  const published = a.date;
  const words = a.body.join(' ').split(/\s+/).length;
  const source = a.sourceUrl ?? `${SOURCE_BASE}/${a.slug}/`;
  return {
    id: String(i + 1),
    slug: a.slug,
    path: `/${a.slug}/`,
    title: a.title,
    excerpt: a.excerpt,
    html: `${toHtml(a.body)}\n<p class="preview-note"><em>Preview edition: this is a short summary. <a href="${source}" target="_blank" rel="noopener">Read the full article on GeoInformatics</a>.</em></p>`,
    kind: a.kind,
    category,
    categories: [category],
    tags: (a.tags ?? []).map((t) => ({ slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: t })),
    author: { slug: 'editorial', name: 'GeoInformatics Editorial', role: 'Editorial desk', path: '/author/editorial/' },
    publishedAt: published,
    updatedAt: published,
    image: { src: `/preview/${a.image}.jpg`, width: 1600, height: 1000, alt: '', caption: 'Illustrative image', credit: 'GeoInformatics preview render' },
    readingMinutes: Math.max(1, Math.round(words / 230)),
    breaking: Boolean(a.breaking),
    featured: a.featured ?? null,
    sponsored: a.sponsored ? { sponsor: a.sponsored, label: 'Sponsored' } : null,
    trendingRank: null,
    location: a.location,
    source: { name: 'GeoInformatics (original article)', url: source },
    seo: {},
  };
}

const all = previewArticles.map(toArticle).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
const lite = (a: Article): Article => ({ ...a, html: undefined });

function filter(q: ListQuery & { search?: string }) {
  const needle = q.search?.toLowerCase().trim();
  return all.filter(
    (a) =>
      (!q.category || a.categories.some((c) => c.slug === q.category)) &&
      (!q.kinds?.length || q.kinds.includes(a.kind)) &&
      (!q.exclude?.length || !q.exclude.includes(a.id)) &&
      (!q.tag || a.tags.some((t) => t.slug === q.tag)) &&
      (!q.author || a.author.slug === q.author) &&
      (!needle || `${a.title} ${a.excerpt} ${a.tags.map((t) => t.name).join(' ')} ${a.category.name}`.toLowerCase().includes(needle)),
  );
}

function page(items: Article[], q: ListQuery): ArticleList {
  const perPage = q.perPage ?? 12;
  const p = Math.max(1, q.page ?? 1);
  return { items: items.slice((p - 1) * perPage, p * perPage).map(lite), total: items.length, totalPages: Math.ceil(items.length / perPage), page: p };
}

export const previewSource: ContentSource = {
  mode: 'preview',
  list: async (q) => page(filter(q), q),
  featured: async () => all.filter((a) => a.featured).map(lite),
  breaking: async () => all.filter((a) => a.breaking).map((a) => ({ id: a.id, title: a.title, path: a.path, live: true })),
  // No traffic is measured in preview mode; an editor-style pick stands in for the ranking.
  mostRead: async (limit = 5) =>
    ['vexcel-brings-natural-language-3d-imagery-search-to-gis-workflows', 'satellogic-launches-first-merlin-satellite-multiple-newsats', 'lidar-reveals-20000-amazonian-precolonial-earthworks', 'trustpoint-and-calian-demonstrate-new-c-band-gnss-antenna-for-gps-independent-positioning', 'faro-insight-unveils-focus-i-1-scanners-and-rovi-i-1']
      .map((s) => all.find((a) => a.slug === s)!)
      .filter(Boolean)
      .slice(0, limit)
      .map(lite),
  byPath: async (path) => all.find((a) => a.path === path || a.slug === path.replace(/\//g, '')) ?? null,
  related: async (article, limit = 4) => {
    const same = all.filter((a) => a.id !== article.id && !a.sponsored && a.category.slug === article.category.slug);
    const rest = all.filter((a) => a.id !== article.id && !a.sponsored && !same.includes(a));
    return [...same, ...rest].slice(0, limit).map(lite);
  },
  search: async (q, opts) => page(filter({ ...opts, search: q }), opts),
  events: async () => previewEvents,
  organizations: async () => previewOrganizations,
  allPaths: async () => all.map((a) => ({ path: a.path, updatedAt: a.updatedAt, publishedAt: a.publishedAt, title: a.title, sponsored: Boolean(a.sponsored) })),
  categories: async () => desks,
  tag: async (slug) => all.flatMap((a) => a.tags).find((t) => t.slug === slug) ?? null,
  author: async (slug) => (slug === 'editorial' ? all[0]!.author : null),
};
