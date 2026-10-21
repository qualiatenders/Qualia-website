import type { Visual } from '@/lib/types';

/**
 * Generated editorial visuals, one family per desk: orbits for Earth
 * observation, point clouds for LiDAR, contours for GIS, and so on. They are
 * the art-directed fallback when an article has no photograph, and they are
 * deterministic per seed, so an article always gets the same composition.
 * Pure SVG rendered on the server: no client JS, no network request.
 */

const W = 1600;
const H = 900;

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RED = '#D71920';
const f = (n: number) => Math.round(n * 10) / 10;

type Draw = (r: () => number) => React.ReactNode;

/** Closed, wobbling loops around a centre: reads as terrain or depth contours. */
function loops(r: () => number, cx: number, cy: number, count: number, step: number, wobble: number) {
  const k1 = 2 + Math.floor(r() * 3);
  const k2 = 3 + Math.floor(r() * 4);
  const p1 = r() * Math.PI * 2;
  const p2 = r() * Math.PI * 2;
  return Array.from({ length: count }, (_, i) => {
    const base = 40 + i * step;
    const pts = Array.from({ length: 72 }, (_, j) => {
      const a = (j / 72) * Math.PI * 2;
      const rad = base * (1 + wobble * Math.sin(k1 * a + p1 + i * 0.12) + wobble * 0.6 * Math.sin(k2 * a + p2 - i * 0.08));
      return `${f(cx + Math.cos(a) * rad * 1.35)},${f(cy + Math.sin(a) * rad)}`;
    });
    return `M${pts.join('L')}Z`;
  });
}

const visuals: Record<Visual, Draw> = {
  contours: (r) => {
    const a = loops(r, 400 + r() * 300, 300 + r() * 300, 16, 34, 0.14);
    const b = loops(r, 1100 + r() * 300, 550 + r() * 200, 12, 30, 0.18);
    const hi = Math.floor(r() * 8) + 4;
    return (
      <>
        {[...a, ...b].map((d, i) => (
          <path key={i} d={d} fill="none" stroke={i === hi ? RED : '#fff'} strokeOpacity={i === hi ? 0.95 : i % 5 === 0 ? 0.32 : 0.13} strokeWidth={i === hi ? 2.5 : i % 5 === 0 ? 1.6 : 1} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`g${i}`} x1={i * 200} y1={0} x2={i * 200} y2={H} stroke="#fff" strokeOpacity={0.05} />
        ))}
      </>
    );
  },

  bathymetry: (r) => {
    const rings = loops(r, 800 + r() * 200, 520, 22, 26, 0.1);
    const lines = Array.from({ length: 14 }, (_, i) => i * 70 - 100);
    return (
      <>
        {rings.map((d, i) => (
          <path key={i} d={d} fill={`rgba(70,110,150,${0.018 + i * 0.002})`} stroke="#9fc3e0" strokeOpacity={0.12 + (i % 4 === 0 ? 0.14 : 0)} strokeWidth={1} />
        ))}
        {/* survey lines: a multibeam pattern crossing the basin */}
        {lines.map((y, i) => (
          <line key={`l${i}`} x1={0} y1={y} x2={W} y2={y + 360} stroke={i === 6 ? RED : '#fff'} strokeOpacity={i === 6 ? 0.9 : 0.08} strokeWidth={i === 6 ? 2 : 1} strokeDasharray={i === 6 ? undefined : '6 10'} />
        ))}
      </>
    );
  },

  orbit: (r) => {
    const cx = W * (0.25 + r() * 0.15);
    const cy = H * 1.55;
    const R = 1050;
    const sat = r() * 0.5 + 0.25;
    return (
      <>
        <circle cx={cx} cy={cy} r={R} fill="#12161c" stroke="#fff" strokeOpacity={0.25} />
        {Array.from({ length: 10 }, (_, i) => (
          <ellipse key={`m${i}`} cx={cx} cy={cy} rx={R * (0.1 + i * 0.1)} ry={R} fill="none" stroke="#fff" strokeOpacity={0.05} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <circle key={`p${i}`} cx={cx} cy={cy} r={R - 120 - i * 130} fill="none" stroke="#fff" strokeOpacity={0.05} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={`o${i}`} cx={cx + 160} cy={cy - 120} rx={R + 260 + i * 120} ry={R * 0.86 + i * 70} fill="none" stroke={i === 1 ? RED : '#fff'} strokeOpacity={i === 1 ? 0.9 : 0.16} strokeWidth={i === 1 ? 2 : 1} transform={`rotate(${-12 + i * 5} ${cx} ${cy})`} />
        ))}
        {/* imaging swath */}
        <path d={`M${W * sat} ${H * 0.18} L${W * sat - 120} ${H} L${W * sat + 220} ${H} Z`} fill={RED} fillOpacity={0.08} />
        <line x1={W * sat} y1={H * 0.18} x2={W * sat - 120} y2={H} stroke={RED} strokeOpacity={0.6} />
        <line x1={W * sat} y1={H * 0.18} x2={W * sat + 220} y2={H} stroke={RED} strokeOpacity={0.6} />
        <rect x={W * sat - 9} y={H * 0.18 - 9} width={18} height={18} fill="#fff" />
        <rect x={W * sat - 32} y={H * 0.18 - 3} width={64} height={6} fill="#fff" fillOpacity={0.6} />
      </>
    );
  },

  pointcloud: (r) => {
    // A terrain profile + a few "buildings" sampled as laser returns.
    const pts: React.ReactNode[] = [];
    const ph = r() * 10;
    const blocks = Array.from({ length: 4 }, () => ({ x: 200 + r() * 1200, w: 80 + r() * 160, h: 120 + r() * 220 }));
    for (let i = 0; i < 900; i++) {
      const x = r() * W;
      const depth = r();
      const ground = 640 + Math.sin(x / 210 + ph) * 60 + Math.sin(x / 70) * 12;
      const b = blocks.find((k) => x > k.x && x < k.x + k.w);
      let y = ground - depth * 160 + 80;
      if (b && r() > 0.35) y = ground - b.h * (0.6 + r() * 0.4) + depth * 60;
      if (r() > 0.92) y = ground - 60 - r() * 220; // vegetation returns
      const hot = b && y < ground - b.h * 0.85;
      pts.push(<circle key={i} cx={f(x)} cy={f(y)} r={f(1.4 + depth * 2.6)} fill={hot ? RED : '#fff'} fillOpacity={hot ? 0.95 : 0.22 + depth * 0.65} />);
    }
    return (
      <>
        {pts}
        <line x1={0} y1={160} x2={W} y2={160} stroke="#fff" strokeOpacity={0.08} strokeDasharray="2 8" />
      </>
    );
  },

  constellation: (r) => {
    const ground = { x: W * (0.35 + r() * 0.3), y: H * 0.86 };
    const sats = Array.from({ length: 8 }, () => ({ x: 120 + r() * (W - 240), y: 80 + r() * 380 }));
    return (
      <>
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={W / 2} cy={H * 0.95} rx={700 + i * 160} ry={520 + i * 120} fill="none" stroke="#fff" strokeOpacity={0.1} strokeDasharray="3 9" />
        ))}
        <path d={`M0 ${H * 0.86} Q ${W / 2} ${H * 0.78} ${W} ${H * 0.86}`} fill="none" stroke="#fff" strokeOpacity={0.3} />
        {sats.map((s, i) => (
          <g key={i}>
            <line x1={s.x} y1={s.y} x2={ground.x} y2={ground.y} stroke={i < 4 ? RED : '#fff'} strokeOpacity={i < 4 ? 0.75 : 0.2} strokeWidth={i < 4 ? 1.6 : 1} />
            <rect x={s.x - 6} y={s.y - 6} width={12} height={12} fill={i < 4 ? '#fff' : 'none'} stroke="#fff" strokeOpacity={0.8} />
          </g>
        ))}
        <circle cx={ground.x} cy={ground.y} r={26} fill="none" stroke={RED} strokeWidth={2} />
        <circle cx={ground.x} cy={ground.y} r={6} fill={RED} />
      </>
    );
  },

  wireframe: (r) => {
    // Isometric city blocks.
    const iso = (x: number, y: number, z: number) => [f(W / 2 + (x - y) * 0.87), f(H * 0.18 + (x + y) * 0.5 - z)] as const;
    const out: React.ReactNode[] = [];
    let k = 0;
    const hi = Math.floor(r() * 30);
    for (let gx = 0; gx < 8; gx++)
      for (let gy = 0; gy < 8; gy++) {
        if (r() < 0.2) continue;
        const x = gx * 110;
        const y = gy * 110;
        const w = 70 + r() * 20;
        const h = 30 + r() ** 2 * 320;
        const c = [iso(x, y, h), iso(x + w, y, h), iso(x + w, y + w, h), iso(x, y + w, h)];
        const base = [iso(x + w, y, 0), iso(x + w, y + w, 0), iso(x, y + w, 0)];
        const isHi = k++ === hi;
        out.push(
          <g key={`${gx}-${gy}`} stroke={isHi ? RED : '#fff'} strokeOpacity={isHi ? 0.95 : 0.4} fill={isHi ? RED : '#14181e'} fillOpacity={isHi ? 0.35 : 0.92}>
            <path d={`M${c.map((p) => p.join(',')).join('L')}Z`} />
            <path d={`M${c[1].join(',')}L${base[0].join(',')}L${base[1].join(',')}L${c[2].join(',')}Z`} />
            <path d={`M${c[2].join(',')}L${base[1].join(',')}L${base[2].join(',')}L${c[3].join(',')}Z`} />
          </g>,
        );
      }
    return <>{out}</>;
  },

  triangulation: (r) => {
    const pts = Array.from({ length: 16 }, () => ({ x: 100 + r() * (W - 200), y: 100 + r() * (H - 200) }));
    const edges: [number, number][] = [];
    pts.forEach((p, i) => {
      const near = pts
        .map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 }))
        .filter((n) => n.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      near.forEach((n) => edges.push([i, n.j]));
    });
    const station = pts[0]!;
    return (
      <>
        {edges.map(([a, b], i) => (
          <line key={i} x1={f(pts[a]!.x)} y1={f(pts[a]!.y)} x2={f(pts[b]!.x)} y2={f(pts[b]!.y)} stroke={a === 0 ? RED : '#fff'} strokeOpacity={a === 0 ? 0.8 : 0.18} />
        ))}
        {pts.map((p, i) => (
          <g key={`p${i}`}>
            <path d={`M${f(p.x)} ${f(p.y - 11)} L${f(p.x + 10)} ${f(p.y + 7)} L${f(p.x - 10)} ${f(p.y + 7)} Z`} fill="none" stroke="#fff" strokeOpacity={0.7} />
            <circle cx={f(p.x)} cy={f(p.y)} r={1.8} fill="#fff" />
          </g>
        ))}
        <circle cx={f(station.x)} cy={f(station.y)} r={70} fill="none" stroke={RED} strokeOpacity={0.6} strokeDasharray="4 6" />
        <circle cx={f(station.x)} cy={f(station.y)} r={5} fill={RED} />
      </>
    );
  },

  classification: (r) => {
    const size = 64;
    const cells: React.ReactNode[] = [];
    const cx = r() * W;
    const cy = r() * H;
    for (let x = 0; x < W; x += size)
      for (let y = 0; y < H; y += size) {
        const v = Math.sin(x / 190 + cx) + Math.cos(y / 140 + cy) + r() * 0.6;
        const op = v > 1.2 ? 0.28 : v > 0.4 ? 0.12 : v > -0.4 ? 0.05 : 0.015;
        cells.push(<rect key={`${x}-${y}`} x={x + 2} y={y + 2} width={size - 4} height={size - 4} fill="#fff" fillOpacity={op} />);
      }
    const boxes = Array.from({ length: 5 }, () => ({ x: Math.floor(r() * 28) * size, y: Math.floor(r() * 15) * size, w: (2 + Math.floor(r() * 4)) * size, h: (2 + Math.floor(r() * 3)) * size }));
    return (
      <>
        {cells}
        {boxes.map((b, i) => (
          <g key={`b${i}`}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="none" stroke={RED} strokeWidth={2} />
            <rect x={b.x} y={b.y - 22} width={74} height={22} fill={RED} />
            <text x={b.x + 8} y={b.y - 6} fill="#fff" fontSize={13} fontFamily="monospace">
              {(0.81 + r() * 0.18).toFixed(2)}
            </text>
          </g>
        ))}
      </>
    );
  },

  tiles: (r) => {
    // Tile pyramid: z0 → z3 laid out as nested grids.
    const levels = [1, 2, 4, 8, 16];
    const hx = Math.floor(r() * 16);
    const hy = Math.floor(r() * 16);
    return (
      <>
        {levels.map((n, li) => {
          const s = 720 / n;
          return Array.from({ length: n * n }, (_, i) => {
            const x = (i % n) * s;
            const y = Math.floor(i / n) * s;
            const hot = li === 4 && i % n === hx && Math.floor(i / n) === hy;
            return (
              <rect key={`${li}-${i}`} x={440 + x} y={90 + y} width={s} height={s} fill={hot ? RED : 'none'} stroke="#fff" strokeOpacity={0.05 + li * 0.04} />
            );
          });
        })}
        <text x={440} y={70} fill="#fff" fontSize={16} fontFamily="monospace">
          z/{hx}/{hy}
        </text>
      </>
    );
  },

  graticule: (r) => {
    // Orthographic globe graticule with a highlighted meridian.
    const cx = W * (0.55 + r() * 0.2);
    const cy = H / 2;
    const R = 520;
    const tilt = r() * 0.5;
    return (
      <>
        <circle cx={cx} cy={cy} r={R} fill="#12161c" stroke="#fff" strokeOpacity={0.3} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI;
          const rx = Math.abs(Math.cos(a + tilt)) * R;
          return <ellipse key={`m${i}`} cx={cx} cy={cy} rx={f(rx)} ry={R} fill="none" stroke={i === 3 ? RED : '#fff'} strokeOpacity={i === 3 ? 0.9 : 0.12} strokeWidth={i === 3 ? 2 : 1} />;
        })}
        {Array.from({ length: 8 }, (_, i) => {
          const lat = ((i + 1) / 9) * Math.PI - Math.PI / 2;
          const y = cy + Math.sin(lat) * R;
          const rx = Math.cos(lat) * R;
          return <ellipse key={`p${i}`} cx={cx} cy={f(y)} rx={f(rx)} ry={f(rx * 0.12)} fill="none" stroke="#fff" strokeOpacity={0.12} />;
        })}
      </>
    );
  },
};

export function GeoArt({ visual, seed, className, label }: { visual: Visual; seed: string; className?: string; label?: string }) {
  const r = rng(`${visual}:${seed}`);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false">
      <rect width={W} height={H} fill="#0e1115" />
      {visuals[visual](r)}
    </svg>
  );
}
