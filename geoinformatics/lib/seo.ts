import type { Metadata } from 'next';
import type { Article, Category } from './types';
import { absoluteUrl, site } from './site';

/** Generated share card for articles without a photograph. */
export const ogImage = (a: Pick<Article, 'title' | 'category'>) => `/og/?t=${encodeURIComponent(a.title)}&c=${encodeURIComponent(a.category.slug)}`;

export function pageMetadata({ title, description, path, image, noindex }: { title: string; description: string; path: string; image?: string; noindex?: boolean }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', siteName: site.name, title, description, url: path, locale: 'en_GB', ...(image ? { images: [image] } : {}) },
    twitter: { card: 'summary_large_image', title, description },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export function articleMetadata(a: Article): Metadata {
  const title = a.seo.title || a.title;
  const description = a.seo.description || a.excerpt;
  const image = a.image?.src ?? ogImage(a);
  return {
    title: { absolute: a.seo.title || `${a.title} | ${site.name}` },
    description,
    alternates: { canonical: a.seo.canonical || a.path },
    authors: [{ name: a.author.name }],
    openGraph: {
      type: 'article',
      siteName: site.name,
      title,
      description,
      url: a.path,
      publishedTime: a.publishedAt,
      modifiedTime: a.updatedAt,
      section: a.category.name,
      tags: a.tags.map((t) => t.name),
      images: [{ url: image, width: a.image?.width ?? 1200, height: a.image?.height ?? 630, alt: a.image?.alt ?? a.title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
    robots: a.seo.noindex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    other: a.sponsored ? { 'article:content_tier': 'sponsored' } : undefined,
  };
}

const publisher = () => ({
  '@type': 'NewsMediaOrganization',
  '@id': `${site.url}/#organization`,
  name: site.name,
  url: site.url,
  logo: { '@type': 'ImageObject', url: absoluteUrl('/brand/logo-512.png'), width: 512, height: 512 },
  ...(site.publisher.legalName ? { legalName: site.publisher.legalName } : {}),
  ethicsPolicy: absoluteUrl('/legal/editorial-standards/'),
  masthead: absoluteUrl('/about/'),
  sameAs: [site.social.linkedin, site.social.x, site.social.youtube].filter(Boolean),
});

export const organizationJsonLd = () => ({ '@context': 'https://schema.org', ...publisher() });

export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${site.url}/#website`,
  name: site.name,
  url: site.url,
  inLanguage: 'en',
  publisher: { '@id': `${site.url}/#organization` },
  potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${site.url}/search/?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
});

export function articleJsonLd(a: Article) {
  return {
    '@context': 'https://schema.org',
    // Sponsored pieces are not news reporting; declare them as plain articles.
    '@type': a.sponsored ? 'Article' : a.kind === 'news' ? 'NewsArticle' : a.kind === 'opinion' ? 'OpinionNewsArticle' : a.kind === 'analysis' ? 'AnalysisNewsArticle' : 'NewsArticle',
    mainEntityOfPage: absoluteUrl(a.path),
    headline: a.title.slice(0, 110),
    description: a.excerpt,
    image: [a.image ? a.image.src : absoluteUrl(ogImage(a))],
    datePublished: a.publishedAt,
    dateModified: a.updatedAt,
    articleSection: a.category.name,
    keywords: a.tags.map((t) => t.name).join(', ') || undefined,
    inLanguage: 'en',
    isAccessibleForFree: true,
    author: a.sponsored ? { '@type': 'Organization', name: a.sponsored.sponsor } : { '@type': 'Person', name: a.author.name, ...(a.author.path ? { url: absoluteUrl(a.author.path) } : {}) },
    publisher: publisher(),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

export const categoryCrumbs = (c: Category) => [
  { name: 'Home', path: '/' },
  { name: c.name, path: c.path },
];
