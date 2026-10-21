import Link from 'next/link';
import type { Article } from '@/lib/types';
import { kindLabel } from '@/lib/taxonomy';
import { timeAgo } from '@/lib/format';

export function CategoryTag({ article, link = false }: { article: Article; link?: boolean }) {
  const label = (
    <>
      {article.category.name}
      {article.kind !== 'news' && <span className="text-fg-subtle"> · {kindLabel[article.kind]}</span>}
    </>
  );
  return link ? (
    <Link href={article.category.path} className="cat-tag relative z-10 hover:underline">
      {label}
    </Link>
  ) : (
    <span className="cat-tag">{label}</span>
  );
}

export function SponsoredBadge({ article }: { article: Article }) {
  if (!article.sponsored) return null;
  return (
    <span className="kicker inline-flex items-center gap-1.5 border border-current px-1.5 py-0.5 text-fg-muted">
      {article.sponsored.label}
      <span className="sr-only"> content</span>
    </span>
  );
}

export function TimeMeta({ article, showAuthor = false, className = '' }: { article: Article; showAuthor?: boolean; className?: string }) {
  return (
    <p className={`meta flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      {showAuthor && <span>{article.sponsored ? `By ${article.sponsored.sponsor}` : article.author.name}</span>}
      <time dateTime={article.publishedAt}>{timeAgo(article.publishedAt)}</time>
      <span aria-hidden="true">·</span>
      <span>{article.readingMinutes} min read</span>
    </p>
  );
}
