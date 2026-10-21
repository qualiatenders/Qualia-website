'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { categories } from '@/lib/taxonomy';
import { Logo } from './Logo';
import { Icon } from './Icon';

const mainNav = [
  { href: '/latest/', label: 'Latest' },
  { href: '/analysis/', label: 'Intelligence' },
  { href: '/events/', label: 'Events' },
  { href: '/organizations/', label: 'Organizations' },
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
            <Link href="/about/" className="hover:text-white">About</Link>
            <Link href="/contact/" className="hover:text-white">Contact</Link>
            <Link href="/advertise/" className="hover:text-white">Advertise</Link>
            <Link href="/newsletter/" className="hover:text-white">Newsletter</Link>
          </nav>
        </div>
      </div>

      <div className={`border-b transition-[background-color,border-color,backdrop-filter] duration-500 ${scrolled || panel ? 'border-white/10 bg-ink/92 backdrop-blur-xl backdrop-saturate-150' : 'border-transparent bg-ink'}`}>
        <div className="shell flex h-[var(--header-h)] items-center gap-6">
          <Link href="/" aria-label="GeoInformatics — home" className="flex-none">
            <Logo compact />
          </Link>

          <nav aria-label="Main" className="ml-4 hidden flex-1 items-center gap-7 text-[0.9375rem] font-medium lg:flex">
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
            {mainNav.map((n) => (
              <Link key={n.href} href={n.href} className="nav-link" aria-current={isActive(n.href) ? 'page' : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:gap-3">
            <button type="button" onClick={() => toggle('search')} aria-expanded={panel === 'search'} aria-label="Search" className="grid size-11 place-items-center text-white/85 transition-colors hover:text-white">
              <Icon name={panel === 'search' ? 'close' : 'search'} />
            </button>
            <Link href="/advertise/" className="btn btn-outline hidden min-h-10 border-white/25 px-4 text-sm xl:inline-flex">
              Advertise
            </Link>
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
            <div className="shell grid grid-cols-[1fr_2.6fr] gap-12 py-10">
              <div>
                <p className="kicker text-red-ink">Explore by industry</p>
                <p className="mt-4 font-display text-3xl leading-tight font-semibold tracking-[-0.015em]">Ten desks. One industry.</p>
                <p className="mt-4 text-sm leading-relaxed text-fog">Every story is filed under the discipline it matters to most, so you can follow your field without missing what is shifting next door.</p>
                <Link href="/latest/" className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                  All latest news <Icon name="arrow" className="arrow size-4" />
                </Link>
              </div>
              <ul className="grid grid-cols-2 gap-x-10 xl:grid-cols-2">
                {categories.map((c, i) => (
                  <motion.li key={c.slug} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i + 0.1, duration: 0.4, ease }}>
                    <Link href={c.path} className="group flex items-baseline gap-4 border-b border-white/10 py-3.5" aria-current={pathname === c.path ? 'page' : undefined}>
                      <span className="meta w-10 flex-none text-red-ink">{c.code}</span>
                      <span className="min-w-0">
                        <span className="block font-display text-[1.05rem] font-medium transition-colors group-hover:text-white">
                          <span className="headline-link">{c.name}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-[0.8125rem] text-fog">{c.description}</span>
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
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
          className="min-w-0 flex-1 bg-transparent font-display text-xl tracking-[-0.02em] placeholder:text-white/35 focus:outline-none lg:text-3xl"
        />
        <button type="submit" className="btn btn-light">
          Search
        </button>
      </form>
    </motion.div>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  const reduce = useReducedMotion();
  const item = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.05 + i * 0.035, duration: 0.45, ease } });
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.5, ease }}
      className="fixed inset-x-0 top-[var(--header-h)] bottom-0 overflow-y-auto overscroll-contain bg-ink lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div className="shell pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <form role="search" action="/search/" className="flex border border-white/20">
          <label htmlFor="mobile-search" className="sr-only">
            Search
          </label>
          <input id="mobile-search" name="q" type="search" placeholder="Search GeoInformatics" className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base placeholder:text-white/40 focus:outline-none" />
          <button type="submit" aria-label="Search" className="grid w-12 place-items-center bg-white text-ink">
            <Icon name="search" />
          </button>
        </form>

        <nav aria-label="Mobile" className="mt-8">
          <ul>
            {[{ href: '/', label: 'Home' }, ...mainNav].map((n, i) => (
              <motion.li key={n.href} {...item(i)} className="border-b border-white/10">
                <Link href={n.href} aria-current={pathname === n.href ? 'page' : undefined} className="flex items-center justify-between py-4 font-display text-[1.75rem] leading-none font-semibold tracking-[-0.015em]">
                  {n.label}
                  <Icon name="arrow" className="size-5 text-red-ink" />
                </Link>
              </motion.li>
            ))}
          </ul>
          <p className="kicker mt-10 text-fog">Industries</p>
          <ul className="mt-3 grid grid-cols-2 gap-px bg-white/10">
            {categories.map((c, i) => (
              <motion.li key={c.slug} {...item(i + 5)} className="bg-ink">
                <Link href={c.path} className="flex min-h-[4.5rem] flex-col justify-between gap-2 p-3">
                  <span className="meta text-red-ink">{c.code}</span>
                  <span className="text-[0.9375rem] leading-tight font-medium">{c.name}</span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 grid gap-3">
          <Link href="/newsletter/" className="btn btn-red">
            <Icon name="mail" className="size-4" /> Get the newsletter
          </Link>
          <Link href="/advertise/" className="btn btn-outline border-white/25">
            Advertise with GeoInformatics
          </Link>
        </div>
        <p className="meta mt-8 flex gap-5 text-fog">
          <Link href="/about/">About</Link>
          <Link href="/contact/">Contact</Link>
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
