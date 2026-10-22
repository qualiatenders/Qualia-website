'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { categories, deskShort } from '@/lib/taxonomy';
import { Logo } from './Logo';
import { Icon } from './Icon';

/** Primary pages. `wide` items only show from xl up; below that they live in the Industries panel and the mobile menu. */
const mainNav = [
  { href: '/latest/', label: 'Latest News' },
  { href: '/analysis/', label: 'Analysis' },
  { href: '/products/', label: 'Products' },
  { href: '/events/', label: 'Events' },
  { href: '/organizations/', label: 'Organizations', wide: true },
  { href: '/news-map/', label: 'News Map', wide: true },
];

/** Other ways in, shown beside the industries. */
const browse = [
  { href: '/latest/', label: 'Latest News', note: 'Every story, newest first' },
  { href: '/analysis/', label: 'Analysis', note: 'Features, interviews, opinion' },
  { href: '/products/', label: 'Product Radar', note: 'New hardware and software' },
  { href: '/deals/', label: 'Deals & Partnerships', note: 'Acquisitions, contracts, alliances' },
  { href: '/news-map/', label: 'News Map', note: 'Every story on the globe' },
  { href: '/organizations/', label: 'Organizations', note: 'Who is who in geospatial' },
  { href: '/topics/', label: 'Topics A–Z', note: 'Companies and technologies' },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function Header({ dateLine }: { dateLine: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [panel, setPanel] = useState<'industries' | 'search' | 'mobile' | null>(null);
  const reduce = useReducedMotion();
  const megaId = useId();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close any open panel on navigation.
  useEffect(() => setPanel(null), [pathname]);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanel(null);
    const onClick = (e: MouseEvent) => {
      if (panel !== 'mobile' && headerRef.current && !headerRef.current.contains(e.target as Node)) setPanel(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    if (panel === 'mobile') document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
      document.documentElement.style.overflow = '';
    };
  }, [panel]);

  const toggle = (p: typeof panel) => setPanel((cur) => (cur === p ? null : p));
  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <header ref={headerRef} className="sticky top-0 z-50">
      {/* Utility line: scrolls away; the main bar stays */}
      <div className={`hidden overflow-hidden border-b border-white/10 bg-ink transition-[max-height,opacity] duration-500 ease-[var(--ease-editorial)] lg:block ${scrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'}`}>
        <div className="shell flex h-9 items-center justify-between">
          <p className="meta flex items-center gap-3 text-fog">
            <span>{dateLine}</span>
            <span aria-hidden="true" className="h-3 w-px bg-white/20" />
            <LiveClock />
            <span aria-hidden="true" className="h-3 w-px bg-white/20" />
            <span className="inline-flex items-center gap-1.5">
              <Icon name="globe" className="size-3.5" />
              International edition
            </span>
          </p>
          <nav aria-label="Utility" className="meta flex items-center gap-5 text-fog">
            <Link href="/advertise/" className="hover:underline">Advertising</Link>
            <a href="/media-kit.pdf" className="hover:underline">Media kit</a>
            <Link href="/contact/" className="hover:underline">Contact</Link>
            <Link href="/about/" className="hover:underline">About</Link>
          </nav>
        </div>
      </div>

      <div className={`border-b transition-[background-color,border-color,backdrop-filter] duration-500 ${scrolled || panel ? 'border-white/10 bg-ink/92 backdrop-blur-xl backdrop-saturate-150' : 'border-transparent bg-ink'}`}>
        <div className="shell flex h-[var(--header-h)] items-center gap-6">
          <Link href="/" aria-label="GeoInformatics — home" className="flex-none">
            <Logo />
          </Link>

          <nav aria-label="Main" className="ml-2 hidden flex-1 items-center gap-6 text-[0.9375rem] font-semibold lg:flex xl:ml-6 xl:gap-7">
            <Link href="/latest/" className="nav-link" aria-current={isActive('/latest/') ? 'page' : undefined}>
              Latest News
            </Link>
            <button
              type="button"
              className="nav-link inline-flex items-center gap-1.5"
              aria-expanded={panel === 'industries'}
              aria-controls={megaId}
              onClick={() => toggle('industries')}
            >
              Industries
              <Icon name="chevron" className={`size-4 transition-transform duration-300 ${panel === 'industries' ? 'rotate-180' : ''}`} />
            </button>
            {mainNav.slice(1).map((n) => (
              <Link key={n.href} href={n.href} className={`nav-link ${n.wide ? 'hidden xl:inline' : ''}`} aria-current={isActive(n.href) ? 'page' : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:gap-3">
            <button type="button" onClick={() => toggle('search')} aria-expanded={panel === 'search'} aria-label="Search" className="grid size-11 place-items-center text-white">
              <Icon name={panel === 'search' ? 'close' : 'search'} />
            </button>
            <Link href="/newsletter/" className="btn btn-red hidden min-h-10 px-4 text-sm sm:inline-flex">
              <Icon name="mail" className="size-4" />
              Newsletter
            </Link>
            <button type="button" onClick={() => toggle('mobile')} aria-expanded={panel === 'mobile'} aria-label="Menu" className="grid size-11 place-items-center lg:hidden">
              <Icon name={panel === 'mobile' ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
      </div>

      {/* Industry bar: every desk one tap away, like a newspaper's section index */}
      <nav aria-label="Industries" className="border-b border-white/10 bg-anthracite">
        <div className="shell flex h-11 items-stretch">
          <ul className="no-scrollbar flex min-w-0 flex-1 items-stretch overflow-x-auto text-[0.8125rem] font-semibold whitespace-nowrap">
            {categories.map((c, i) => {
              const active = pathname.startsWith(c.path);
              return (
                <li key={c.slug} className="flex">
                  <Link href={c.path} aria-current={active ? 'page' : undefined} className={`relative flex items-center px-3 text-white transition-colors hover:bg-white/[0.06] ${i === 0 ? 'pl-0' : ''}`}>
                    {deskShort[c.slug] ?? c.name}
                    <span aria-hidden="true" className={`absolute right-3 bottom-0 h-[3px] bg-red transition-transform duration-300 ${i === 0 ? 'left-0' : 'left-3'} ${active ? 'scale-x-100' : 'scale-x-0'}`} />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/topics/" className="ml-2 hidden flex-none items-center gap-1.5 border-l border-white/15 pl-4 text-[0.8125rem] font-bold text-white hover:underline md:flex" aria-current={pathname.startsWith('/topics/') ? 'page' : undefined}>
            Topics A–Z <Icon name="arrow" className="size-3.5" />
          </Link>
        </div>
      </nav>

      <AnimatePresence>
        {panel === 'industries' && (
          <motion.div
            id={megaId}
            key="mega"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, clipPath: 'inset(0 0 100% 0)' }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.45, ease }}
            className="absolute inset-x-0 top-full hidden border-b border-white/10 bg-anthracite shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)] lg:block"
          >
            <div className="shell grid grid-cols-[2.4fr_1fr] gap-12 py-10">
              <div>
                <div className="flex items-baseline justify-between border-b border-white/15 pb-3">
                  <p className="kicker text-white">Industries</p>
                  <Link href="/industries/" className="text-sm font-bold hover:underline">
                    All industries →
                  </Link>
                </div>
                <ul className="grid grid-cols-2 gap-x-10">
                  {categories.map((c, i) => (
                    <motion.li key={c.slug} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i + 0.08, duration: 0.4, ease }}>
                      <Link href={c.path} className="group flex items-baseline gap-4 border-b border-white/10 py-3" aria-current={pathname === c.path ? 'page' : undefined}>
                        <span className="w-9 flex-none text-[0.6875rem] font-bold tracking-[0.08em] text-red-ink">{c.code}</span>
                        <span className="min-w-0">
                          <span className="block font-display text-[1.05rem] font-medium">
                            <span className="headline-link">{c.name}</span>
                          </span>
                          <span className="mt-0.5 block truncate text-[0.8125rem]">{c.description}</span>
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="kicker border-b border-white/15 pb-3 text-white">Browse</p>
                <ul>
                  {browse.map((n) => (
                    <li key={n.href}>
                      <Link href={n.href} className="group block border-b border-white/10 py-2.5">
                        <span className="block font-semibold group-hover:underline">{n.label}</span>
                        <span className="block text-[0.8125rem]">{n.note}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {panel === 'search' && <SearchPanel key="search" onDone={() => setPanel(null)} />}

        {panel === 'mobile' && <MobileMenu key="mobile" pathname={pathname} />}
      </AnimatePresence>
    </header>
  );
}

function SearchPanel({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => input.current?.focus(), []);
  const submit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const q = new FormData(e.currentTarget).get('q')?.toString().trim();
      if (!q) return;
      router.push(`/search/?q=${encodeURIComponent(q)}`);
      onDone();
    },
    [router, onDone],
  );
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease }}
      className="absolute inset-x-0 top-full border-b border-white/10 bg-anthracite"
    >
      <form role="search" action="/search/" onSubmit={submit} className="shell flex items-center gap-4 py-6 lg:py-8">
        <Icon name="search" className="size-6 flex-none text-red-ink" />
        <label htmlFor="header-search" className="sr-only">
          Search GeoInformatics
        </label>
        <input
          ref={input}
          id="header-search"
          name="q"
          type="search"
          autoComplete="off"
          placeholder="Search news, technologies, organisations…"
          className="min-w-0 flex-1 bg-transparent font-display text-xl tracking-[-0.02em] placeholder:text-white focus:outline-none lg:text-3xl"
        />
        <button type="submit" className="btn btn-light">
          Search
        </button>
      </form>
    </motion.div>
  );
}

const mobileGroups = [
  { title: 'News', items: [{ href: '/', label: 'Home' }, { href: '/latest/', label: 'Latest News' }, { href: '/analysis/', label: 'Analysis' }, { href: '/news-map/', label: 'News Map' }] },
  { title: 'Industry', items: [{ href: '/products/', label: 'Product Radar' }, { href: '/deals/', label: 'Deals & Partnerships' }, { href: '/organizations/', label: 'Organizations' }, { href: '/events/', label: 'Events' }] },
  { title: 'Find', items: [{ href: '/topics/', label: 'Topics A–Z' }, { href: '/newsletter/', label: 'Newsletter' }] },
];

function MobileMenu({ pathname }: { pathname: string }) {
  const reduce = useReducedMotion();
  const item = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.05 + i * 0.035, duration: 0.45, ease } });
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.5, ease }}
      className="fixed inset-x-0 top-[var(--header-total)] bottom-0 overflow-y-auto overscroll-contain bg-ink lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div className="shell pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <form role="search" action="/search/" className="flex border border-white/20">
          <label htmlFor="mobile-search" className="sr-only">
            Search
          </label>
          <input id="mobile-search" name="q" type="search" placeholder="Search GeoInformatics" className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base placeholder:text-white focus:outline-none" />
          <button type="submit" aria-label="Search" className="grid w-12 place-items-center bg-white text-ink">
            <Icon name="search" />
          </button>
        </form>

        <nav aria-label="Mobile" className="mt-6">
          {mobileGroups.map((g, gi) => (
            <div key={g.title} className="mt-8 first:mt-0">
              <p className="kicker text-red-ink">{g.title}</p>
              <ul className="mt-2">
                {g.items.map((n, i) => (
                  <motion.li key={n.href} {...item(gi * 4 + i)} className="border-b border-white/10">
                    <Link href={n.href} aria-current={pathname === n.href ? 'page' : undefined} className="flex min-h-14 items-center justify-between text-[1.25rem] leading-none font-bold tracking-[-0.01em]">
                      {n.label}
                      <Icon name="arrow" className="size-5 text-red-ink" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
          <p className="kicker mt-10 text-red-ink">Industries</p>
          <ul className="mt-3 grid grid-cols-2 gap-px border border-white/10 bg-white/10">
            {categories.map((c) => (
              <li key={c.slug} className="bg-ink">
                <Link href={c.path} className="flex min-h-14 items-center p-3 text-[0.9375rem] leading-tight font-semibold">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 grid gap-3">
          <Link href="/newsletter/" className="btn btn-red">
            <Icon name="mail" className="size-4" /> Get the newsletter
          </Link>
        </div>
        <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          <Link href="/advertise/">Advertising</Link>
          <Link href="/contact/">Contact</Link>
          <Link href="/about/">About</Link>
          <Link href="/legal/privacy/">Privacy</Link>
        </p>
      </div>
    </motion.div>
  );
}

/** UTC clock in the utility bar; the newsroom's reference time. */
function LiveClock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date().toISOString().slice(11, 16));
    tick();
    const t = window.setInterval(tick, 15_000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums">
      <span className="live-dot" aria-hidden="true" />
      {now ?? '--:--'} UTC
    </span>
  );
}
