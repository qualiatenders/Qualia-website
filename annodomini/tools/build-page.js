// Runs inside headless Chromium (see build-assets.js). Renders every HD asset
// with the pizza engine and hands back data URLs plus a placement manifest.
window.buildAll = async function () {
  const SIZE = 1200, BPR = SIZE * .46, files = {}, manifest = { size: SIZE, pr: BPR, toppings: {} };
  const tick = () => new Promise(r => setTimeout(r, 0));
  const out = (path, canvas) => { files[path] = canvas.toDataURL('image/webp', .92) };
  const cv = (w) => { const c = document.createElement('canvas'); c.width = c.height = Math.ceil(w); return c };
  const draw = (art, L, x, y, s, seed) => art.rot ? PZ[art.painter](L, x, y, s, PZ.rnd(0, 7), seed) : PZ[art.painter](L, x, y, s, seed);

  // Margherita base
  const base = cv(SIZE);
  PZ.render(base, { toppings: PZ.margherita });
  out('pizza/base.webp', base);
  manifest.base = 'pizza/base.webp';
  await tick();

  for (const t of AD_CATALOG.toppings) {
    const art = t.art, rng = PZ.mulberry(t.id.length * 977 + t.z), m = { z: t.z };
    if (art.overlay) {
      const c = cv(SIZE);
      PZ.render(c, { base: false, PRpx: BPR, toppings: L => art.overlay === 'drizzle'
        ? PZ.drizzle(L, L.cx, L.cy, BPR, { color: art.color, alpha: art.alpha, width: art.width, count: art.count, seed: 11 })
        : PZ.flakes(L, L.cx, L.cy, BPR, art.count, 13) });
      out(`pizza/${t.id}.webp`, c);
      m.overlay = `pizza/${t.id}.webp`;
    } else {
      // sprite variants
      m.variants = [];
      for (let v = 0; v < art.variants; v++) {
        const s = art.s * BPR * (.9 + rng() * .2), w = s * (art.pad || 3.4), c = cv(w);
        PZ.render(c, { base: false, PRpx: BPR, toppings: L => draw(art, L, c.width / 2, c.width / 2, s, 3000 + v * 31 + t.z) });
        out(`pizza/${t.id}-${v}.webp`, c);
        m.variants.push({ src: `pizza/${t.id}-${v}.webp`, w: c.width });
        await tick();
      }
      // scatter pieces (normalised to pizza radius) with a minimum spacing
      const pts = art.fixed ? art.fixed.slice() : [];
      for (let k = 0; pts.length < art.count && k < 5000; k++) {
        const a = rng() * Math.PI * 2, d = Math.sqrt(rng()) * art.rMax, p = [Math.cos(a) * d, Math.sin(a) * d];
        if (pts.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > art.minD)) pts.push(p);
      }
      m.pieces = pts.map((p, i) => ({ x: +p[0].toFixed(4), y: +p[1].toFixed(4), v: i % art.variants }));
    }
    manifest.toppings[t.id] = m;

    // menu thumbnail on dark stone
    const th = cv(168), T = art.thumb;
    PZ.render(th, { base: false, bg: [40, 38, 35], PRpx: 150, toppings: L => {
      if (art.overlay === 'drizzle') return PZ.drizzle(L, 84, 84, 70, { color: art.color, alpha: art.alpha, width: .05, count: T.n, seed: 4 });
      if (art.overlay === 'flakes') return PZ.flakes(L, 84, 84, 90, T.n, 5);
      const spots = [[[0, 0]], [[-.2, -.18], [.22, .2]], [[-.24, -.16], [.24, -.12], [0, .24]], [[-.22, -.2], [.22, -.2], [-.2, .22], [.22, .22]]][T.n - 1];
      spots.forEach(([a, b], i) => draw(art, L, 84 + a * 168, 84 + b * 168, T.s, 4000 + i * 7));
    } });
    out(`thumbs/${t.id}.webp`, th);
    await tick();
  }
  // desserts & drinks on dark slate
  for (const e of AD_CATALOG.extras) {
    const c = cv(240);
    PZ.render(c, { base: false, bg: [40, 38, 35], PRpx: 160, toppings: L => PZ.extras[e.art](L, 120, 120, 96) });
    out(`extras/${e.id}.webp`, c);
    await tick();
  }
  files['bench.webp'] = renderBench(1179, 1500).toDataURL('image/webp', .88);
  return { files, manifest };
};
