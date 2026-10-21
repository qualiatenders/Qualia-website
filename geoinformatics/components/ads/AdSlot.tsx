import { placementById, type PlacementId } from '@/lib/ads/placements';
import { creativesFor } from '@/lib/ads/server';
import { AdRotator } from './AdRotator';

/**
 * Server half of an ad slot: decides whether the slot exists at all. If no
 * campaign is booked for this placement (and desk), nothing is rendered —
 * no empty boxes. If there is, the exact space is reserved before any
 * creative loads, so the slot never shifts the layout.
 */
export async function AdSlot({ placement, category, className = '' }: { placement: PlacementId; category?: string; className?: string }) {
  const p = placementById(placement)!;
  const creatives = await creativesFor(placement, category);
  if (!creatives.length) return null;

  const visibility = p.desktopOnly ? 'hidden lg:block' : !p.mobile ? 'hidden md:block' : '';
  const d = p.desktop;
  const m = p.mobile ?? p.desktop;
  return (
    <aside aria-label="Advertisement" className={`${visibility} ${className}`}>
      <div
        className="ad-slot w-full"
        style={
          {
            '--ad-mw': `${m.w}px`,
            '--ad-mr': `${m.w} / ${m.h}`,
            '--ad-dw': `${d.w}px`,
            '--ad-dr': `${d.w} / ${d.h}`,
          } as React.CSSProperties
        }
      >
        <p className="ad-label mb-1.5 w-full max-w-[var(--ad-mw)] text-left md:max-w-[var(--ad-dw)]">Advertisement</p>
        <div className="relative w-full max-w-[var(--ad-mw)] [aspect-ratio:var(--ad-mr)] md:max-w-[var(--ad-dw)] md:[aspect-ratio:var(--ad-dr)]">
          <AdRotator creatives={creatives} placement={placement} />
        </div>
      </div>
    </aside>
  );
}
