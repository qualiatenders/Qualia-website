// Wood-fired oven still, rendered for the app's oven screen.
// back  = interior (dome, hearth, logs, coals) + front landing
// front = stone arch frame around the mouth (transparent opening) — the pizza
//         slides between the two layers.
window.renderOven = function (W, H) {
  const mul = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
  const R = mul(4711), rnd = (a, b) => a + (b - a) * R();
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v, sst = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t) }, mix = (a, b, t) => a + (b - a) * t;
  const noise = (seed => {
    const p = new Uint16Array(512), r = mul(seed), g = new Float32Array(256);
    for (let i = 0; i < 256; i++) { p[i] = i; g[i] = r() }
    for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0, t = p[i]; p[i] = p[j]; p[j] = t }
    for (let i = 0; i < 256; i++) p[i + 256] = p[i];
    return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
      const a = g[p[p[X] + Y]], b = g[p[p[X + 1] + Y]], c = g[p[p[X] + Y + 1]], d = g[p[p[X + 1] + Y + 1]];
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v };
  })(9);
  const fbm = (x, y, o = 4) => { let s = 0, a = .5, f = 1, t = 0; for (let i = 0; i < o; i++) { s += a * noise(x * f, y * f); t += a; f *= 2.03; a *= .5 } return s / t };
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s) };
  const worley = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y); let f1 = 9, f2 = 9, id = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const a = xi + i, c = yi + j, px = a + .15 + .7 * hash(a, c), py = c + .15 + .7 * hash(c * 1.3 + 7, a * .7 + 3), dd = Math.hypot(px - x, py - y);
      if (dd < f1) { f2 = f1; f1 = dd; id = hash(a + .5, c + .5) } else if (dd < f2) f2 = dd }
    return [f1, f2, id] };
  const tone = v => 255 * (1 - Math.exp(-v / 255 * 1.25));

  // ---- geometry (fractions of the image) ----
  const cx = W / 2, spring = H * .4, rx = W * .47, ry = W * .4, yF = H * .55;   // mouth
  const yB = H * .468, vpY = H * .44;                                                   // back wall foot, vanishing line
  const fx = W * .58, fy = yB + H * .004;                                                // fire seat
  const inMouth = (x, y) => y <= yF && (y >= spring ? Math.abs(x - cx) <= rx : ((x - cx) / rx) ** 2 + ((y - spring) / ry) ** 2 <= 1);
  const geom = { W, H, floor: yF / H, fireX: fx / W, fireY: fy / H, mouthTop: (spring - ry) / H, mouthL: (cx - rx) / W, mouthR: (cx + rx) / W, spring: spring / H };

  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c };
  const back = mk(), b = back.getContext('2d', { willReadFrequently: true });

  // ---- interior + landing, per pixel ----
  const img = b.createImageData(W, H), d = img.data, sc = 1179 / W;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const o = (y * W + x) * 4, X = x * sc, Y = y * sc;
    let r = 0, g = 0, bl = 0;
    const fdx = (x - fx) / W, fdy = (y - fy) / W;
    if (y <= yF + 2) {
      if (y > yB) {
        // hearth floor in perspective: square cotto tiles
        const z = (yF - vpY) / (y - vpY), u = (x - cx) / (yF - vpY) * z * 2.2, zz = z * 2.2;
        const [f1, f2, h] = worley(u * .75, zz * .75), line = (f2 - f1) * 30 / z;
        const mortar = sst(0, 1.4, line);
        const crack = sst(.03, 0, Math.abs(fbm(u * 2.2, zz * 2.2, 4) - .5)) * (h > .55 ? .8 : 0);
        let base = mix(.7, 1.05, h) * (1 - .3 * fbm(X * .05, Y * .12, 4));
        base *= mix(.3, 1, mortar) * (1 - crack * .6);
        const ash = sst(.6, .75, fbm(u * 1.2 + 7, zz * 1.2, 4)) * .5;
        // light: falloff from the fire across the floor
        const wx = (x - fx) / (yF - vpY) * z * 2.2, wz = zz - (yF - vpY) / (fy - vpY) * 2.2;
        const L = 3.4 / (1 + (wx * wx + wz * wz) * .5) + .1;
        r = tone(mix(205, 170, ash) * base * L); g = tone(mix(112, 150, ash) * base * L * .9); bl = tone(mix(58, 130, ash) * base * L * .75);
      } else {
        // dome & back wall: firebrick courses curving with the dome, soot towards the crown
        const u = (x - cx) / W, v = (yB - y) / W;
        const curve = u * u * .9, bu = u * (1 + u * u * 1.6) * 16, bv = (v + curve * .55) * 30;
        const row = Math.floor(bv), off = (row % 2) * .5, col = Math.floor(bu + off), fu = bu + off - col, fv = bv - row;
        const mortar = sst(0, .09, Math.min(fu, 1 - fu)) * sst(0, .12, Math.min(fv, 1 - fv)), h = hash(col, row);
        let base = mix(.82, 1.06, h) * (1 - .35 * fbm(X * .03, Y * .03, 4)) * mix(.55, 1, mortar);
        const soot = clamp(sst(.05, .26, v + Math.abs(u) * .12) * .7 + sst(.66, .85, fbm(X * .006, Y * .006, 3)) * .25);
        const L = 3.2 / (1 + (fdx * fdx * 5 + fdy * fdy * 3.5) * 7) + .25;
        const lum = base * L * (1 - soot * .85);
        r = tone(215 * lum); g = tone(108 * lum); bl = tone(52 * lum);
      }
    } else {
      // front landing: worn dark stone slab, lit from the mouth
      const t = (y - yF) / (H - yF), side = Math.abs(x - cx) / W;
      const tex = fbm(X * .012, Y * .03, 5), spk = noise(X * .5, Y * .5);
      const L = (1.6 * Math.exp(-t * 4.5) * (1 - side * .8) + .06) * (y < H * .79 ? 1 : .3);
      const edge = sst(H * .79, H * .795, y) - sst(H * .795, H * .81, y) * .7;
      const zz = 1 / (t + .08), [s1, s2] = worley((x - cx) / W * zz * .8, zz * .5), seam = sst(0, .03 * zz, s2 - s1);
      const base = (.55 + .5 * tex + .1 * spk) * (1 + edge * .4) * mix(.7, 1, seam);
      r = tone(130 * base * L); g = tone(84 * base * L); bl = tone(56 * base * L);
    }
    d[o] = r; d[o + 1] = g; d[o + 2] = bl; d[o + 3] = 255;
  }
  b.putImageData(img, 0, 0);

  // ---- logs & coals ----
  const u = W / 1179;
  const log = (x, y, len, rad, ang, glow) => {
    b.save(); b.translate(x, y); b.rotate(ang);
    const g = b.createLinearGradient(0, -rad, 0, rad); g.addColorStop(0, '#5a3a24'); g.addColorStop(.45, '#2b1a10'); g.addColorStop(1, '#0d0805');
    b.fillStyle = g; b.beginPath(); b.roundRect(-len / 2, -rad, len, rad * 2, rad * .8); b.fill();
    b.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) { const px = rnd(-len / 2, len / 2), py = rnd(-rad * .7, rad * .9); b.strokeStyle = `rgba(255,${rnd(80, 150) | 0},20,${rnd(.25, .75) * glow})`; b.lineWidth = rnd(1, 3) * u; b.shadowColor = 'rgba(255,110,20,.9)'; b.shadowBlur = 8 * u;
      b.beginPath(); b.moveTo(px, py); b.lineTo(px + rnd(-14, 14) * u, py + rnd(-4, 4) * u); b.stroke() }
    b.shadowBlur = 0;
    const eg = b.createRadialGradient(len / 2, 0, 0, len / 2, 0, rad); eg.addColorStop(0, `rgba(255,200,90,${.9 * glow})`); eg.addColorStop(.6, `rgba(230,90,20,${.7 * glow})`); eg.addColorStop(1, 'rgba(80,20,5,0)');
    b.fillStyle = eg; b.beginPath(); b.ellipse(len / 2, 0, rad * .45, rad, 0, 0, 7); b.fill();
    b.restore();
  };
  // coal bed
  b.save(); b.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 260; i++) { const a = rnd(0, 7), dd = Math.sqrt(R()), x = fx + Math.cos(a) * dd * W * .16, y = fy + Math.sin(a) * dd * W * .025, s = rnd(2, 7) * u;
    const g = b.createRadialGradient(x, y, 0, x, y, s * 2.4); g.addColorStop(0, `rgba(255,${rnd(120, 200) | 0},60,${rnd(.4, .9)})`); g.addColorStop(1, 'rgba(255,60,10,0)'); b.fillStyle = g; b.fillRect(x - s * 3, y - s * 3, s * 6, s * 6) }
  b.restore();
  log(fx - W * .05, fy - H * .002, W * .26, W * .022, -.08, .8);
  log(fx + W * .06, fy + H * .001, W * .22, W * .02, .1, .9);
  log(fx + W * .01, fy - H * .009, W * .24, W * .019, .03, 1);
  log(fx - W * .17, fy + H * .004, W * .12, W * .014, -.5, .5);

  // warm bloom around the fire seat
  b.save(); b.globalCompositeOperation = 'screen';
  let g = b.createRadialGradient(fx, fy - H * .03, 0, fx, fy - H * .03, W * .55); g.addColorStop(0, 'rgba(255,170,80,.55)'); g.addColorStop(.4, 'rgba(255,110,40,.2)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  b.fillStyle = g; b.fillRect(0, 0, W, yF); b.restore();

  // depth of field: soften the interior a touch
  const soft = mk(), s = soft.getContext('2d'); s.filter = `blur(${2.2 * u}px)`; s.drawImage(back, 0, 0);
  b.save(); b.beginPath(); b.rect(0, 0, W, yF - 4 * u); b.clip(); b.drawImage(soft, 0, 0); b.restore();
  const soft2 = mk(), s2 = soft2.getContext('2d'); s2.filter = `blur(${5 * u}px)`; s2.drawImage(back, 0, 0);
  b.save(); const fg = b.createLinearGradient(0, H * .8, 0, H); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,1)');
  const m = mk(), mc = m.getContext('2d'); mc.drawImage(soft2, 0, 0); mc.globalCompositeOperation = 'destination-in'; mc.fillStyle = fg; mc.fillRect(0, 0, W, H); b.drawImage(m, 0, 0); b.restore();

  // ---- front: stone arch frame with lit soffit ----
  const front = mk(), f = front.getContext('2d', { willReadFrequently: true });
  const fi = f.createImageData(W, H), fd = fi.data, ringW = W * .12, soffit = W * .03;
  for (let y = 0; y < yF + 6 * u; y++) for (let x = 0; x < W; x++) {
    const o = (y * W + x) * 4, X = x * sc, Y = y * sc;
    // signed distance outward from the mouth outline (approx.)
    let dist, ang;
    if (y >= spring) { dist = Math.abs(x - cx) - rx; ang = x < cx ? Math.PI : 0 }
    else { const ex = (x - cx) / rx, ey = (y - spring) / ry, k = Math.hypot(ex, ey); dist = (k - 1) * Math.min(rx, ry) * (1 + (1 - Math.abs(ey / (k || 1))) * .25); ang = Math.atan2(ey, ex) }
    if (dist < -soffit) continue;                                         // opening → transparent
    const tex = fbm(X * .02, Y * .02, 5), fine = noise(X * .35, Y * .35);
    let r, gg, bb, a = 255;
    if (dist < 0) {
      // soffit: inner face of the arch, strongly lit by the fire
      const t = (dist + soffit) / soffit, side = y >= spring ? (x > cx ? 1.25 : .8) : 1;
      const L = (1.9 - t * 1.5) * (.85 + .3 * fbm(X * .05, Y * .05, 3)) * side * (y > spring ? sst(yF, spring - ry * .2, y) * .7 + .4 : 1);
      const brick = sst(.02, .08, Math.abs(((ang * 18 / Math.PI) % 1 + 1) % 1 - .5));
      r = (150 + 60 * tex) * L * (.6 + .4 * brick); gg = (78 + 30 * tex) * L * (.6 + .4 * brick); bb = (40 + 14 * tex) * L * (.6 + .4 * brick);
      a = 255 * sst(-soffit, -soffit + 2 * u, dist);
    } else {
      // arch ring of dark voussoirs, then rough stone face
      const inRing = dist < ringW;
      // ring: irregular voussoirs (worley in polar space); face: rough rubble stones
      const [f1, f2, id] = worley(X / 150 + (inRing ? 0 : 0), Y / 120), joint = sst(0, .06, f2 - f1), bulge = Math.pow(clamp(1 - f1 * .8), .6);
      const rim = Math.exp(-dist / (W * .055)) * 1.4 + Math.exp(-dist / (W * .16)) * .12;
      const base = (.25 + .6 * tex + .16 * fine) * mix(.65, 1.1, id) * mix(.72, 1, joint) * (.55 + .55 * bulge);
      r = tone((9 + 210 * rim) * base); gg = tone((8 + 100 * rim) * base); bb = tone((8 + 44 * rim) * base);
    }
    fd[o] = r; fd[o + 1] = gg; fd[o + 2] = bb; fd[o + 3] = a;
  }
  f.putImageData(fi, 0, 0);
  // grain + vignette on both layers
  for (const [cv, ctx] of [[back, b], [front, f]]) {
    const id = ctx.getImageData(0, 0, W, H), q = id.data, gr = mul(3);
    for (let i = 0; i < q.length; i += 4) { if (!q[i + 3]) continue; const v = (gr() - .5) * 9; q[i] += v; q[i + 1] += v; q[i + 2] += v }
    ctx.putImageData(id, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'source-atop';
    const vg = ctx.createRadialGradient(cx, H * .45, W * .3, cx, H * .45, H * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  return { back, front, geom };
};
