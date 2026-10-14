/**
 * Geanimeerde werktekening (voor- en bovenaanzicht met maatvoering) in de
 * lijnstijl van het merk. Puur decoratief; maten zijn illustratief.
 */
export function TechnicalDrawing({ className = '' }: { className?: string }) {
  const w = 'rgb(246 247 248 / 0.78)';
  const thin = 'rgb(246 247 248 / 0.38)';
  const red = '#F10A1D';
  const d = (ms: number) => ({ '--d': ms }) as React.CSSProperties;
  return (
    <svg viewBox="0 0 640 480" className={className} role="img" aria-label="Illustratieve werktekening van een gefreesd onderdeel met maatvoering" data-draw>
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 1 L9 5 L0 9z" fill={thin} />
        </marker>
        <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke={thin} strokeWidth="1" />
        </pattern>
      </defs>
      {/* frame + titelblok */}
      <rect className="dr" x="8" y="8" width="624" height="464" fill="none" stroke={thin} strokeWidth="1" />
      <path className="dr" d="M392 472 V404 H632 M392 438 H632 M512 404 V472" fill="none" stroke={thin} strokeWidth="1" style={d(200)} />
      <g className="fi" style={d(1600)} fill="rgb(246 247 248 / 0.6)" fontFamily="Lato, sans-serif" fontSize="10" letterSpacing="1.5">
        <text x="402" y="426" fontWeight="900" fill="rgb(246 247 248 / 0.9)">GROTECH</text>
        <text x="522" y="426">REV. A</text>
        <text x="402" y="460">BEHUIZING 01</text>
        <text x="522" y="460">SCHAAL 1:2</text>
      </g>

      {/* bovenaanzicht */}
      <g fill="none" strokeWidth="1.6">
        <rect className="dr" x="72" y="58" width="300" height="208" rx="12" stroke={w} style={d(100)} />
        <rect className="dr" x="104" y="96" width="176" height="124" rx="22" stroke={w} style={d(300)} />
        <circle className="dr" cx="164" cy="158" r="30" stroke={w} style={d(500)} />
        <circle className="dr" cx="164" cy="158" r="42" stroke={thin} strokeDasharray="0" style={d(550)} />
        {[[96, 82], [348, 82], [96, 242], [348, 242]].map(([x, y], i) => (
          <g key={i}>
            <circle className="dr" cx={x} cy={y} r="10" stroke={w} style={d(600 + i * 80)} />
            <circle className="dr" cx={x} cy={y} r="17" stroke={thin} style={d(640 + i * 80)} />
          </g>
        ))}
        <rect className="dr" x="306" y="110" width="24" height="96" rx="12" stroke={w} style={d(700)} />
      </g>
      {/* hartlijnen */}
      <g className="fi" stroke={red} strokeWidth="1" strokeDasharray="14 4 2 4" style={d(1200)}>
        <line x1="164" y1="104" x2="164" y2="212" />
        <line x1="110" y1="158" x2="218" y2="158" />
        <line x1="318" y1="96" x2="318" y2="220" />
      </g>

      {/* maatvoering bovenaanzicht */}
      <g fill="none" stroke={thin} strokeWidth="1">
        <path className="dr" d="M72 50 V28 M372 50 V28" style={d(900)} />
        <line className="dr" x1="74" y1="34" x2="370" y2="34" markerStart="url(#arr)" markerEnd="url(#arr)" style={d(950)} />
        <path className="dr" d="M380 58 H404 M380 266 H404" style={d(1000)} />
        <line className="dr" x1="398" y1="60" x2="398" y2="264" markerStart="url(#arr)" markerEnd="url(#arr)" style={d(1050)} />
        <line className="dr" x1="185" y1="137" x2="232" y2="96" style={d(1100)} />
      </g>
      <g className="fi" style={d(1500)} fill="rgb(246 247 248 / 0.85)" fontFamily="Lato, sans-serif" fontSize="12" fontWeight="700">
        <rect x="200" y="22" width="44" height="18" fill="#090B0E" />
        <text x="222" y="35" textAnchor="middle">150</text>
        <rect x="390" y="152" width="18" height="24" fill="#090B0E" />
        <text x="404" y="164" textAnchor="middle" transform="rotate(-90 404 164)">104</text>
        <text x="236" y="92">Ø30</text>
      </g>

      {/* vooraanzicht (doorsnede) */}
      <g fill="none" strokeWidth="1.6">
        <path className="dr" d="M72 312 H372 V376 H72 Z" stroke={w} style={d(800)} />
        <path className="dr" d="M104 312 V338 H280 V312" stroke={w} style={d(1000)} />
        <path className="dr" d="M134 338 V376 M194 338 V376" stroke={w} style={d(1100)} />
      </g>
      <path className="fi" d="M72 312 H104 V338 H134 V376 H72 Z M194 376 V338 H280 V312 H372 V376 Z" fill="url(#hatch)" style={d(1700)} />
      <g fill="none" stroke={thin} strokeWidth="1">
        <path className="dr" d="M372 312 H404 M372 376 H404" style={d(1200)} />
        <line className="dr" x1="398" y1="314" x2="398" y2="374" markerStart="url(#arr)" markerEnd="url(#arr)" style={d(1250)} />
      </g>
      <g className="fi" style={d(1700)} fontFamily="Lato, sans-serif">
        <rect x="390" y="333" width="18" height="22" fill="#090B0E" />
        <text x="404" y="344" textAnchor="middle" fontSize="12" fontWeight="700" fill="rgb(246 247 248 / 0.85)" transform="rotate(-90 404 344)">52</text>
        <text x="72" y="300" fontSize="10" letterSpacing="1.5" fill="rgb(246 247 248 / 0.55)">DOORSNEDE A–A</text>
        <text x="72" y="400" fontSize="10" letterSpacing="1.5" fill="rgb(246 247 248 / 0.55)">MAATVOERING VOLGENS TEKENING KLANT</text>
      </g>

      {/* crosshair accent */}
      <g className="fi" stroke={red} strokeWidth="1.4" fill="none" style={d(1900)}>
        <circle cx="520" cy="150" r="34" />
        <circle cx="520" cy="150" r="8" />
        <path d="M520 104 V128 M520 172 V196 M474 150 H498 M542 150 H566" />
      </g>
      <g className="fi" style={d(2000)} fontFamily="Lato, sans-serif" fontSize="10" letterSpacing="1.5" fill="rgb(246 247 248 / 0.55)">
        <text x="474" y="226">REFERENTIEPUNT</text>
        <text x="474" y="244" fill="rgb(246 247 248 / 0.85)" fontWeight="700">X 0.000 · Y 0.000</text>
      </g>
    </svg>
  );
}
