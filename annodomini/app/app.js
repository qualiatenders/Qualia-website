(() => {
  const C = window.AD_CATALOG, P = window.ADPay;
  const $ = s => document.querySelector(s);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeBack = t => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
  const euro = v => '€ ' + v.toFixed(2).replace('.', ',');
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const fast = /[?&]fast/.test(location.search) ? 15 : 1;
  // assets resolve through AD_ASSETS when the app is bundled into one file
  const asset = p => (window.AD_ASSETS && AD_ASSETS[p]) || p;
  const byId = Object.fromEntries(C.toppings.map(t => [t.id, t]));

  const state = { active: new Set(), cat: C.categories[0].id, time: null, method: null };
  const anims = new Map();
  const ready = {}, loading = {};
  let manifest, dpr = 1;

  // ---------- assets ----------
  const load = src => loading[src] || (loading[src] = new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => { ready[src] = i; res(i) };
    i.onerror = rej;
    i.src = asset('assets/' + src);
  }));
  const srcsFor = id => { const m = manifest.toppings[id]; return m.overlay ? [m.overlay] : m.variants.map(v => v.src) };
  const ensure = id => Promise.all(srcsFor(id).map(load));

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('is-active', s.id === id));
    $('#app').scrollTop = 0;
  }

  // ---------- pizza compositor ----------
  const cv = $('#pizza'), ctx = cv.getContext('2d');
  function fit() {
    const r = $('#stage').getBoundingClientRect(), b = $('#s-build').getBoundingClientRect();
    const css = Math.floor(Math.max(200, Math.min(r.width - 28, r.height - 36)));
    dpr = Math.min(3, window.devicePixelRatio || 1);
    cv.style.width = cv.style.height = css + 'px';
    cv.width = cv.height = Math.round(css * dpr);
    // centre the floured bench (1179×1500) under the pizza
    const mid = r.top - b.top + r.height / 2, bw = Math.max(b.width, css * 1.08, mid / .62);
    $('#s-build').style.setProperty('--bw', bw + 'px');
    $('#s-build').style.setProperty('--by', (mid - bw * 1500 / 1179 / 2) + 'px');
    draw(performance.now());
  }
  let raf = 0;
  const kick = () => { if (!raf) raf = requestAnimationFrame(t => { raf = 0; draw(t) }) };

  function composite(c, W, now, animate) {
    const k = W / manifest.size, PR = manifest.pr * k, mid = W / 2;
    c.clearRect(0, 0, W, W);
    c.drawImage(ready[manifest.base], 0, 0, W, W);
    let busy = false;
    const list = C.toppings.filter(t => state.active.has(t.id) || (animate && anims.has(t.id))).sort((a, b) => a.z - b.z);
    for (const t of list) {
      const m = manifest.toppings[t.id], a = animate ? anims.get(t.id) : null;
      if (m.overlay) {
        const img = ready[m.overlay];
        if (!img) { busy = true; continue }
        let p = 1;
        if (a) { p = clamp((now - a.t0) / 600); if (a.dir < 0) p = 1 - p; if (now - a.t0 < 600) busy = true; else anims.delete(t.id) }
        c.globalAlpha = easeOut(p);
        const w = W * (1 + (1 - p) * .04);
        c.drawImage(img, mid - w / 2, mid - w / 2, w, w);
        c.globalAlpha = 1;
        continue;
      }
      const stagger = a && a.dir > 0 ? 45 : 16, dur = a && a.dir > 0 ? 520 : 260;
      m.pieces.forEach((pc, i) => {
        const v = m.variants[pc.v], img = ready[v.src];
        if (!img) { busy = true; return }
        let p = 1;
        if (a) { p = clamp((now - a.t0 - i * stagger) / dur); if (a.dir < 0) p = 1 - p }
        if (p <= 0) return;
        const e = a && a.dir > 0 ? easeBack(p) : easeOut(p), fall = 1 - clamp(e);
        const w = v.w * k * (1 + fall * .35 + (e > 1 ? (e - 1) * -.25 : 0));
        const x = mid + pc.x * PR, y = mid + pc.y * PR - fall * PR * .16;
        c.globalAlpha = clamp(p * 1.8);
        c.shadowColor = `rgba(45,14,4,${.4 * (1 - fall * .6)})`;
        c.shadowBlur = PR * (.014 + fall * .05);
        c.shadowOffsetX = PR * (.006 + fall * .03);
        c.shadowOffsetY = PR * (.01 + fall * .06);
        c.drawImage(img, x - w / 2, y - w / 2, w, w);
      });
      c.shadowColor = 'transparent'; c.globalAlpha = 1;
      if (a) { if (now - a.t0 > stagger * (m.pieces.length - 1) + dur) anims.delete(t.id); else busy = true }
    }
    return busy;
  }
  function draw(now) {
    if (!manifest || !ready[manifest.base]) return;
    if (composite(ctx, cv.width, now, true)) kick();
  }
  // a still of the finished pizza at any resolution
  function still(size) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    composite(c.getContext('2d'), size, performance.now(), false);
    return c;
  }
  // the same still with a dough rim, so it reads as a real pizza when seen at an angle
  function extruded(size) {
    const top = still(size), depth = Math.round(size * .075);
    const rim = document.createElement('canvas'); rim.width = size; rim.height = size + depth;
    const r = rim.getContext('2d');
    for (let k = depth; k > 0; k--) r.drawImage(top, 0, k);
    r.globalCompositeOperation = 'source-atop';
    const g = r.createLinearGradient(0, size * .5, 0, size + depth);
    g.addColorStop(0, 'rgba(40,22,10,.35)'); g.addColorStop(1, 'rgba(25,12,5,.7)');
    r.fillStyle = g; r.fillRect(0, 0, size, size + depth);
    r.globalCompositeOperation = 'source-over'; r.drawImage(top, 0, 0);
    return rim;
  }

  // ---------- build screen ----------
  const total = () => C.base.price + [...state.active].reduce((s, id) => s + byId[id].price, 0);

  let shownTotal = C.base.price;
  function animateTotal(to) {
    const from = shownTotal, t0 = performance.now(), el = $('#total');
    const step = now => { const p = clamp((now - t0) / 380); shownTotal = from + (to - from) * easeOut(p); el.textContent = euro(shownTotal); if (p < 1) requestAnimationFrame(step) };
    requestAnimationFrame(step);
  }
  function renderTabs() {
    $('#tabs').innerHTML = C.categories.map(c => {
      const n = C.toppings.filter(t => t.cat === c.id && state.active.has(t.id)).length;
      return `<button class="tab" role="tab" aria-selected="${c.id === state.cat}" data-cat="${c.id}">${c.name}${n ? `<span class="cnt">${n}</span>` : ''}</button>`;
    }).join('');
  }
  function renderList() {
    $('#list').innerHTML = C.toppings.filter(t => t.cat === state.cat).map(t => `
      <button class="item" data-id="${t.id}" aria-pressed="${state.active.has(t.id)}">
        <img src="${asset(`assets/thumbs/${t.id}.webp`)}" alt="" loading="lazy">
        <span><span class="n">${t.name}</span><span class="d" style="display:block">${t.desc}</span></span>
        <span class="p">+ ${euro(t.price)}<span class="tog"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 1v10M1 6h10"/></svg></span></span>
      </button>`).join('');
  }
  function refresh() {
    animateTotal(total());
    renderTabs();
    document.querySelectorAll('.item').forEach(b => b.setAttribute('aria-pressed', state.active.has(b.dataset.id)));
  }
  function toggle(id) {
    const on = !state.active.has(id);
    on ? state.active.add(id) : state.active.delete(id);
    anims.set(id, { t0: performance.now() + (on && !srcsFor(id).every(s => ready[s]) ? 120 : 0), dir: on ? 1 : -1 });
    ensure(id).then(() => { if (anims.has(id)) anims.get(id).t0 = Math.max(anims.get(id).t0, performance.now() - 16); kick() });
    navigator.vibrate?.(8);
    refresh(); kick();
  }
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (!b) return; state.cat = b.dataset.cat; renderTabs(); renderList(); $('#list').scrollTop = 0 });
  $('#list').addEventListener('click', e => { const b = e.target.closest('.item'); if (b) toggle(b.dataset.id) });
  $('#reset').addEventListener('click', () => { [...state.active].forEach(toggle) });
  $('#start').addEventListener('click', () => { show('s-build'); requestAnimationFrame(fit) });

  // ---------- checkout ----------
  function slots() {
    const d = new Date(Date.now() + 20 * 60e3);
    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
    return [0, 15, 30, 45].map(m => new Date(d.getTime() + m * 60e3)).map(t => t.toTimeString().slice(0, 5));
  }
  function renderPay() {
    anims.clear(); draw(performance.now());
    const chosen = C.toppings.filter(t => state.active.has(t.id));
    $('#sum-img').src = still(240).toDataURL('image/webp', .9);
    $('#sum-desc').textContent = chosen.length ? chosen.map(t => t.name).join(' · ') : C.base.desc;
    $('#rows').innerHTML = `<div class="r"><span>${C.base.name}</span><span>${euro(C.base.price)}</span></div>` +
      chosen.map(t => `<div class="r"><span>${t.name}</span><span>+ ${t.price.toFixed(2).replace('.', ',')}</span></div>`).join('') +
      `<div class="r t"><span>Totaal</span><span>${euro(total())}</span></div>`;
    const ts = slots(); state.time = state.time && ts.includes(state.time) ? state.time : ts[0];
    $('#times').innerHTML = ts.map((t, i) => `<button class="time" role="radio" aria-checked="${t === state.time}" data-t="${t}">${t}<small>${i ? '&nbsp;' : 'eerst'}</small></button>`).join('');
    const methods = P.methods.filter(m => P.available(m.id));
    state.method = state.method && methods.some(m => m.id === state.method) ? state.method : methods[0].id;
    $('#methods').innerHTML = methods.map(m => `
      <button class="pm" role="radio" aria-checked="${m.id === state.method}" data-m="${m.id}">
        <span class="logo" style="${m.style}">${m.logo}</span><span class="nm">${m.name}<small>${m.sub}</small></span><span class="radio"></span>
      </button>`).join('');
    $('.secure').innerHTML = 'Veilig betalen · versleuteld via Mollie' + (P.mode === 'demo' ? '<span class="demo">Demo-modus — er wordt niets afgeschreven</span>' : '');
    payButton();
  }
  function payButton() {
    const m = P.methods.find(x => x.id === state.method), b = $('#pay');
    b.className = 'btn-pay ' + (m.cls || ''); b.disabled = false;
    b.innerHTML = `${m.button} <span style="opacity:.6;font-weight:400">· ${euro(total())}</span>`;
  }
  $('#to-pay').addEventListener('click', () => { renderPay(); show('s-pay') });
  $('#back').addEventListener('click', () => show('s-build'));
  $('#times').addEventListener('click', e => { const b = e.target.closest('.time'); if (!b) return; state.time = b.dataset.t; document.querySelectorAll('.time').forEach(x => x.setAttribute('aria-checked', x === b)) });
  $('#methods').addEventListener('click', e => { const b = e.target.closest('.pm'); if (!b) return; state.method = b.dataset.m; document.querySelectorAll('.pm').forEach(x => x.setAttribute('aria-checked', x === b)); payButton() });
  $('#pay').addEventListener('click', async () => {
    const b = $('#pay'); b.disabled = true; b.innerHTML = '<span class="spin"></span> Betaling verwerken…';
    const order = {
      pizza: 'Eigen pizza', toppings: [...state.active], amount: +total().toFixed(2), method: state.method, pickup: state.time,
      no: '047·' + String(Math.floor(100 + Math.random() * 900)),
    };
    try { sessionStorage.setItem('ad-order', JSON.stringify(order)) } catch (_) {}
    try { await P.start(order); bake(order) }
    catch (err) { b.disabled = false; b.textContent = err.message; setTimeout(payButton, 2400) }
  });

  // ---------- oven ----------
  let fire, flick = 0, ovenGeo;
  function layoutOven() {
    const g = manifest.oven, r = $('#s-oven').getBoundingClientRect(), W = r.width, H = r.height;
    const s = Math.max(W / g.W, H / g.H), iw = g.W * s, ih = g.H * s, ox = (W - iw) / 2, oy = Math.min(0, (H - ih) * .35);
    ['#ov-back', '#ov-front'].forEach(q => Object.assign($(q).style, { width: iw + 'px', height: ih + 'px', left: ox + 'px', top: oy + 'px' }));
    const fc = $('#ov-fire'), fd = Math.min(2, window.devicePixelRatio || 1);
    Object.assign(fc.style, { width: W + 'px', height: H + 'px' }); fc.width = Math.round(W * fd); fc.height = Math.round(H * fd);
    const px = v => ox + v * iw, py = v => oy + v * ih;
    ovenGeo = { W, H, floor: py(g.floor), fireX: px(g.fireX), fireY: py(g.fireY), mouthW: (g.mouthR - g.mouthL) * iw };
    $('#ov-light').style.setProperty('--fx', (ovenGeo.fireX / W * 100) + '%');
    $('#ov-light').style.setProperty('--fy', (ovenGeo.fireY / H * 100) + '%');
    if (!fire) fire = window.ADFire && ADFire(fc);
    if (fire) { fire.state.seat = [ovenGeo.fireX / W, 1 - ovenGeo.fireY / H]; fire.state.spread = .26 * ih / H * (2556 / g.H) }
  }
  // pizza positions: on the peel in front of the oven / on the hearth inside
  const baseW = () => ovenGeo.W * .84;
  function poseT(where, w) {
    const g = ovenGeo, out = where === 'out', target = out ? g.W * .84 : g.mouthW * .5;
    const cx = g.W / 2 - (out ? 0 : g.W * .06), cy = out ? g.floor + (g.H - g.floor) * .32 : g.floor - g.W * .02;
    return `translate(${cx - w / 2}px,${cy - w / 2}px) perspective(${g.W * 2}px) rotateX(${out ? 58 : 74}deg) scale(${target / w})`;
  }
  function placePizza(where) {
    const el = $('#ov-pizza'); el.style.setProperty('--pw', baseW() + 'px'); el.style.transform = poseT(where, baseW());
  }
  function movePizza(from, to, ms) {
    const w = baseW();
    return $('#ov-pizza').animate([{ transform: poseT(from, w) }, { transform: poseT(to, w) }], { duration: ms, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards' }).finished;
  }
  function flicker() {
    if (!$('#s-oven').classList.contains('is-active')) return;
    flick += (Math.random() - .5) * .25; flick *= .86;
    const heat = 1 + flick;
    if (fire) fire.state.heat = heat;
    $('#ov-light').style.opacity = (.45 + flick * .6).toFixed(3);
    setTimeout(flicker, 70);
  }
  async function bake(order) {
    show('s-oven'); layoutOven();
    const pc = $('#ov-img'), ex = extruded(Math.round(Math.min(1080, ovenGeo.W * 2.4)));
    pc.width = ex.width; pc.height = ex.height; pc.getContext('2d').drawImage(ex, 0, 0);
    $('#ov-pizza').getAnimations().forEach(a => a.cancel());
    $('.peel').classList.remove('away');
    placePizza('out');
    $('#order-no').textContent = `Bestelling #${order.no} · betaald`;
    $('#oven-title').innerHTML = 'Uw pizza gaat<br><i>de oven in</i>';
    $('#pickup-time').textContent = order.pickup;
    $('#ready').classList.remove('shown'); $('#again').hidden = true;
    fire?.start(); flicker();
    await wait(900);
    await movePizza('out', 'in', 2600);
    $('.peel').classList.add('away');
    $('#oven-title').innerHTML = 'Uw pizza is<br><i>in de oven</i>';
    $('#ready').classList.add('shown'); $('#again').hidden = false;
    navigator.vibrate?.(14);
  }
  $('#again').addEventListener('click', () => {
    fire?.stop(); state.active.clear(); anims.clear(); shownTotal = C.base.price;
    $('#total').textContent = euro(C.base.price);
    renderTabs(); renderList(); show('s-build'); fit();
  });

  // ---------- boot ----------
  renderTabs(); renderList();
  (window.AD_MANIFEST ? Promise.resolve(AD_MANIFEST) : fetch('assets/pizza/manifest.json').then(r => r.json())).then(m => {
    manifest = m;
    load(m.base).then(fit);
    const order = C.toppings.slice().sort((a, b) => (a.cat === state.cat ? -1 : 0) - (b.cat === state.cat ? -1 : 0));
    order.reduce((p, t) => p.then(() => ensure(t.id)).catch(() => {}), Promise.resolve());
    if (location.hash === '#oven') {
      try { const o = JSON.parse(sessionStorage.getItem('ad-order')); if (o) { o.toppings.forEach(id => state.active.add(id)); Promise.all([load(m.base), ...o.toppings.map(ensure)]).then(() => { fit(); bake(o) }) } } catch (_) {}
    }
  });
  addEventListener('resize', () => { fit(); if (manifest && $('#s-oven').classList.contains('is-active')) layoutOven() });
})();
