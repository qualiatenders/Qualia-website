/**
 * Section divider drawn as contour lines; they draw themselves in when the
 * divider scrolls into view (lib/geo-fx.js). Deterministic per seed.
 */
export function ContourRule({ seed = 1, className = '', tone = 'dark' }: { seed?: number; className?: string; tone?: 'dark' | 'light' }) {
  const W = 1400;
  const H = 56;
  const lines = [0, 1, 2, 3].map((k) => {
    const pts: string[] = [];
    for (let x = 0; x <= W; x += 20) {
      const y = H / 2 + (k - 1.5) * 9 + Math.sin(x / (140 + k * 23) + seed + k) * (6 + k * 1.5) + Math.sin(x / 61 + seed * 2) * 2.5;
      pts.push(`${x},${y.toFixed(1)}`);
    }
    return `M${pts.join('L')}`;
  });
  const stroke = tone === 'dark' ? 'rgb(255 255 255 / 0.18)' : 'rgb(11 13 16 / 0.18)';
  return (
    <svg data-contour viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" className={`block h-10 w-full ${className}`}>
      {lines.map((d, i) => (
        <path key={i} d={d} pathLength={1} stroke={i === 1 ? '#D71920' : stroke} strokeWidth={i === 1 ? 1.4 : 1} vectorEffect="non-scaling-stroke" style={{ ['--cd' as string]: `${i * 180}ms` }} />
      ))}
    </svg>
  );
}
