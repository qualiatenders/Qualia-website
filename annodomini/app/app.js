(() => {
  const C = window.AD_CATALOG, P = window.ADPay;
  const $ = s => document.querySelector(s);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeBack = t => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
  const euro = v => '€ ' + v.toFixed(2).replace('.', ',');
  const fast = /[?&]fast/.test(location.search) ? 15 : 1;
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
    i.src = 'assets/' + src;
  }));
  const srcsFor = id => { const m = manifest.toppings[id]; return m.overlay ? [m.overlay] : m.variants.map(v => v.src) };
  const ensure = id => Promise.all(srcsFor(id).map(load));

  // ---------- screens ----------
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('is-active', s.id === id));
    $('#app').scrollTop = 0;
  }

  // ---------- pizza compositor ----------
  const cv = $('#pizza'), ctx = cv.getContext('2d');
  function fit() {
    const r = $('#stage').getBoundingClientRect();
    const css = Math.floor(Math.max(200, Math.min(r.width - 28, r.height - 40)));
    dpr = Math.min(3, window.devicePixelRatio || 1);
    cv.style.width = cv.style.height = css + 'px';
    cv.width = cv.height = Math.round(css * dpr);
    draw(performance.now());
  }
  let raf = 0;
  const kick = () => { if (!raf) raf = requestAnimationFrame(t => { raf = 0; draw(t) }) };

  function draw(now) {
    if (!manifest || !ready[manifest.base]) return;
    const W = cv.width, k = W / manifest.size, PR = manifest.pr * k, c = W / 2;
    ctx.clearRect(0, 0, W, W);
    ctx.drawImage(ready[manifest.base], 0, 0, W, W);
    let busy = false;
    const list = C.toppings.filter(t => state.active.has(t.id) || anims.has(t.id)).sort((a, b) => a.z - b.z);
    for (const t of list) {
      const m = manifest.toppings[t.id], a = anims.get(t.id);
      if (m.overlay) {
        const img = ready[m.overlay];
        if (!img) { busy = true; continue }
        let p = 1;
        if (a) { p = clamp((now - a.t0) / 600); if (a.dir < 0) p = 1 - p; if (now - a.t0 < 600) busy = true; else anims.delete(t.id) }
        ctx.globalAlpha = easeOut(p);
        const s = 1 + (1 - p) * .04, w = W * s;
        ctx.drawImage(img, c - w / 2, c - w / 2, w, w);
        ctx.globalAlpha = 1;
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
        const x = c + pc.x * PR, y = c + pc.y * PR - fall * PR * .16;
        ctx.globalAlpha = clamp(p * 1.8);
        ctx.shadowColor = `rgba(45,14,4,${.4 * (1 - fall * .6)})`;
        ctx.shadowBlur = PR * (.014 + fall * .05);
        ctx.shadowOffsetX = PR * (.006 + fall * .03);
        ctx.shadowOffsetY = PR * (.01 + fall * .06);
        ctx.drawImage(img, x - w / 2, y - w / 2, w, w);
      });
      ctx.shadowColor = 'transparent'; ctx.globalAlpha = 1;
      if (a) { if (now - a.t0 > stagger * (m.pieces.length - 1) + dur) anims.delete(t.id); else busy = true }
    }
    if (busy) kick();
  }

  // ---------- build screen ----------
  function pizzaName() {
    const on = id => state.active.has(id), n = state.active.size;
    if (!n) return 'Margherita';
    if (on('tartufo')) return 'Tartufata';
    if (on('prosciutto') && on('rucola')) return 'Parma e Rucola';
    if (on('burrata') && on('prosciutto')) return 'Burrata e Crudo';
    if (on('nduja') || on('salame')) return on('miele') ? 'Diavola al Miele' : 'Diavola';
    if (on('salsiccia')) return on('funghi') ? 'Salsiccia e Funghi' : 'Salsiccia';
    if (on('prosciutto')) return 'Crudo';
    if (on('burrata')) return 'Burrata';
    const cheeses = ['bufala', 'parmigiano', 'gorgonzola'].filter(on).length;
    if (cheeses >= 2) return 'Formaggi';
    if (on('funghi')) return 'Funghi';
    if ([...state.active].every(id => byId[id].cat === 'verdure')) return 'Ortolana';
    return 'Margherita Speciale';
  }
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
        <img src="assets/thumbs/${t.id}.webp" alt="" loading="lazy">
        <span><span class="n">${t.name}</span><span class="d" style="display:block">${t.desc}</span></span>
        <span class="p">+ ${euro(t.price)}<span class="tog"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 1v10M1 6h10"/></svg></span></span>
      </button>`).join('');
  }
  function refresh() {
    const name = pizzaName(), h = $('#pizza-name');
    if (h.textContent !== name) { h.style.opacity = 0; setTimeout(() => { h.textContent = name; h.style.opacity = 1 }, 180) }
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
  function snapshot() {
    anims.clear(); draw(performance.now());
    return cv.toDataURL('image/webp', .9);
  }
  function slots() {
    const d = new Date(Date.now() + 20 * 60e3);
    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
    return [0, 15, 30, 45].map(m => new Date(d.getTime() + m * 60e3)).map(t => t.toTimeString().slice(0, 5));
  }
  function renderPay() {
    const img = snapshot(), chosen = C.toppings.filter(t => state.active.has(t.id));
    $('#sum-img').src = img; $('#oven-img').src = img;
    $('#sum-name').textContent = pizzaName();
    $('#sum-desc').textContent = chosen.length ? chosen.map(t => t.name.replace(/^'/, '’')).join(' · ') : C.base.desc;
    $('#rows').innerHTML = `<div class="r"><span>Pizza ${C.base.name}</span><span>${euro(C.base.price)}</span></div>` +
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
      pizza: pizzaName(), toppings: [...state.active], amount: +total().toFixed(2), method: state.method, pickup: state.time,
      no: '047·' + String(Math.floor(100 + Math.random() * 900)),
    };
    try { sessionStorage.setItem('ad-order', JSON.stringify(order)) } catch (_) {}
    try { await P.start(order); startOven(order) }
    catch (err) { b.disabled = false; b.textContent = err.message; setTimeout(payButton, 2400) }
  });

  // ---------- oven ----------
  function paintOven() {
    const back = $('#oven-back'), front = $('#oven-front'), r = $('#s-oven').getBoundingClientRect();
    const S = Math.min(2, window.devicePixelRatio || 1), W = Math.round(r.width * S), H = Math.round(r.height * S);
    [back, front].forEach(c => { c.width = W; c.height = H });
    const b = back.getContext('2d'), f = front.getContext('2d'), u = W / 393;
    const cx = W / 2, my = H * .36, mw = W * .38, mh = W * .3, floor = my + mh * .55;
    $('#oven-pizza').style.setProperty('--floor', (floor / S) + 'px');
    let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    // brick dome face, lit from the mouth
    const bricks = ctx2 => {
      const bw = 60 * u, bh = 26 * u;
      for (let row = 0; row * bh < floor + bh; row++) for (let col = -1; col * bw < W + bw; col++) {
        const x = col * bw + (row % 2) * bw / 2, y = row * bh, d = Math.hypot((x + bw / 2 - cx) / (mw * 1.3), (y + bh / 2 - my) / (mh * 1.7));
        const glow = Math.max(0, 1.3 - d) * .9, v = 26 + rnd() * 16;
        ctx2.fillStyle = `rgb(${v + glow * 150 | 0},${v * .82 + glow * 62 | 0},${v * .7 + glow * 22 | 0})`;
        ctx2.fillRect(x + 1.2 * u, y + 1.2 * u, bw - 2.4 * u, bh - 2.4 * u);
      }
    };
    b.fillStyle = '#0E0D0C'; b.fillRect(0, 0, W, H);
    const arch = c => { c.beginPath(); c.moveTo(cx - mw, floor); c.lineTo(cx - mw, my); c.ellipse(cx, my, mw, mh, 0, Math.PI, 0); c.lineTo(cx + mw, floor); c.closePath() };
    // fire inside
    arch(b); const fg = b.createRadialGradient(cx, my + mh * .2, 10, cx, my, mw * 1.2);
    fg.addColorStop(0, '#FFE3A6'); fg.addColorStop(.25, '#FFB357'); fg.addColorStop(.55, '#D9601E'); fg.addColorStop(.85, '#5A1A08'); fg.addColorStop(1, '#1A0703');
    b.fillStyle = fg; b.fill();
    b.save(); arch(b); b.clip(); b.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 70; i++) {
      const fx = cx + (rnd() - .5) * mw * 1.7, fh = mh * (.4 + rnd() * .9), fw = mw * (.06 + rnd() * .12), by = floor;
      const g = b.createLinearGradient(0, by, 0, by - fh);
      g.addColorStop(0, 'rgba(255,210,120,.55)'); g.addColorStop(.5, 'rgba(255,120,40,.3)'); g.addColorStop(1, 'rgba(255,80,20,0)');
      b.fillStyle = g; b.beginPath(); b.moveTo(fx - fw, by); b.quadraticCurveTo(fx - fw * .6, by - fh * .6, fx + (rnd() - .5) * fw * 1.5, by - fh); b.quadraticCurveTo(fx + fw * .6, by - fh * .5, fx + fw, by); b.fill();
    }
    b.restore();
    // hearth in front of the mouth
    const fl = b.createLinearGradient(0, floor, 0, H); fl.addColorStop(0, '#3A2216'); fl.addColorStop(.25, '#1C1410'); fl.addColorStop(1, '#0B0A09');
    b.fillStyle = fl; b.fillRect(0, floor, W, H - floor);
    const sp = b.createRadialGradient(cx, floor, 10, cx, floor, mw * 2.4); sp.addColorStop(0, 'rgba(255,150,60,.45)'); sp.addColorStop(1, 'rgba(255,150,60,0)');
    b.fillStyle = sp; b.fillRect(0, my, W, H);
    // front wall with the mouth cut out — the pizza slides behind it
    f.save(); f.beginPath(); f.rect(0, 0, W, floor); f.clip(); f.fillStyle = '#0E0D0C'; f.fillRect(0, 0, W, floor); bricks(f);
    f.globalCompositeOperation = 'destination-out'; arch(f); f.fill(); f.globalCompositeOperation = 'source-over';
    f.lineWidth = 20 * u; f.strokeStyle = '#2B1E16'; f.beginPath(); f.ellipse(cx, my, mw + 10 * u, mh + 10 * u, 0, Math.PI, 0); f.stroke();
    f.fillStyle = '#2B1E16'; f.fillRect(cx - mw - 20 * u, my, 20 * u, floor - my); f.fillRect(cx + mw, my, 20 * u, floor - my);
    for (let i = 0; i <= 18; i++) { const a = Math.PI + i / 18 * Math.PI; f.strokeStyle = 'rgba(10,8,6,.9)'; f.lineWidth = 1.6 * u; f.beginPath(); f.moveTo(cx + Math.cos(a) * mw, my + Math.sin(a) * mh); f.lineTo(cx + Math.cos(a) * (mw + 20 * u), my + Math.sin(a) * (mh + 20 * u)); f.stroke() }
    f.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 50; i++) { const ex = cx + (rnd() - .5) * W * .9, ey = my - mh * .95 + rnd() * mh * .75, s = (.5 + rnd() * 1.4) * u * 2; const g = f.createRadialGradient(ex, ey, 0, ex, ey, s * 4); g.addColorStop(0, 'rgba(255,190,110,.9)'); g.addColorStop(1, 'rgba(255,120,40,0)'); f.fillStyle = g; f.fillRect(ex - s * 4, ey - s * 4, s * 8, s * 8) }
    f.restore();
  }

  let ovenTimer;
  function startOven(order) {
    const ov = $('#s-oven');
    ov.classList.remove('is-in'); $('#again').hidden = true;
    $('#order-no').textContent = `Bestelling #${order.no} · betaald`;
    $('#oven-title').innerHTML = 'Uw pizza gaat<br><i>de oven in</i>';
    $('#pickup-line').textContent = `Afhalen om ${order.pickup}`;
    ['st-1', 'st-2', 'st-3'].forEach((s, i) => $('#' + s).classList.toggle('on', i === 0));
    $('#progress').style.width = '0%'; $('#clock').textContent = '01:30';
    show('s-oven'); paintOven();
    void ov.offsetWidth; ov.classList.add('is-in');
    document.documentElement.style.setProperty('--bake', 90 / fast + 's');
    clearInterval(ovenTimer);
    const BAKE = 90, t0 = Date.now() + 3600 / fast;
    ovenTimer = setInterval(() => {
      const el = clamp((Date.now() - t0) / 1000 * fast, 0, BAKE), left = BAKE - el;
      if (Date.now() >= t0) { $('#st-2').classList.add('on'); $('#oven-title').innerHTML = 'In de <i>houtoven</i>' }
      const sec = Math.ceil(left); $('#clock').textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
      $('#progress').style.width = (el / BAKE * 100) + '%';
      if (el >= BAKE) {
        clearInterval(ovenTimer);
        $('#clock').textContent = '00:00'; $('#st-3').classList.add('on');
        $('#oven-title').innerHTML = 'Buon <i>appetito</i>';
        $('#again').hidden = false; navigator.vibrate?.([20, 60, 20]);
      }
    }, 250);
  }
  $('#again').addEventListener('click', () => {
    clearInterval(ovenTimer); state.active.clear(); anims.clear(); shownTotal = C.base.price;
    $('#total').textContent = euro(C.base.price); $('#pizza-name').textContent = 'Margherita';
    renderTabs(); renderList(); show('s-build'); fit();
  });

  // ---------- boot ----------
  renderTabs(); renderList();
  fetch('assets/pizza/manifest.json').then(r => r.json()).then(m => {
    manifest = m;
    load(m.base).then(fit);
    // warm the cache in the background, first category first
    const order = C.toppings.slice().sort((a, b) => (a.cat === state.cat ? -1 : 0) - (b.cat === state.cat ? -1 : 0));
    order.reduce((p, t) => p.then(() => ensure(t.id)).catch(() => {}), Promise.resolve());
    if (location.hash === '#oven') {
      try { const o = JSON.parse(sessionStorage.getItem('ad-order')); if (o) { o.toppings.forEach(id => state.active.add(id)); Promise.all([load(m.base), ...o.toppings.map(ensure)]).then(() => { fit(); $('#oven-img').src = snapshot(); startOven(o) }) } } catch (_) {}
    }
  });
  addEventListener('resize', () => { fit(); if ($('#s-oven').classList.contains('is-active')) paintOven() });
})();
