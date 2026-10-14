/** Schema van het productiepartnermodel: klant ↔ GROTECH ↔ productie. */
export function PartnerDiagram({ className = '' }: { className?: string }) {
  const line = 'rgb(246 247 248 / 0.28)';
  const d = (ms: number) => ({ '--d': ms }) as React.CSSProperties;
  const label = { fontFamily: 'Lato, sans-serif', letterSpacing: 1.6 } as const;
  return (
    <svg viewBox="0 0 720 420" className={className} role="img" aria-labelledby="pd-title pd-desc" data-draw>
      <title id="pd-title">Het GROTECH-productiepartnermodel</title>
      <desc id="pd-desc">De klant heeft één aanspreekpunt: GROTECH in Nederland. GROTECH organiseert de productie bij nationale en internationale productiepartners of in eigen beheer, en bewaakt kwaliteit en communicatie.</desc>
      <defs>
        <marker id="pd-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 1 L9 5 L0 9z" fill="#F10A1D" />
        </marker>
      </defs>
      {/* klant */}
      <rect className="dr" x="20" y="160" width="150" height="100" rx="6" fill="none" stroke={line} strokeWidth="1.5" />
      <g className="fi" style={d(500)} {...label}>
        <text x="95" y="200" textAnchor="middle" fill="rgb(246 247 248 / 0.55)" fontSize="10">01</text>
        <text x="95" y="224" textAnchor="middle" fill="#F6F7F8" fontSize="15" fontWeight="900" letterSpacing="0.5">Jouw bedrijf</text>
        <text x="95" y="244" textAnchor="middle" fill="rgb(246 247 248 / 0.55)" fontSize="10">TEKENING + EISEN</text>
      </g>
      {/* verbinding klant–grotech */}
      <line className="dr" x1="176" y1="210" x2="262" y2="210" stroke="#F10A1D" strokeWidth="1.5" markerStart="url(#pd-arr)" markerEnd="url(#pd-arr)" style={d(400)} />
      {/* grotech */}
      <rect className="dr" x="270" y="120" width="180" height="180" rx="6" fill="rgba(241,10,29,0.06)" stroke="#F10A1D" strokeWidth="1.5" style={d(200)} />
      <g className="fi" style={d(700)} {...label}>
        <text x="360" y="162" textAnchor="middle" fill="#F10A1D" fontSize="10">02 · NEDERLAND</text>
        <text x="360" y="190" textAnchor="middle" fill="#F6F7F8" fontSize="20" fontWeight="900" letterSpacing="3">GROTECH</text>
        {['TEKENINGREVIEW', 'INKOOP & PLANNING', 'KWALITEITSBEWAKING', 'COMMUNICATIE'].map((t, i) => (
          <text key={t} x="360" y={218 + i * 18} textAnchor="middle" fill="rgb(246 247 248 / 0.7)" fontSize="9.5">{t}</text>
        ))}
      </g>
      {/* naar productie */}
      <path className="dr" d="M456 210 H520 M520 70 V350 M520 70 H546 M520 210 H546 M520 350 H546" fill="none" stroke={line} strokeWidth="1.5" style={d(900)} />
      {[
        { y: 30, t: 'Nationale partners', s: 'NL / EU' },
        { y: 170, t: 'Internationale partners', s: 'CAPACITEIT & PRIJS' },
        { y: 310, t: 'Eigen beheer', s: 'SELECTIEVE BEWERKINGEN' },
      ].map((b, i) => (
        <g key={b.t}>
          <rect className="dr" x="550" y={b.y} width="150" height="80" rx="6" fill="none" stroke={line} strokeWidth="1.5" style={d(1000 + i * 150)} />
          <g className="fi" style={d(1500 + i * 150)} {...label}>
            <text x="625" y={b.y + 36} textAnchor="middle" fill="#F6F7F8" fontSize="12" fontWeight="900" letterSpacing="0.2">{b.t}</text>
            <text x="625" y={b.y + 56} textAnchor="middle" fill="rgb(246 247 248 / 0.55)" fontSize="8" letterSpacing="1">{b.s}</text>
          </g>
        </g>
      ))}
      <g className="fi" style={d(1900)} {...label}>
        <text x="223" y="196" textAnchor="middle" fill="rgb(246 247 248 / 0.55)" fontSize="9">1 CONTACT</text>
        <text x="488" y="196" textAnchor="middle" fill="rgb(246 247 248 / 0.55)" fontSize="9">REGIE</text>
      </g>
    </svg>
  );
}
