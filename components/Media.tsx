import Image from 'next/image';
import type { MediaSlot } from '@/lib/content';

type Props = {
  media: MediaSlot;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Subtle zoom on hover — only where the image is interactive. */
  hoverZoom?: boolean;
};

/**
 * A single piece of product media.
 *
 * `fit: 'contain'` is for the studio renders, which sit on a white ground and
 * must never be cropped; `cover` is for photography. Until final assets land
 * every slot renders a technical placeholder plate that reserves the aspect
 * ratio (no layout shift) and names the shot it is waiting for. Drop a path
 * into `src` in lib/content.ts and the real asset takes over.
 */
export function Media({ media, className = '', sizes = '100vw', priority = false, hoverZoom = false }: Props) {
  const contain = media.fit === 'contain';

  return (
    <div
      className={`group/media relative overflow-hidden ${
        contain ? 'bg-white ring-1 ring-inset ring-black/10' : media.tone === 'light' ? 'bg-bone' : 'bg-hull-soft'
      } ${className}`}
      style={{ aspectRatio: media.ratio }}
    >
      {media.src ? (
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          className={`${contain ? 'object-contain' : 'object-cover'} ${
            hoverZoom
              ? 'transition-transform duration-[900ms] ease-[var(--ease-out-a)] group-hover/media:scale-[1.04]'
              : ''
          }`}
        />
      ) : (
        <Placeholder media={media} />
      )}
    </div>
  );
}

/** Brushed-aluminium plate with an engraved shot label. */
function Placeholder({ media }: { media: MediaSlot }) {
  const light = media.tone === 'light';

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 flex items-center justify-center ${
        light
          ? 'bg-[linear-gradient(128deg,#eceae5_0%,#f6f5f2_40%,#e4e2dc_100%)]'
          : 'bg-[linear-gradient(128deg,#131313_0%,#1d1d1d_38%,#101010_72%,#171717_100%)]'
      }`}
    >
      {/* Fine brushed lines — the aluminium cue, kept almost invisible. */}
      <div
        className={`absolute inset-0 opacity-[0.35] ${
          light
            ? 'bg-[repeating-linear-gradient(96deg,rgba(0,0,0,0.04)_0px,rgba(0,0,0,0.04)_1px,transparent_1px,transparent_5px)]'
            : 'bg-[repeating-linear-gradient(96deg,rgba(255,255,255,0.045)_0px,rgba(255,255,255,0.045)_1px,transparent_1px,transparent_5px)]'
        }`}
      />
      {/* Measurement grid. */}
      <div
        className={`absolute inset-0 bg-[size:64px_64px] opacity-50 ${
          light
            ? 'bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)]'
            : 'bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)]'
        }`}
      />
      <div className={`absolute inset-0 ring-1 ring-inset ${light ? 'ring-black/10' : 'ring-white/10'}`} />

      {/* Corner crop marks. */}
      {[
        'left-3 top-3 border-l border-t',
        'right-3 top-3 border-r border-t',
        'bottom-3 left-3 border-b border-l',
        'bottom-3 right-3 border-b border-r',
      ].map((position) => (
        <span key={position} className={`absolute h-3 w-3 ${position} ${light ? 'border-deck/40' : 'border-mill/40'}`} />
      ))}

      <div className="relative flex flex-col items-center gap-2 px-6 text-center">
        <span className="h-px w-8 bg-red" />
        <span className={`type-label ${light ? 'text-deck' : 'text-mill'}`}>{media.slot}</span>
        <span className={`type-label ${light ? 'text-mill' : 'text-deck'}`}>
          Beeld volgt · {media.ratio.replace(/\s/g, '')}
        </span>
      </div>
    </div>
  );
}
