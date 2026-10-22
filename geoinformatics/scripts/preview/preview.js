// Interactions for the static preview export: header panels, ticker, scroll
// reveal, feed filters and paging, search, forms (simulated), the ad-placement
// explorer and the reading progress bar. Plain JS, no framework.
(() => {
  // Inlined into every exported page (the artifact viewer only runs inline scripts).
  const ROOT = window.GI_ROOT || '';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SNAP = window.GI_SNAP || {};
  const INDEX = window.GI_INDEX || [];

  const toFile = (href) => {
    if (!href || !href.startsWith('/') || href.startsWith('//')) return href;
    const u = new URL(href, 'http://x');
    if (/\.\w+$/.test(u.pathname)) return ROOT + u.pathname.slice(1);
    const p = u.pathname.endsWith('/') ? u.pathname : u.pathname + '/';
    return ROOT + p.slice(1) + 'index.html' + u.hash;
  };
  const fixLinks = (root) =>
    root.querySelectorAll('a[href^="/"], form[action^="/"]').forEach((a) => {
      const at = a.tagName === 'FORM' ? 'action' : 'href';
      a.setAttribute(at, toFile(a.getAttribute(at)));
    });
  const frag = (html) => {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    fixLinks(t.content);
    return t.content.firstElementChild;
  };
  /** Fetch another exported page and return its document, with links made absolute. */
  async function load(url) {
    const abs = new URL(url, location.href);
    const html = await (await fetch(abs)).text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('a[href]').forEach((a) => {
      const h = a.getAttribute('href');
      if (!/^(https?:|mailto:|#)/.test(h)) a.setAttribute('href', new URL(h, abs).href);
    });
    return doc;
  }
  const svg = (d) => `<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" aria-hidden="true"><path d="${d}"></path></svg>`;
  const ICON = {
    close: 'M6 6l12 12M18 6 6 18',
    search: 'M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm5.3-2.2L21 21',
    menu: 'M3 7h18M3 12h18M3 17h18',
    pause: 'M8 5v14M16 5v14',
    play: 'M7 5v14l11-7z',
    check: 'm5 12 5 5 9-10',
    link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  };

  /* ── Header ─────────────────────────────────────────────────────────── */
  const header = document.querySelector('header');
  const util = header?.children[0];
  let open = null;
  const btn = {
    industries: [...(header?.querySelectorAll('button') ?? [])].find((b) => b.textContent.trim() === 'Industries'),
    search: header?.querySelector('button[aria-label="Search"]'),
    mobile: header?.querySelector('button[aria-label="Menu"]'),
  };
  const original = { search: btn.search?.innerHTML, mobile: btn.mobile?.innerHTML };

  function paintBar() {
    if (!util) return;
    const s = scrollY > 24;
    // Mirrors the Header component: the brand row folds away on desktop, the menu bar gains the small logo.
    util.classList.toggle('lg:max-h-0', s);
    util.classList.toggle('lg:opacity-0', s);
    util.classList.toggle('max-h-24', !s);
    util.classList.toggle('opacity-100', !s);
    header.toggleAttribute('data-scrolled', s);
  }
  addEventListener('scroll', paintBar, { passive: true });

  function closePanel() {
    if (!open) return;
    open.el.remove();
    open.button?.setAttribute('aria-expanded', 'false');
    if (open.name === 'search' && btn.search) btn.search.innerHTML = original.search;
    if (open.name === 'mobile' && btn.mobile) btn.mobile.innerHTML = original.mobile;
    if (open.name === 'industries') btn.industries?.querySelector('svg')?.classList.remove('rotate-180');
    document.documentElement.style.overflow = '';
    open = null;
    paintBar();
  }
  function openPanel(name) {
    const was = open?.name;
    closePanel();
    if (was === name) return;
    const key = { industries: 'mega', search: 'search', mobile: 'mobile' }[name];
    if (!SNAP[key]) return;
    const el = frag(SNAP[key]);
    el.classList.remove('hidden');
    if (name === 'industries') el.classList.add('lg:block');
    el.style.removeProperty('opacity');
    el.style.removeProperty('transform');
    el.style.removeProperty('clip-path');
    el.classList.add('pv-drop');
    header.appendChild(el);
    open = { name, el, button: btn[name] };
    btn[name]?.setAttribute('aria-expanded', 'true');
    if (name === 'search') {
      btn.search.innerHTML = svg(ICON.close);
      el.querySelector('input')?.focus();
    }
    if (name === 'mobile') {
      btn.mobile.innerHTML = svg(ICON.close);
      document.documentElement.style.overflow = 'hidden';
    }
    if (name === 'industries') btn.industries.querySelector('svg')?.classList.add('rotate-180');
    paintBar();
  }
  btn.industries?.addEventListener('click', () => openPanel('industries'));
  btn.search?.addEventListener('click', () => openPanel('search'));
  btn.mobile?.addEventListener('click', () => openPanel('mobile'));
  addEventListener('keydown', (e) => e.key === 'Escape' && closePanel());
  document.addEventListener('mousedown', (e) => {
    if (open && open.name !== 'mobile' && !header.contains(e.target)) closePanel();
  });

  /* ── Search (client-side over the exported articles) ────────────────── */
  const store = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} },
  };
  const searchPage = !!document.getElementById('search-q');
  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.getAttribute('role') !== 'search') return;
    e.preventDefault();
    const q = new FormData(f).get('q')?.toString().trim();
    if (!q) return;
    store.set('gi-q', q);
    store.set('gi-desk', '');
    if (searchPage) runSearch();
    else location.href = ROOT + 'search/index.html';
  });

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function runSearch() {
    const q = (store.get('gi-q') || '').trim();
    const desk = store.get('gi-desk') || '';
    const input = document.getElementById('search-q');
    if (input) input.value = q;
    const col = document.querySelector('.lg\\:col-span-9');
    if (!q || !col) return;
    const h1 = document.querySelector('h1');
    if (h1) h1.textContent = `“${q}”`;
    const terms = q.toLowerCase().split(/\s+/);
    const hits = INDEX.filter((a) => (!desk || a.cat === desk) && terms.every((t) => `${a.title} ${a.desc} ${a.cat}`.toLowerCase().includes(t)));
    col.innerHTML = hits.length
      ? `<p class="meta mb-2" role="status">${hits.length} result${hits.length === 1 ? '' : 's'}${desk ? ` in ${esc(desk)}` : ''}</p><ul>${hits
          .map(
            (a) => `<li class="border-b border-line py-6 pv-fade"><article class="group relative"><p class="cat-tag">${esc(a.cat)}</p><h3 class="mt-2 text-[1.125rem] leading-[1.2] sm:text-[1.35rem]"><a class="headline-link after:absolute after:inset-0 after:content-['']" href="${ROOT + a.file}">${esc(a.title)}</a></h3><p class="mt-2 text-[0.975rem] text-fg-muted">${esc(a.desc)}</p></article></li>`,
          )
          .join('')}</ul>`
      : `<div role="status" class="border border-dashed border-line-strong p-10"><p class="font-display text-2xl font-semibold">No results for “${esc(q)}”.</p><p class="mt-2 text-fg-muted">Check the spelling or try a broader term.</p></div>`;
  }
  if (searchPage) {
    const aside = document.querySelector('aside[aria-label="Filter results"]');
    aside?.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      e.preventDefault();
      const name = a.textContent.trim();
      store.set('gi-desk', name === 'All industries' ? '' : name);
      const active = aside.querySelector('[aria-current]');
      if (active && active !== a) {
        const cls = active.className;
        active.className = a.className;
        a.className = cls;
        active.removeAttribute('aria-current');
        a.setAttribute('aria-current', 'true');
      }
      runSearch();
    });
    document.querySelector('.lg\\:col-span-9')?.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || !a.closest('ul') || a.closest('article')) return;
      e.preventDefault();
      store.set('gi-q', a.textContent.trim());
      runSearch();
    });
  }

  /* ── Ticker pause ───────────────────────────────────────────────────── */
  document.querySelectorAll('.ticker button[aria-pressed]').forEach((b) =>
    b.addEventListener('click', () => {
      const t = b.closest('.ticker');
      const paused = t.dataset.paused !== 'true';
      t.dataset.paused = String(paused);
      b.setAttribute('aria-pressed', String(paused));
      b.setAttribute('aria-label', paused ? 'Resume headline ticker' : 'Pause headline ticker');
      b.innerHTML = svg(paused ? ICON.play : ICON.pause).replace('size-5', 'size-4');
    }),
  );

  /* ── Scroll reveal ──────────────────────────────────────────────────── */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('is-visible'), io.unobserve(e.target))),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  /* ── Feed: desk filters and "load more" ─────────────────────────────── */
  const filters = document.querySelector('[role=group][aria-label="Filter by industry"]');
  const list = (filters?.parentElement ?? document).querySelector('[aria-busy]');
  const allHtml = list?.innerHTML;
  const desks = () => {
    const map = {};
    const t = document.createElement('template');
    t.innerHTML = SNAP.mega || '';
    t.content.querySelectorAll('a[href^="/category/"]').forEach((a) => (map[a.querySelector('.headline-link')?.textContent.trim()] = a.getAttribute('href')));
    return map;
  };
  filters?.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b || b.getAttribute('aria-pressed') === 'true') return;
    filters.querySelectorAll('button').forEach((x) => {
      const on = x === b;
      x.setAttribute('aria-pressed', String(on));
      x.classList.toggle('text-white', on);
      x.classList.toggle('text-fg-muted', !on);
      x.firstElementChild.className = on ? 'absolute inset-0 bg-ink' : 'absolute inset-0 border border-line';
    });
    const name = b.textContent.trim();
    const more = document.querySelector('button.btn-outline.min-w-52');
    if (name === 'All') {
      list.innerHTML = allHtml;
      if (more) more.hidden = false;
    } else {
      list.classList.add('pv-busy');
      try {
        const doc = await load(toFile(desks()[name]));
        const feed = doc.querySelector('[aria-busy]');
        list.innerHTML = feed ? feed.innerHTML : '<p class="border border-dashed border-line-strong p-10 text-center text-fg-muted">No stories on this desk yet.</p>';
        if (more) more.hidden = true;
      } catch {
        /* keep the current list */
      }
      list.classList.remove('pv-busy');
    }
    list.firstElementChild?.classList.add('pv-fade');
  });

  document.querySelectorAll('button.btn-outline.min-w-52').forEach((more) =>
    more.addEventListener('click', async () => {
      const next = document.querySelector('.crawl-pagination a[rel="next"]');
      if (!next) return void (location.href = ROOT + 'latest/index.html');
      more.textContent = 'Loading…';
      const doc = await load(next.getAttribute('href'));
      const items = doc.querySelectorAll('.min-w-0 > ul > li');
      const ul = list.querySelector('ul');
      items.forEach((li) => {
        li.classList.add('pv-fade');
        ul.appendChild(document.importNode(li, true));
      });
      const after = doc.querySelector('.crawl-pagination a[rel="next"], nav[aria-label="Pagination"] a[rel="next"]');
      if (after) next.setAttribute('href', after.href);
      else more.remove();
      if (more.isConnected) more.innerHTML = 'Load more stories';
    }),
  );

  /* ── Forms (simulated) ──────────────────────────────────────────────── */
  document.addEventListener(
    'submit',
    (e) => {
      const f = e.target;
      if (f.getAttribute('role') === 'search') return;
      e.preventDefault();
      if (!f.reportValidity()) return;
      if (f.querySelector('[name="company"]')) {
        f.replaceWith(frag(`<div role="status" class="border-l-2 border-red py-4 pl-6 pv-fade"><p class="font-display text-3xl font-semibold tracking-[-0.03em]">Request received.</p><p class="mt-2 max-w-lg text-fg-muted">Our partnerships team will come back to you with availability and a tailored proposal. (Preview: nothing was sent.)</p></div>`));
      } else if (f.querySelector('[name="topic"]')) {
        f.replaceWith(frag(`<div role="status" class="border-l-2 border-red py-4 pl-6 pv-fade"><p class="font-display text-3xl font-semibold tracking-[-0.03em]">Thank you — message received.</p><p class="mt-2 max-w-lg text-fg-muted">Our team reads every message and replies by email when a response is needed. (Preview: nothing was sent.)</p></div>`));
      } else if (SNAP.newsletterDone) {
        const done = frag(SNAP.newsletterDone);
        done.classList.add('pv-fade');
        f.replaceWith(done);
      }
    },
    true,
  );

  /* ── Ad placement explorer ──────────────────────────────────────────── */
  const tabFirst = { homepage: 'Homepage Premium Takeover', article: 'Standard Leaderboard', category: 'Category Leaderboard' };
  document.addEventListener('click', (e) => {
    const root = e.target.closest('.grid');
    if (!root?.querySelector('[role=tablist][aria-label="Page type"]') || !SNAP.explorer) return;
    const b = e.target.closest('button');
    if (!b) return;
    const name = b.getAttribute('role') === 'tab' ? tabFirst[b.textContent.trim().toLowerCase()] : b.querySelector('.font-display')?.textContent.trim() || b.getAttribute('aria-label');
    const html = SNAP.explorer[name];
    if (!html) return;
    const el = frag(html);
    root.replaceWith(el);
  });

  /* ── Reading progress + copy link ───────────────────────────────────── */
  const progress = document.querySelector('div.fixed.inset-x-0.top-0.origin-left');
  if (progress) {
    const box = progress.parentElement;
    const tick = () => {
      const r = box.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      progress.style.transform = `scaleX(${p})`;
    };
    addEventListener('scroll', tick, { passive: true });
    tick();
  }
  document.querySelectorAll('button[aria-label="Copy link"]').forEach((b) =>
    b.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href);
      } catch {}
      b.innerHTML = svg(ICON.check).replace('size-5', 'size-4');
      setTimeout(() => (b.innerHTML = svg(ICON.link).replace('size-5', 'size-4')), 2000);
    }),
  );

  /* ── Parallax on premium visuals ───────────────────────────────────── */
  const plx = [...document.querySelectorAll('[data-parallax]')];
  if (plx.length && !reduce) {
    const move = () =>
      plx.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        const amt = Number(el.dataset.parallax) || 6;
        el.style.transform = `translate3d(0, ${(-p * amt).toFixed(2)}%, 0) scale(${1 + amt / 50})`;
      });
    addEventListener('scroll', move, { passive: true });
    move();
  }

  if (searchPage) runSearch();
  paintBar();
})();
