import Image from 'next/image';
import type { Article } from '@/lib/types';
import { GeoArt } from './GeoArt';

/**
 * Article visual: the featured photograph from WordPress, or the desk's
 * generated visual when there is none. The parent sets the aspect ratio.
 * Geo layer: tiles resolve on first view, a LiDAR scan line sweeps on hover,
 * and with `geoCursor` a GIS crosshair reads out coordinates.
 */
export function ArticleMedia({ article, sizes, priority = false, className = '', kenBurns = false, geoCursor = false }: { article: Article; sizes: string; priority?: boolean; className?: string; kenBurns?: boolean; geoCursor?: boolean }) {
  return (
    <div
      className={`zoom-media scan relative bg-anthracite ${className}`}
      data-tiles
      data-geo-cursor={geoCursor && article.location ? `${article.location.lat},${article.location.lon}` : undefined}
    >
      {article.image ? (
        <Image src={article.image.src} alt={article.image.alt} fill sizes={sizes} priority={priority} quality={75} className={`object-cover ${kenBurns ? 'kenburns' : ''}`} />
      ) : (
        <GeoArt visual={article.category.visual} seed={article.slug} className="absolute inset-0 size-full" />
      )}
    </div>
  );
}
