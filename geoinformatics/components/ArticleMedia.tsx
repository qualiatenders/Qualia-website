import Image from 'next/image';
import type { Article } from '@/lib/types';
import { GeoArt } from './GeoArt';

/**
 * Article visual: the featured photograph from WordPress, or the desk's
 * generated visual when there is none. The parent sets the aspect ratio.
 */
export function ArticleMedia({ article, sizes, priority = false, className = '' }: { article: Article; sizes: string; priority?: boolean; className?: string }) {
  return (
    <div className={`zoom-media relative bg-anthracite ${className}`}>
      {article.image ? (
        <Image src={article.image.src} alt={article.image.alt} fill sizes={sizes} priority={priority} quality={75} className="object-cover" />
      ) : (
        <GeoArt visual={article.category.visual} seed={article.slug} className="absolute inset-0 size-full" />
      )}
    </div>
  );
}
