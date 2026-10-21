import Link from 'next/link';
import type { Article } from '@/lib/types';
import { ArticleMedia } from './ArticleMedia';
import { CategoryTag, SponsoredBadge, TimeMeta } from './ArticleMeta';
import { pad2, timeAgo } from '@/lib/format';

/**
 * Card family. Each card is one link (the headline) stretched over the card
 * with ::after, so the whole card is clickable while screen readers hear a
 * single, meaningful link.
 */
const stretch = 'after:absolute after:inset-0 after:content-[""]';

export function LeadCard({ article }: { article: Article }) {
  return (
    <article className="group relative">
      <ArticleMedia article={article} priority kenBurns sizes="(min-width: 1280px) 58vw, (min-width: 1024px) 60vw, 100vw" className="aspect-[16/10]" />
      <div className="mt-5 lg:mt-6">
        <div className="flex items-center gap-3">
          <CategoryTag article={article} />
          <SponsoredBadge article={article} />
        </div>
        <h2 className="rise mt-3 font-display text-[clamp(2rem,1.1rem+2.8vw,3.75rem)] leading-[1.02] font-semibold tracking-[-0.015em]" style={{ ['--rise-delay' as string]: '120ms' }}>
          <Link href={article.path} className={`headline-link ${stretch}`}>
            {article.title}
          </Link>
        </h2>
        <p className="rise mt-4 max-w-[60ch] font-display text-[1.125rem] leading-relaxed text-fg-muted lg:text-[1.25rem]" style={{ ['--rise-delay' as string]: '260ms' }}>
          {article.excerpt}
        </p>
        <TimeMeta article={article} showAuthor className="mt-4" />
      </div>
    </article>
  );
}

export function FeatureCard({ article, sizes = '(min-width: 1024px) 25vw, 100vw', ratio = 'aspect-[16/10]' }: { article: Article; sizes?: string; ratio?: string }) {
  return (
    <article className="group relative">
      <ArticleMedia article={article} sizes={sizes} className={ratio} />
      <div className="mt-4">
        <div className="flex items-center gap-3">
          <CategoryTag article={article} />
          <SponsoredBadge article={article} />
        </div>
        <h3 className="mt-2.5 text-[1.3rem] leading-[1.15] lg:text-[1.4rem]">
          <Link href={article.path} className={`headline-link ${stretch}`}>
            {article.title}
          </Link>
        </h3>
        <TimeMeta article={article} className="mt-3" />
      </div>
    </article>
  );
}

/** Standard feed card: image left on wide screens, stacked on mobile. */
export function RowCard({ article, priority = false }: { article: Article; priority?: boolean }) {
  return (
    <article className="group relative grid grid-cols-[1fr_7.5rem] gap-4 sm:grid-cols-[14rem_1fr] sm:gap-6 lg:grid-cols-[16rem_1fr]">
      <ArticleMedia article={article} priority={priority} sizes="(min-width: 1024px) 16rem, (min-width: 640px) 14rem, 7.5rem" className="order-2 aspect-square sm:order-1 sm:aspect-[4/3]" />
      <div className="order-1 min-w-0 sm:order-2">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryTag article={article} />
          <SponsoredBadge article={article} />
        </div>
        <h3 className="mt-2 text-[1.125rem] leading-[1.2] sm:text-[1.35rem]">
          <Link href={article.path} className={`headline-link ${stretch}`}>
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 hidden text-[0.975rem] text-fg-muted sm:block">{article.excerpt}</p>
        <TimeMeta article={article} className="mt-3" />
      </div>
    </article>
  );
}

/** Text-only headline, used in the hero's "latest" column and sidebars. */
export function HeadlineItem({ article, index }: { article: Article; index?: number }) {
  return (
    <article className="group relative flex gap-4 py-4">
      {index !== undefined && <span className="meta tabular w-6 flex-none pt-0.5 text-accent">{pad2(index)}</span>}
      <div className="min-w-0">
        <p className="kicker text-fg-subtle">
          <time dateTime={article.publishedAt}>{timeAgo(article.publishedAt)}</time>
          <span aria-hidden="true"> · </span>
          {article.category.code}
        </p>
        <h3 className="mt-1.5 font-display text-[1.05rem] leading-snug font-medium tracking-[-0.01em]">
          <Link href={article.path} className={`headline-link ${stretch}`}>
            {article.title}
          </Link>
        </h3>
        {article.sponsored && <p className="kicker mt-1.5 text-fg-subtle">{article.sponsored.label}</p>}
      </div>
    </article>
  );
}

/** Compact card with small square image, for related lists and the trending rail. */
export function CompactCard({ article }: { article: Article }) {
  return (
    <article className="group relative grid grid-cols-[5.5rem_1fr] gap-4">
      <ArticleMedia article={article} sizes="5.5rem" className="aspect-square" />
      <div className="min-w-0">
        <CategoryTag article={article} />
        <h3 className="mt-1.5 font-display text-[1rem] leading-snug font-medium">
          <Link href={article.path} className={`headline-link ${stretch}`}>
            {article.title}
          </Link>
        </h3>
      </div>
    </article>
  );
}
