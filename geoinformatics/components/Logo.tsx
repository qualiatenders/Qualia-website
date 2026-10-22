/**
 * The official GeoInformatics logo (vectorised from the current artwork).
 * "GEO" stays red; "Informatics" is white on dark planes and black on white
 * planes. Served as two cached SVG files rather than inlined on every page.
 */
export function Logo({ className = '', tone = 'dark' }: { className?: string; /** Background the logo sits on. */ tone?: 'dark' | 'light' }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimisation needed
    <img
      src={tone === 'dark' ? '/brand/geoinformatics-logo-white.svg' : '/brand/geoinformatics-logo-black.svg'}
      alt="GeoInformatics"
      width={553}
      height={114}
      decoding="async"
      className={`block h-8 w-auto lg:h-9 ${className}`}
    />
  );
}
