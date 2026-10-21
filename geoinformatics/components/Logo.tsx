/**
 * Wordmark. The mark is a survey control point — a triangle around a
 * fixed point — in Signal Red: the reference everything else is measured from.
 */
export function Logo({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-7 flex-none lg:size-8" aria-hidden="true">
        <rect width="32" height="32" fill="#D71920" />
        <path d="M16 6.5 26 24H6z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="miter" />
        <circle cx="16" cy="18" r="2.4" fill="#fff" />
      </svg>
      <span className="font-sans text-[1.25rem] leading-none font-black tracking-[-0.03em] lg:text-[1.45rem]">
        Geo<span className="font-medium">Informatics</span>
        {!compact && <span className="sr-only"> — geospatial news</span>}
      </span>
    </span>
  );
}
