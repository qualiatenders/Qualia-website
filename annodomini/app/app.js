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
  const cart = [];   // pizzas already added to the order: { toppings: [ids], price, img }
  const extras = new Map();   // dessert/drink id → quantity
  const exById = Object.fromEntries(C.extras.map(e => [e.id, e]));
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)) } catch (_) { return null } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (_) {} } };
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

  function composite(c, W, now, animate, set = state.active) {
    const k = W / manifest.size, PR = manifest.pr * k, mid = W / 2;
    c.clearRect(0, 0, W, W);
    c.drawImage(ready[manifest.base], 0, 0, W, W);
    let busy = false;
    const list = C.toppings.filter(t => set.has(t.id) || (animate && anims.has(t.id))).sort((a, b) => a.z - b.z);
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
  function still(size, set = state.active) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    composite(c.getContext('2d'), size, performance.now(), false, set);
    return c;
  }
  // the same still with a dough rim, so it reads as a real pizza when seen at an angle
  function extruded(size, set) {
    const top = still(size, set), depth = Math.round(size * .075);
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
  const priceOf = set => C.base.price + [...set].reduce((s, id) => s + byId[id].price, 0);
  const total = () => priceOf(state.active);
  const extrasTotal = () => [...extras].reduce((s, [id, q]) => s + exById[id].price * q, 0);
  const cartTotal = () => cart.reduce((s, p) => s + p.price, 0) + extrasTotal();
  const plural = n => n === 1 ? '1 pizza' : `${n} pizza's`;
  const descOf = ids => ids.length ? C.toppings.filter(t => ids.includes(t.id)).map(t => t.name).join(' · ') : C.base.desc;

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
    $('#bar-label').textContent = cart.length ? `Pizza ${cart.length + 1}` : 'Totaal';
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
  function renderExtras() {
    const html = C.extras.map(e => {
      const q = extras.get(e.id) || 0;
      return `<div class="xcard${q ? ' on' : ''}">
        <img src="${asset(`assets/extras/${e.id}.webp`)}" alt="">
        <div class="n">${e.name}</div>
        <div class="pz">${euro(e.price)}</div>
        ${q
          ? `<span class="xstep"><button data-x="${e.id}" data-d="-1" aria-label="${e.name} minder">−</button><b>${q}</b><button data-x="${e.id}" data-d="1" aria-label="${e.name} meer">+</button></span>`
          : `<button class="xadd" data-x="${e.id}" data-d="1">Toevoegen</button>`}
      </div>`;
    }).join('');
    document.querySelectorAll('.extras').forEach(el => { const x = el.scrollLeft; el.innerHTML = html; el.scrollLeft = x });
  }
  function bumpExtra(id, d) {
    const q = Math.max(0, (extras.get(id) || 0) + d);
    q ? extras.set(id, q) : extras.delete(id);
    navigator.vibrate?.(6);
    renderExtras(); updateSums();
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (b) bumpExtra(b.dataset.x, +b.dataset.d) });
  function updateSums() {
    const n = cart.length, x = [...extras.values()].reduce((a, b) => a + b, 0);
    $('#added-sum').textContent = `${plural(n)}${x ? ` + ${x} extra` : ''} in uw bestelling · ${euro(cartTotal())}`;
    $('#checkout-total').textContent = euro(cartTotal());
    if ($('#s-pay').classList.contains('is-active')) renderPay();
  }

  function resetBuilder(ids = []) {
    state.active = new Set(ids); anims.clear(); shownTotal = total();
    $('#total').textContent = euro(total());
    renderTabs(); renderList(); refresh(); draw(performance.now());
  }
  function addToCart() {
    anims.clear(); draw(performance.now());
    const ids = C.toppings.filter(t => state.active.has(t.id)).map(t => t.id);
    cart.push({ toppings: ids, price: total(), img: still(220).toDataURL('image/webp', .9) });
  }
  function openAdded() {
    addToCart();
    const p = cart[cart.length - 1];
    $('#added-img').src = p.img;
    $('#added-title').textContent = `Pizza ${cart.length}`;
    $('#added-desc').textContent = descOf(p.toppings);
    $('#added-price').textContent = euro(p.price);
    renderExtras(); updateSums();
    const m = $('#added'); m.classList.remove('closing'); m.hidden = false;
    navigator.vibrate?.(10);
  }
  function closeAdded() {
    const m = $('#added'); m.classList.add('closing');
    return wait(300).then(() => { m.hidden = true; m.classList.remove('closing') });
  }
  $('#to-pay').addEventListener('click', openAdded);
  $('#add-more').addEventListener('click', () => { closeAdded(); resetBuilder() });
  $('#checkout').addEventListener('click', () => { closeAdded(); renderExtras(); renderPay(); show('s-pay') });
  // back out of the sheet: the pizza returns to the bench to be edited
  const undoAdd = () => { const p = cart.pop(); closeAdded(); resetBuilder(p.toppings) };
  $('#added-undo').addEventListener('click', undoAdd);
  $('#added-edit').addEventListener('click', undoAdd);

  function renderPay() {
    $('#cart-list').innerHTML = cart.map((p, i) => `
      <div class="cart-item">
        <img src="${p.img}" alt="">
        <div><div class="n">Pizza ${i + 1}</div><div class="d">${descOf(p.toppings)}</div></div>
        <div class="pr">${euro(p.price)}<button class="rm" data-rm="${i}">Verwijderen</button></div>
      </div>`).join('') + [...extras].map(([id, q]) => `
      <div class="cart-item">
        <img src="${asset(`assets/extras/${id}.webp`)}" alt="">
        <div><div class="n">${exById[id].name}</div><div class="d">${q} × ${euro(exById[id].price)}</div></div>
        <div class="pr">${euro(exById[id].price * q)}<button class="rm" data-x="${id}" data-d="-${q}">Verwijderen</button></div>
      </div>`).join('') + `<button class="add-row" id="add-row"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 1v10M1 6h10"/></svg>Nog een pizza toevoegen</button>`;
    $('#rows').innerHTML = `<div class="r t"><span>Totaal</span><span>${euro(cartTotal())}</span></div>`;
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
    b.innerHTML = `${m.button} <span style="opacity:.6;font-weight:400">· ${euro(cartTotal())}</span>`;
  }
  // back to the bench with the last pizza, ready to edit
  $('#back').addEventListener('click', () => { const p = cart.pop(); resetBuilder(p ? p.toppings : []); show('s-build') });
  $('#cart-list').addEventListener('click', e => {
    if (e.target.closest('#add-row')) { resetBuilder(); show('s-build'); return }
    const b = e.target.closest('[data-rm]'); if (!b) return;
    cart.splice(+b.dataset.rm, 1);
    if (!cart.length) { resetBuilder(); show('s-build'); return }
    renderPay();
  });
  $('#times').addEventListener('click', e => { const b = e.target.closest('.time'); if (!b) return; state.time = b.dataset.t; document.querySelectorAll('.time').forEach(x => x.setAttribute('aria-checked', x === b)) });
  $('#methods').addEventListener('click', e => { const b = e.target.closest('.pm'); if (!b) return; state.method = b.dataset.m; document.querySelectorAll('.pm').forEach(x => x.setAttribute('aria-checked', x === b)); payButton() });
  $('#pay').addEventListener('click', async () => {
    const b = $('#pay'); b.disabled = true; b.innerHTML = '<span class="spin"></span> Betaling verwerken…';
    const order = {
      pizzas: cart.map(p => ({ toppings: p.toppings, price: p.price })), extras: Object.fromEntries(extras), amount: +cartTotal().toFixed(2), method: state.method, pickup: state.time,
      no: '047·' + String(Math.floor(100 + Math.random() * 900)),
    };
    try { sessionStorage.setItem('ad-order', JSON.stringify(order)) } catch (_) {}
    try { await P.start(order); finish(order) }
    catch (err) { b.disabled = false; b.textContent = err.message; setTimeout(payButton, 2400) }
  });

  // ---------- thank you ----------
  const STAMPS = 10;
  function finish(order) {
    // loyalty: one stamp per pizza, the tenth pizza is on the house
    const before = store.get('ad-stamps') || 0, after = before + order.pizzas.length;
    store.set('ad-stamps', after);
    const n = order.pizzas.length, onCard = after % STAMPS || (after ? STAMPS : 0), fresh = Math.min(n, onCard);
    $('#thanks-no').textContent = `Bestelling #${order.no} · betaald`;
    $('#thanks-sub').textContent = n > 1 ? `Uw ${n} pizza's worden nu met de hand gemaakt.` : 'Uw pizza wordt nu met de hand gemaakt.';
    $('#thanks-time').textContent = order.pickup;
    $('#thanks-img').src = still(720, new Set(order.pizzas[n - 1].toppings)).toDataURL('image/webp', .9);
    $('#thanks-hero').style.backgroundImage = `url("${asset('assets/bench.webp')}")`;
    $('#thanks-order').innerHTML = cart.map((p, i) => `<div class="r"><span>Pizza ${i + 1}</span><span>${euro(p.price)}</span></div>`).join('') +
      [...extras].map(([id, q]) => `<div class="r"><span>${q} × ${exById[id].name}</span><span>${euro(exById[id].price * q)}</span></div>`).join('') +
      `<div class="r t"><span>Betaald</span><span>${euro(order.amount)}</span></div>`;
    $('#stamp-row').innerHTML = [...Array(STAMPS)].map((_, i) => i < onCard
      ? `<span class="stamp on${i >= onCard - fresh ? ' new' : ''}" style="animation-delay:${.6 + (i - (onCard - fresh)) * .15}s"><span class="mark"></span></span>`
      : `<span class="stamp${i === STAMPS - 1 ? ' gift' : ''}">${i === STAMPS - 1 ? 'gratis' : i + 1}</span>`).join('');
    const left = STAMPS - onCard;
    $('#stamps-note').textContent = left ? `Nog ${left} tot een gratis pizza` : 'Uw volgende pizza is gratis!';
    show('s-thanks'); $('#s-thanks').scrollTop = 0;
    navigator.vibrate?.(14);
  }
  $('#again').addEventListener('click', () => {
    cart.length = 0; extras.clear(); resetBuilder(); show('s-build'); fit();
  });

  // ---------- boot ----------
  renderTabs(); renderList(); renderExtras();
  (window.AD_MANIFEST ? Promise.resolve(AD_MANIFEST) : fetch('assets/pizza/manifest.json').then(r => r.json())).then(m => {
    manifest = m;
    load(m.base).then(fit);
    const order = C.toppings.slice().sort((a, b) => (a.cat === state.cat ? -1 : 0) - (b.cat === state.cat ? -1 : 0));
    order.reduce((p, t) => p.then(() => ensure(t.id)).catch(() => {}), Promise.resolve());
  });
  addEventListener('resize', fit);
})();
