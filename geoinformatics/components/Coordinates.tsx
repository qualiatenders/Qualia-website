import type { GeoPoint } from '@/lib/types';

/** "10.0000° S · 67.5000° W — Southwest Amazonia", counting up to the fix on first view. */
export function Coordinates({ point, className = '' }: { point: GeoPoint; className?: string }) {
  return (
    <p className={`meta inline-flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`} data-fix>
      <span className="fix-dot" aria-hidden="true" />
      <span className="tabular-nums">
        <span data-coord={point.lat}>{Math.abs(point.lat).toFixed(4)}</span>° {point.lat >= 0 ? 'N' : 'S'}
        <span aria-hidden="true"> · </span>
        <span data-coord={point.lon}>{Math.abs(point.lon).toFixed(4)}</span>° {point.lon >= 0 ? 'E' : 'W'}
      </span>
      <span aria-hidden="true">—</span>
      <span>{point.name}</span>
    </p>
  );
}
