/**
 * Geo interaction layer. Plain browser JavaScript with no dependencies, so the
 * same file runs in the Next.js app (components/GeoFx.tsx) and is inlined into
 * the static preview export.
 *
 *   [data-globe]        news globe: real coastlines, story pins, drag/rotate
 *   [data-geo-cursor]   GIS cursor: crosshair, live lat/lon and a scale bar
 *   [data-tiles]        image builds up tile by tile, like a web map loading
 *   [data-coord]        coordinates count up to their value, like a GNSS fix
 *   svg[data-contour]   contour lines draw themselves in
 *
 * Everything degrades to static content without JS and respects
 * prefers-reduced-motion.
 */
export function initGeoFx(root = document) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const cleanups = [];

  /* ── Shared "first time in view" observer ───────────────────────────── */
  const onView = new Map();
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const fn = onView.get(e.target);
        if (fn) fn();
        onView.delete(e.target);
        io.unobserve(e.target);
      }),
    { rootMargin: '0px 0px -6% 0px', threshold: 0.12 },
  );
  const whenVisible = (el, fn) => {
    onView.set(el, fn);
    io.observe(el);
  };
  cleanups.push(() => io.disconnect());

  /* ── Map tiles: images resolve tile by tile ─────────────────────────── */
  root.querySelectorAll('[data-tiles]:not([data-tiles-ready])').forEach((el) => {
    el.setAttribute('data-tiles-ready', '');
    if (reduce) return;
    const cols = 8;
    const rows = 5;
    const grid = document.createElement('div');
    grid.className = 'geo-tiles';
    grid.setAttribute('aria-hidden', 'true');
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const t = document.createElement('span');
        // Tiles resolve from the centre outwards, with a little jitter.
        const d = Math.hypot(c - (cols - 1) / 2, r - (rows - 1) / 2);
        t.style.setProperty('--d', `${Math.round(d * 70 + Math.random() * 120)}ms`);
        grid.appendChild(t);
      }
    el.appendChild(grid);
    whenVisible(el, () => {
      grid.classList.add('go');
      setTimeout(() => grid.remove(), 1600);
    });
  });

  /* ── Coordinates count up like a position fix ───────────────────────── */
  root.querySelectorAll('[data-coord]:not([data-coord-ready])').forEach((el) => {
    el.setAttribute('data-coord-ready', '');
    const target = Math.abs(Number(el.getAttribute('data-coord')));
    const digits = Number(el.getAttribute('data-digits') || 4);
    if (reduce || !Number.isFinite(target)) return;
    el.textContent = (0).toFixed(digits);
    whenVisible(el, () => {
      const t0 = performance.now();
      const dur = 1400;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 4);
        // Last digits jitter until the fix settles.
        const noise = k < 1 ? (Math.random() - 0.5) * (1 - k) * 0.01 : 0;
        el.textContent = Math.max(0, target * e + noise).toFixed(digits);
        if (k < 1) requestAnimationFrame(step);
        else el.closest('[data-fix]')?.classList.add('fixed');
      };
      requestAnimationFrame(step);
    });
  });

  /* ── Contour lines draw in ──────────────────────────────────────────── */
  root.querySelectorAll('svg[data-contour]:not([data-contour-ready])').forEach((svg) => {
    svg.setAttribute('data-contour-ready', '');
    if (reduce) return svg.classList.add('drawn');
    svg.classList.add('armed');
    whenVisible(svg, () => svg.classList.add('drawn'));
  });

  /* ── GIS cursor over large imagery ──────────────────────────────────── */
  const cursorEls = [...root.querySelectorAll('[data-geo-cursor]')];
  if (cursorEls.length && fine) {
    let active = null;
    let overlay = null;
    const make = () => {
      const o = document.createElement('div');
      o.className = 'geo-cursor';
      o.setAttribute('aria-hidden', 'true');
      o.innerHTML = '<i class="h"></i><i class="v"></i><b class="ring"></b><span class="readout"></span><span class="scale"><em></em><small></small></span>';
      return o;
    };
    const fmt = (v, pos, neg) => `${Math.abs(v).toFixed(4)}° ${v >= 0 ? pos : neg}`;
    const move = (e) => {
      const hit = cursorEls.find((el) => {
        const r = el.getBoundingClientRect();
        return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      });
      if (hit !== active) {
        overlay?.remove();
        overlay = null;
        active = hit || null;
        if (active) {
          overlay = make();
          active.appendChild(overlay);
        }
      }
      if (!active || !overlay) return;
      const r = active.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const [lat0, lon0] = (active.getAttribute('data-geo-cursor') || '0,0').split(',').map(Number);
      // The image is treated as a ~40 km wide view centred on the story location.
      const spanLon = 0.36 / Math.max(0.2, Math.cos((lat0 * Math.PI) / 180));
      const spanLat = spanLon * (r.height / r.width) * Math.cos((lat0 * Math.PI) / 180);
      const lat = lat0 + (0.5 - y / r.height) * spanLat;
      const lon = lon0 + (x / r.width - 0.5) * spanLon;
      overlay.style.setProperty('--x', `${x}px`);
      overlay.style.setProperty('--y', `${y}px`);
      overlay.querySelector('.readout').textContent = `${fmt(lat, 'N', 'S')}   ${fmt(lon, 'E', 'W')}`;
      const km = Math.round(((spanLon * 111.32 * Math.cos((lat0 * Math.PI) / 180)) / r.width) * 120 * 10) / 10;
      overlay.querySelector('.scale small').textContent = `${km} km`;
      overlay.classList.toggle('flip-x', x > r.width - 260);
      overlay.classList.toggle('flip-y', y > r.height - 60);
    };
    const leave = () => {
      overlay?.remove();
      overlay = null;
      active = null;
    };
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('scroll', leave, { passive: true });
    cleanups.push(() => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('scroll', leave);
      leave();
    });
  }

  /* ── News globe ─────────────────────────────────────────────────────── */
  root.querySelectorAll('[data-globe]:not([data-globe-ready])').forEach((wrap) => {
    wrap.setAttribute('data-globe-ready', '');
    const canvas = wrap.querySelector('canvas');
    const dataEl = wrap.querySelector('script[type="application/json"]');
    if (!canvas || !dataEl) return;
    const { land, pins } = JSON.parse(dataEl.textContent);
    const links = [...wrap.querySelectorAll('[data-pin]')];
    const tip = wrap.querySelector('[data-globe-tip]');
    const ctx = canvas.getContext('2d');
    const rad = Math.PI / 180;
    const first = pins[0] || { lat: 20, lon: 0 };
    let lam0 = -first.lon + 25;
    let phi0 = Math.max(-35, Math.min(35, first.lat * 0.6));
    let target = null;
    let hover = -1;
    let dragging = null;
    let running = false;
    let visible = false;
    let last = performance.now();
    let size = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      size = canvas.clientWidth;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      draw(last);
    };

    const project = (lon, lat) => {
      const l = (lon + lam0) * rad;
      const p = lat * rad;
      const p0 = phi0 * rad;
      const cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
      const x = Math.cos(p) * Math.sin(l);
      const y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l);
      return [x, -y, cosc];
    };

    const css = getComputedStyle(wrap);
    const col = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
    const C = {
      ocean: col('--globe-ocean', '#10141a'),
      land: col('--globe-land', '#2b313a'),
      coast: col('--globe-coast', '#4a525e'),
      grid: col('--globe-grid', 'rgba(255,255,255,0.06)'),
      pin: col('--globe-pin', '#d71920'),
      halo: col('--globe-halo', 'rgba(120,170,255,0.25)'),
    };

    function draw(t) {
      if (!size) return;
      const R = size / 2 - 6;
      const cx = size / 2;
      const cy = size / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // Atmosphere halo + ocean
      const halo = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.04);
      halo.addColorStop(0, 'rgba(0,0,0,0)');
      halo.addColorStop(0.7, C.halo);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.04, 0, Math.PI * 2);
      ctx.fill();
      const ocean = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.1, cx, cy, R);
      ocean.addColorStop(0, '#1a212b');
      ocean.addColorStop(1, C.ocean);
      ctx.fillStyle = ocean;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Graticule (15°)
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      const line = (pts) => {
        let pen = false;
        ctx.beginPath();
        for (const [lon, lat] of pts) {
          const [x, y, c] = project(lon, lat);
          if (c > 0) {
            if (pen) ctx.lineTo(cx + x * R, cy + y * R);
            else ctx.moveTo(cx + x * R, cy + y * R);
            pen = true;
          } else pen = false;
        }
        ctx.stroke();
      };
      for (let lon = -180; lon < 180; lon += 15) line(Array.from({ length: 61 }, (_, i) => [lon, -90 + i * 3]));
      for (let lat = -75; lat <= 75; lat += 15) line(Array.from({ length: 121 }, (_, i) => [-180 + i * 3, lat]));

      // Land: points behind the limb are pushed onto the horizon so fills stay closed.
      ctx.fillStyle = C.land;
      ctx.strokeStyle = C.coast;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (const ring of land) {
        let any = false;
        for (let i = 0; i < ring.length; i += 2) {
          const [x, y, c] = project(ring[i], ring[i + 1]);
          if (c > 0) {
            any = true;
            break;
          }
        }
        if (!any) continue;
        for (let i = 0; i < ring.length; i += 2) {
          let [x, y, c] = project(ring[i], ring[i + 1]);
          if (c <= 0) {
            const n = Math.hypot(x, y) || 1;
            x /= n;
            y /= n;
          }
          if (i === 0) ctx.moveTo(cx + x * R, cy + y * R);
          else ctx.lineTo(cx + x * R, cy + y * R);
        }
        ctx.closePath();
      }
      ctx.fill('evenodd');
      ctx.stroke();

      // Terminator-style shading for depth
      const shade = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.45, R * 0.2, cx, cy, R * 1.05);
      shade.addColorStop(0, 'rgba(255,255,255,0.05)');
      shade.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Pins
      pins.forEach((pin, i) => {
        const [x, y, c] = project(pin.lon, pin.lat);
        pin._screen = c > 0.05 ? [cx + x * R, cy + y * R] : null;
        if (!pin._screen) return;
        const [px, py] = pin._screen;
        const on = i === hover;
        if (!reduce) {
          const ph = ((t / 1600 + i * 0.37) % 1 + 1) % 1;
          ctx.strokeStyle = `rgba(215,25,32,${(1 - ph) * 0.8})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(px, py, 4 + ph * 16, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = on ? '#ffffff' : C.pin;
        ctx.beginPath();
        ctx.arc(px, py, on ? 6 : 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = on ? C.pin : 'rgba(255,255,255,0.9)';
        ctx.lineWidth = on ? 3 : 1.2;
        ctx.stroke();
      });
      // Keep the tooltip on its pin while the globe turns.
      if (tip && hover >= 0) {
        const s = pins[hover]._screen;
        tip.hidden = !s;
        if (s) {
          tip.style.left = `${s[0]}px`;
          tip.style.top = `${s[1]}px`;
        }
      }
    }

    function frame(t) {
      if (!running) return;
      const dt = Math.min(64, t - last);
      last = t;
      if (target) {
        // Fly to a pin along the shortest way round.
        let d = (((target.lam - lam0 + 540) % 360) - 180);
        lam0 += d * Math.min(1, dt / 220);
        phi0 += (target.phi - phi0) * Math.min(1, dt / 220);
        if (Math.abs(d) < 0.05 && Math.abs(target.phi - phi0) < 0.05) target = null;
      } else if (!dragging && hover < 0 && !reduce) {
        lam0 += dt * 0.006;
      }
      draw(t);
      requestAnimationFrame(frame);
    }
    const start = () => {
      if (running || !visible) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    };
    const stop = () => (running = false);

    const vis = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      visible ? start() : stop();
    });
    vis.observe(canvas);

    const pick = (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      let best = -1;
      let bd = 14;
      pins.forEach((p, i) => {
        if (!p._screen) return;
        const d = Math.hypot(p._screen[0] - x, p._screen[1] - y);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    };
    const showTip = (i) => {
      hover = i;
      links.forEach((l, k) => l.classList.toggle('active', k === i));
      if (!tip) return;
      if (i < 0 || !pins[i]._screen) {
        tip.hidden = true;
        return;
      }
      const p = pins[i];
      tip.hidden = false;
      tip.querySelector('[data-tip-place]').textContent = p.name;
      tip.querySelector('[data-tip-title]').textContent = p.title;
      tip.style.left = `${p._screen[0]}px`;
      tip.style.top = `${p._screen[1]}px`;
    };

    canvas.addEventListener('pointerdown', (e) => {
      dragging = { x: e.clientX, y: e.clientY, lam: lam0, phi: phi0, moved: false };
      canvas.setPointerCapture(e.pointerId);
      target = null;
    });
    canvas.addEventListener('pointermove', (e) => {
      if (dragging) {
        const dx = e.clientX - dragging.x;
        const dy = e.clientY - dragging.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) dragging.moved = true;
        lam0 = dragging.lam + dx * 0.4;
        phi0 = Math.max(-60, Math.min(60, dragging.phi + dy * 0.3));
        if (!running) draw(performance.now());
        return;
      }
      const i = pick(e);
      canvas.style.cursor = i >= 0 ? 'pointer' : 'grab';
      showTip(i);
    });
    canvas.addEventListener('pointerup', (e) => {
      const d = dragging;
      dragging = null;
      if (d && !d.moved) {
        const i = pick(e);
        if (i >= 0) links[i]?.click();
      }
    });
    canvas.addEventListener('pointerleave', () => showTip(-1));

    links.forEach((l, i) => {
      const fly = () => {
        target = { lam: -pins[i].lon, phi: Math.max(-45, Math.min(45, pins[i].lat)) };
        showTip(i);
        start();
      };
      l.addEventListener('mouseenter', fly);
      l.addEventListener('focus', fly);
      l.addEventListener('mouseleave', () => showTip(-1));
      l.addEventListener('blur', () => showTip(-1));
    });

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    cleanups.push(() => {
      stop();
      vis.disconnect();
      ro.disconnect();
    });
  });

  return () => cleanups.forEach((c) => c());
}
