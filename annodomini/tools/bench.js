// Floured walnut work bench, seen from above. The flour is heaviest in a ring
// around the centre, where the dough was stretched out.
window.renderBench = function (W, H) {
  const mul = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v, sst = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t) }, mix = (a, b, t) => a + (b - a) * t;
  const noise = (seed => {
    const p = new Uint16Array(512), r = mul(seed), g = new Float32Array(256);
    for (let i = 0; i < 256; i++) { p[i] = i; g[i] = r() }
    for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0, t = p[i]; p[i] = p[j]; p[j] = t }
    for (let i = 0; i < 256; i++) p[i + 256] = p[i];
    return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
      const a = g[p[p[X] + Y]], b = g[p[p[X + 1] + Y]], c = g[p[p[X] + Y + 1]], d = g[p[p[X + 1] + Y + 1]];
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v };
  })(21);
  const fbm = (x, y, o = 4) => { let s = 0, a = .5, f = 1, t = 0; for (let i = 0; i < o; i++) { s += a * noise(x * f, y * f); t += a; f *= 2.03; a *= .5 } return s / t };
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'), img = x.createImageData(W, H), d = img.data;
  const cx = W / 2, cy = H / 2, plank = W * .22, rnd = mul(5);
  const offs = [...Array(40)].map(() => rnd() * 900), tone = [...Array(40)].map(() => .85 + rnd() * .3);
  for (let y = 0; y < H; y++) for (let X = 0; X < W; X++) {
    const o = (y * W + X) * 4, k = Math.floor(y / plank), fy = (y % plank) / plank;
    // walnut grain, one board per row
    const gx = X + offs[k], g = fbm(gx * .0022, y * .03 + k * 7, 5), streak = .5 + .5 * Math.sin(y * .11 + g * 16 + k * 2.3);
    const fine = noise(gx * .02, y * .6);
    let w = mix(.62, 1, streak) * tone[k] * (.85 + .3 * fine) * (.8 + .4 * fbm(gx * .004, y * .004 + k, 3));
    const seam = sst(0, .025, fy) * sst(1, .975, fy), bevel = sst(.02, .06, fy) * .08;
    w *= mix(.3, 1, seam) * (1 + bevel);
    let r = 108 * w, gg = 74 * w, b = 50 * w;
    // soft light from the top left
    const L = 1.08 - .38 * Math.hypot((X - W * .3) / W, (y - H * .25) / H);
    r *= L; gg *= L; b *= L;
    // flour: a pushed-out ring around the pizza, drifting patches, fine dust
    const dr = Math.hypot((X - cx) / W, (y - cy) / W);
    const ring = Math.exp(-Math.pow((dr - .5) / .08, 2)) * .85 + Math.exp(-Math.pow((dr - .36) / .05, 2)) * .5;
    const patch = sst(.5, .75, fbm(X * .006 + 3, y * .006, 5));
    const dust = fbm(X * .05, y * .05, 4), speck = noise(X * .9, y * .9) > .9 ? .5 : 0;
    const fl = clamp((ring * .55 + patch * .3) * sst(.35, .8, dust) * (.6 + .4 * noise(X * .25, y * .25)) + speck * (ring + .15) * .5 + ring * .06);
    r = mix(r, 238, fl); gg = mix(gg, 232, fl); b = mix(b, 222, fl);
    d[o] = r; d[o + 1] = gg; d[o + 2] = b; d[o + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  // semolina grains
  for (let i = 0; i < 900; i++) { const a = rnd() * 7, rr = (.3 + rnd() * .35) * W; x.fillStyle = `rgba(${226 + rnd() * 20 | 0},${196 + rnd() * 20 | 0},${120 + rnd() * 30 | 0},${.5 + rnd() * .4})`; x.beginPath(); x.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, .8 + rnd() * 1.6, 0, 7); x.fill() }
  return c;
};
