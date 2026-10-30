// Desserts & drinks, seen from above, rendered with the pizza engine (PZ).
// Each painter draws centred at (x, y) with overall radius s.
(() => {
  const { blob, layer, mat, rnd, mulberry } = PZ;
  const disc = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2) };

  function plate(L, x, y, r) {
    const { A, H, M } = L;
    layer(A, c => { disc(c, x, y, r); const g = c.createRadialGradient(x - r * .25, y - r * .3, r * .1, x, y, r);
      g.addColorStop(0, '#FBF9F4'); g.addColorStop(.75, '#EEEAE1'); g.addColorStop(1, '#D9D3C6'); c.fillStyle = g; c.fill() });
    layer(A, c => { c.lineWidth = r * .03; c.strokeStyle = 'rgba(150,140,120,.35)'; disc(c, x, y, r * .72); c.stroke() }, { blur: r * .02 });
    layer(H, c => { c.lineWidth = r * .26; c.strokeStyle = '#b0b0b0'; disc(c, x, y, r * .86); c.stroke(); disc(c, x, y, r * .7); c.fillStyle = '#606060'; c.fill() }, { blur: r * .06, op: 'lighten' });
    layer(M, c => { disc(c, x, y, r); c.fillStyle = mat(.9, .1, .95); c.fill() });
  }
  function cup(L, x, y, r, handle = true) {
    const { A, H, M } = L;
    if (handle) layer(A, c => { c.lineWidth = r * .16; c.strokeStyle = '#E9E4D8'; c.beginPath(); c.ellipse(x + r * 1.08, y + r * .1, r * .22, r * .3, 0, -1.3, 1.3); c.stroke() });
    layer(A, c => { disc(c, x, y, r); const g = c.createRadialGradient(x - r * .3, y - r * .3, 0, x, y, r); g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#DCD6C8'); c.fillStyle = g; c.fill() });
    layer(H, c => { c.lineWidth = r * .14; c.strokeStyle = '#eee'; disc(c, x, y, r * .93); c.stroke() }, { blur: r * .04, op: 'lighten' });
    layer(M, c => { disc(c, x, y, r); c.fillStyle = mat(.95, .1, .95); c.fill() });
  }
  function liquid(L, x, y, r, stops, gloss = .9) {
    const { A, M } = L;
    layer(A, c => { disc(c, x, y, r); const g = c.createRadialGradient(x - r * .2, y - r * .2, 0, x, y, r); stops.forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fill() });
    layer(M, c => { disc(c, x, y, r); c.fillStyle = mat(gloss, .05, 1); c.fill() });
  }
  function glass(L, x, y, r) {
    const { A, M, H } = L;
    layer(A, c => { c.lineWidth = r * .07; c.strokeStyle = 'rgba(235,240,240,.85)'; disc(c, x, y, r); c.stroke(); c.lineWidth = r * .02; c.strokeStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(x, y, r * .97, 3.6, 4.6); c.stroke() });
    layer(H, c => { c.lineWidth = r * .07; c.strokeStyle = '#ddd'; disc(c, x, y, r); c.stroke() }, { op: 'lighten', blur: r * .02 });
    layer(M, c => { c.lineWidth = r * .08; c.strokeStyle = mat(1, 0, 1); disc(c, x, y, r); c.stroke() });
  }
  function mint(L, x, y, s, rot, seed) { PZ.basil(L, x, y, s, rot, seed, ['#5E9E3E', '#3F7A2A', '#2A5A1C']) }
  function berry(L, x, y, r, col) {
    const { A, H, M } = L, r2 = mulberry(Math.round(x * 13 + y));
    if (col === 'rasp') {
      for (let i = 0; i < 14; i++) { const a = r2() * 7, d = Math.sqrt(r2()) * r * .75, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d, rr = r * .32;
        layer(A, c => { disc(c, px, py, rr); const g = c.createRadialGradient(px - rr * .3, py - rr * .3, 0, px, py, rr); g.addColorStop(0, '#E2475A'); g.addColorStop(1, '#8C1428'); c.fillStyle = g; c.fill() });
        layer(H, c => { disc(c, px, py, rr); c.fillStyle = '#ddd'; c.fill() }, { op: 'lighten', blur: rr * .5 }) }
    } else {
      layer(A, c => { disc(c, x, y, r); const g = c.createRadialGradient(x - r * .3, y - r * .3, 0, x, y, r); g.addColorStop(0, '#5C6A9C'); g.addColorStop(1, '#1E2244'); c.fillStyle = g; c.fill(); c.fillStyle = 'rgba(30,30,50,.9)'; c.beginPath(); c.arc(x + r * .1, y + r * .1, r * .2, 0, 7); c.fill() });
      layer(H, c => { disc(c, x, y, r); c.fillStyle = '#eee'; c.fill() }, { op: 'lighten', blur: r * .5 });
    }
    layer(M, c => { disc(c, x, y, r); c.fillStyle = mat(.9, .2, .8); c.fill() });
  }

  const P = {
    tiramisu(L, x, y, s) {
      plate(L, x, y, s);
      const { A, H, M } = L, w = s * 1.05;
      const sq = c => { c.beginPath(); c.roundRect(x - w / 2, y - w / 2, w, w, w * .08) };
      layer(A, c => { c.translate(x, y); c.rotate(.12); c.translate(-x, -y); sq(c); c.fillStyle = '#4A2A18'; c.fill(); c.clip();
        for (let i = 0; i < 2400; i++) { c.fillStyle = Math.random() < .5 ? 'rgba(110,64,36,.5)' : 'rgba(40,20,10,.5)'; c.fillRect(x - w / 2 + Math.random() * w, y - w / 2 + Math.random() * w, s * .012, s * .012) } });
      layer(A, c => { for (let i = 0; i < 500; i++) { const a = Math.random() * 7, d = w * (.55 + Math.random() * .25); c.fillStyle = 'rgba(80,45,25,.35)'; c.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, s * .01, s * .01) } });
      layer(H, c => { c.translate(x, y); c.rotate(.12); c.translate(-x, -y); sq(c); c.fillStyle = '#e0e0e0'; c.fill() }, { op: 'lighten', blur: s * .05 });
      layer(M, c => { c.translate(x, y); c.rotate(.12); c.translate(-x, -y); sq(c); c.fillStyle = mat(.05, .5, .2); c.fill() });
      mint(L, x + w * .28, y - w * .3, s * .16, .7, 41);
    },
    pannacotta(L, x, y, s) {
      plate(L, x, y, s);
      const { A, H, M } = L, r = s * .5;
      layer(A, c => { disc(c, x, y, r); const g = c.createRadialGradient(x - r * .3, y - r * .3, 0, x, y, r); g.addColorStop(0, '#FFFDF7'); g.addColorStop(1, '#EDE3CC'); c.fillStyle = g; c.fill() });
      layer(H, c => { disc(c, x, y, r); const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, '#fff'); g.addColorStop(1, '#666'); c.fillStyle = g; c.fill() }, { op: 'lighten', blur: r * .2 });
      layer(M, c => { disc(c, x, y, r); c.fillStyle = mat(.6, .7, .6); c.fill() });
      // coulis pooled on top and running down one side
      layer(A, c => { blob(c, x + r * .05, y + r * .05, r * .62, .25, 77); c.fillStyle = '#8E1324'; c.fill(); blob(c, x + r * .7, y + r * .55, r * .38, .4, 78, 1.4, .7); c.fill() }, { blur: s * .01 });
      layer(M, c => { blob(c, x + r * .05, y + r * .05, r * .62, .25, 77); c.fillStyle = mat(1, .05, 1); c.fill() });
      berry(L, x - r * .15, y - r * .1, r * .22, 'rasp'); berry(L, x + r * .25, y + r * .2, r * .2, 'rasp');
      berry(L, x + r * .2, y - r * .3, r * .13, 'blue'); berry(L, x - r * .9, y + r * .7, r * .13, 'blue');
      mint(L, x - r * .25, y + r * .35, s * .14, -.6, 43);
    },
    cannoli(L, x, y, s) {
      plate(L, x, y, s);
      const { A, H, M } = L;
      [[-.22, -.1, .35], [.22, .12, .3]].forEach(([dx, dy, rot], k) => {
        const cx = x + dx * s, cy = y + dy * s, len = s * .62, rad = s * .14;
        const tube = c => { c.save(); c.translate(cx, cy); c.rotate(rot); c.beginPath(); c.roundRect(-len / 2, -rad, len, rad * 2, rad * .4); c.restore() };
        layer(A, c => { tube(c); const g = c.createLinearGradient(cx, cy - rad, cx, cy + rad); g.addColorStop(0, '#D9A35E'); g.addColorStop(.5, '#B97830'); g.addColorStop(1, '#8A5220'); c.fillStyle = g; c.fill(); c.clip();
          for (let i = 0; i < 70; i++) { c.fillStyle = Math.random() < .5 ? 'rgba(240,200,140,.5)' : 'rgba(110,60,20,.4)'; c.beginPath(); c.arc(cx + (Math.random() - .5) * len, cy + (Math.random() - .5) * rad * 2, s * .012, 0, 7); c.fill() } });
        layer(H, c => { tube(c); c.fillStyle = '#d4d4d4'; c.fill() }, { op: 'lighten', blur: rad * .5 });
        layer(M, c => { tube(c); c.fillStyle = mat(.35, .2, .4); c.fill() });
        [-1, 1].forEach(e => { const ex = cx + Math.cos(rot) * len / 2 * e, ey = cy + Math.sin(rot) * len / 2 * e;
          layer(A, c => { blob(c, ex, ey, rad * 1.05, .2, 90 + k * 3 + e); c.fillStyle = '#FBF7EE'; c.fill();
            for (let i = 0; i < 9; i++) { c.fillStyle = Math.random() < .5 ? '#6E9A3A' : '#2B1A12'; c.beginPath(); c.arc(ex + (Math.random() - .5) * rad * 1.4, ey + (Math.random() - .5) * rad * 1.4, s * .016, 0, 7); c.fill() } });
          layer(H, c => { blob(c, ex, ey, rad, .2, 90 + k * 3 + e); c.fillStyle = '#eee'; c.fill() }, { op: 'lighten', blur: rad * .4 }) });
      });
      layer(A, c => { for (let i = 0; i < 900; i++) { c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(x + (Math.random() - .5) * s * 1.2, y + (Math.random() - .5) * s * 1.2, s * .01, s * .01) } });
    },
    affogato(L, x, y, s) {
      plate(L, x, y, s);
      cup(L, x - s * .05, y, s * .6);
      liquid(L, x - s * .05, y, s * .5, [[0, '#6B3A1C'], [.7, '#3A1C0C'], [1, '#22100A']]);
      const { A, H, M } = L, r = s * .32, cx = x - s * .1, cy = y - s * .05;
      layer(A, c => { blob(c, cx, cy, r, .12, 61); const g = c.createRadialGradient(cx - r * .3, cy - r * .3, 0, cx, cy, r); g.addColorStop(0, '#FFFBEF'); g.addColorStop(1, '#E8DCC0'); c.fillStyle = g; c.fill();
        for (let i = 0; i < 30; i++) { c.fillStyle = '#2A1810'; c.beginPath(); c.arc(cx + (Math.random() - .5) * r * 1.4, cy + (Math.random() - .5) * r * 1.4, s * .006, 0, 7); c.fill() } });
      layer(A, c => { blob(c, cx + r * .4, cy + r * .5, r * .5, .4, 62, 1.6, .5); c.fillStyle = 'rgba(120,70,35,.55)'; c.fill() }, { blur: r * .08 });
      layer(H, c => { blob(c, cx, cy, r, .12, 61); c.fillStyle = '#fff'; c.fill() }, { op: 'lighten', blur: r * .5 });
      layer(M, c => { blob(c, cx, cy, r, .12, 61); c.fillStyle = mat(.4, .7, .5); c.fill() });
    },
    espresso(L, x, y, s) {
      plate(L, x, y, s * .95);
      cup(L, x - s * .06, y, s * .52);
      liquid(L, x - s * .06, y, s * .42, [[0, '#D9A066'], [.55, '#B07038'], [1, '#6A3A18']], .5);
      const { A } = L;
      layer(A, c => { for (let i = 0; i < 40; i++) { const a = Math.random() * 7, d = s * (.1 + Math.random() * .28); c.fillStyle = 'rgba(90,45,15,.35)'; c.beginPath(); c.ellipse(x - s * .06 + Math.cos(a) * d, y + Math.sin(a) * d, s * .03, s * .012, a, 0, 7); c.fill() } }, { blur: s * .01 });
    },
    limonade(L, x, y, s) {
      const { A, M } = L;
      liquid(L, x, y, s * .8, [[0, '#FBF2B8'], [1, '#E8D27A']], .7);
      // ice and a lemon wheel
      [[-.3, -.25, .2], [.25, -.3, -.3], [-.05, .3, .5]].forEach(([dx, dy, rot]) => {
        const w = s * .34, cx = x + dx * s, cy = y + dy * s;
        layer(A, c => { c.translate(cx, cy); c.rotate(rot); c.beginPath(); c.roundRect(-w / 2, -w / 2, w, w, w * .2); c.fillStyle = 'rgba(255,255,255,.45)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = s * .015; c.stroke() });
        layer(M, c => { c.translate(cx, cy); c.rotate(rot); c.beginPath(); c.roundRect(-w / 2, -w / 2, w, w, w * .2); c.fillStyle = mat(1, .1, 1); c.fill() }) });
      const lx = x + s * .3, ly = y + s * .25, lr = s * .3;
      layer(A, c => { disc(c, lx, ly, lr); c.fillStyle = '#F2D33A'; c.fill(); disc(c, lx, ly, lr * .86); c.fillStyle = '#FFF4B0'; c.fill();
        for (let i = 0; i < 9; i++) { c.save(); c.translate(lx, ly); c.rotate(i / 9 * Math.PI * 2); c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, lr * .78, .08, Math.PI * 2 / 9 - .08); c.closePath(); c.fillStyle = '#F7DE5E'; c.fill(); c.restore() } });
      mint(L, x - s * .35, y + s * .3, s * .2, 2.2, 44);
      glass(L, x, y, s * .82);
    },
    wijn(L, x, y, s) {
      const { A } = L;
      layer(A, c => { c.lineWidth = s * .02; c.strokeStyle = 'rgba(230,235,235,.35)'; disc(c, x, y, s * .95); c.stroke() });
      liquid(L, x, y, s * .62, [[0, '#7A1426'], [.7, '#4A0814'], [1, '#2A040A']], 1);
      layer(A, c => { c.globalCompositeOperation = 'screen'; disc(c, x - s * .2, y - s * .22, s * .14); c.fillStyle = 'rgba(255,200,210,.35)'; c.fill() }, { blur: s * .05 });
      glass(L, x, y, s * .72);
    },
    water(L, x, y, s) {
      const { A, M } = L;
      liquid(L, x, y, s * .8, [[0, 'rgba(230,242,240,.95)'], [1, 'rgba(200,222,222,.95)']], .8);
      layer(A, c => { for (let i = 0; i < 70; i++) { const a = Math.random() * 7, d = Math.sqrt(Math.random()) * s * .72, r = s * (.012 + Math.random() * .025); disc(c, x + Math.cos(a) * d, y + Math.sin(a) * d, r); c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = s * .008; c.stroke() } });
      const lx = x - s * .25, ly = y + s * .2;
      layer(A, c => { c.translate(lx, ly); c.rotate(-.6); c.beginPath(); c.ellipse(0, 0, s * .3, s * .14, 0, 0, 7); c.fillStyle = '#F2D33A'; c.fill(); c.beginPath(); c.ellipse(0, -s * .02, s * .26, s * .1, 0, 0, 7); c.fillStyle = '#FFF2A8'; c.fill() });
      glass(L, x, y, s * .82);
    },
  };
  PZ.extras = P;
})();
