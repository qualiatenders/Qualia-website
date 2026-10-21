/**
 * GeoInformatics logo. Single-colour by design: it takes `currentColor`, so it
 * is white on dark planes and black on white planes without separate files.
 *
 * To use the official artwork, put the logo's SVG markup in OFFICIAL_LOGO_SVG
 * below with fills set to "currentColor" (or remove the fill attributes).
 * Until then a typographic placeholder is shown.
 */
const OFFICIAL_LOGO_SVG = '';

export function Logo({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  if (OFFICIAL_LOGO_SVG) {
    return (
      <span className={`inline-flex h-7 items-center text-current lg:h-8 [&_svg]:h-full [&_svg]:w-auto ${className}`} role="img" aria-label="GeoInformatics" dangerouslySetInnerHTML={{ __html: OFFICIAL_LOGO_SVG }} />
    );
  }
  return (
    <span className={`inline-flex items-center gap-2.5 text-current ${className}`}>
      <svg viewBox="0 0 32 32" className="size-7 flex-none lg:size-8" aria-hidden="true">
        <path d="M16 3.5 29 27H3z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="miter" />
        <circle cx="16" cy="19" r="3" fill="currentColor" />
      </svg>
      <span className="font-sans text-[1.25rem] leading-none font-black tracking-[-0.03em] lg:text-[1.45rem]">
        Geo<span className="font-medium">Informatics</span>
        {!compact && <span className="sr-only"> — geospatial news</span>}
      </span>
    </span>
  );
}
