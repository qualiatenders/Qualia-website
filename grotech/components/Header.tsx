'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LogoLockup } from './Logo';
import { Icon } from './Icon';
import { ButtonLink } from './Button';
import { href, serviceHref, quoteHref } from '@/lib/i18n/routes';
import { services } from '@/lib/content/nl/services';

const nav = [
  { label: 'Materialen', href: href('materials') },
  { label: 'Werkwijze & kwaliteit', href: href('process') },
  { label: 'Over GROTECH', href: href('about') },
  { label: 'Contact', href: href('contact') },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setMegaOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!megaOpen) return;
    const onDown = (e: PointerEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [megaOpen]);

  // Geopend via hover: de eerstvolgende klik mag het menu dan niet direct weer sluiten.
  const openedByHover = useRef(false);
  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (!megaOpen) openedByHover.current = true;
    setMegaOpen(true);
  };
  const toggleMega = () => {
    if (openedByHover.current) {
      openedByHover.current = false;
      setMegaOpen(true);
      return;
    }
    setMegaOpen((v) => !v);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => {
      openedByHover.current = false;
      setMegaOpen(false);
    }, 140);
  };

  const isActive = (h: string) => (h === '/' ? pathname === '/' : pathname === h || pathname.startsWith(`${h}/`));
  const solid = scrolled || megaOpen || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        // Geen backdrop-filter als het mobiele menu open is: dat maakt van de header het
        // containing block voor het fixed menu, waardoor het menu onzichtbaar wordt.
        menuOpen
          ? 'border-b border-line bg-black'
          : solid
            ? 'border-b border-line bg-black/85 backdrop-blur-xl backdrop-saturate-150'
            : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="h-[3px] w-full bg-red" aria-hidden="true" />
      <div className="container-x flex h-[calc(var(--header-h)-3px)] items-center justify-between gap-6">
        <Link href={href('home')} className="shrink-0 rounded-sm" aria-label="GROTECH — naar de homepage">
          <LogoLockup />
        </Link>

        <nav aria-label="Hoofdnavigatie" className="hidden items-center gap-1 lg:flex">
          <div ref={megaRef} className="relative" onMouseEnter={openMega} onMouseLeave={scheduleClose}>
            <button
              type="button"
              aria-expanded={megaOpen}
              aria-controls="mega-services"
              onClick={toggleMega}
              className={`flex items-center gap-1.5 rounded-sm px-3.5 py-2 text-[0.9375rem] font-bold transition-colors ${isActive(href('services')) || megaOpen ? 'text-offwhite' : 'text-mist hover:text-offwhite'}`}
            >
              Productietechnieken
              <Icon name="chevron-down" size={16} className={`transition-transform duration-300 ${megaOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  id="mega-services"
                  initial={reduce ? false : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: [0.2, 0.7, 0.1, 1] }}
                  className="absolute top-full left-1/2 mt-3 w-[min(56rem,calc(100vw-4rem))] -translate-x-1/2 overflow-hidden rounded-md border border-line bg-charcoal/95 shadow-2xl shadow-black/60 backdrop-blur-xl"
                >
                  <div className="grid grid-cols-[1fr_15rem]">
                    <ul className="grid grid-cols-2 gap-px bg-line">
                      {services.map((s) => (
                        <li key={s.slug} className="bg-charcoal">
                          <Link href={serviceHref(s.slug)} className="group/m flex h-full items-center gap-4 p-4 transition-colors hover:bg-graphite">
                            <img src={s.image.src.replace('.webp', '-800.webp')} alt="" width={72} height={54} className="h-[54px] w-[72px] shrink-0 rounded-sm object-cover" loading="lazy" />
                            <span className="min-w-0">
                              <span className="block text-[0.6875rem] font-bold tracking-[0.18em] text-muted uppercase">
                                <span className="text-red">{s.index}</span> / {s.label}
                              </span>
                              <span className="mt-0.5 block font-bold text-offwhite">{s.name}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                      <li className="bg-charcoal">
                        <Link href={href('services')} className="flex h-full items-center justify-between gap-4 p-4 text-sm font-bold text-mist transition-colors hover:bg-graphite hover:text-offwhite">
                          Alle productietechnieken
                          <Icon name="arrow-right" size={16} className="text-red" />
                        </Link>
                      </li>
                    </ul>
                    <div className="flex flex-col justify-between gap-6 border-l border-line p-6">
                      <div>
                        <p className="label-caps text-muted">Eén aanspreekpunt</p>
                        <p className="mt-3 text-sm leading-relaxed text-mist">Combineer meerdere technieken in één aanvraag. Wij coördineren het geheel.</p>
                      </div>
                      <Link href={quoteHref()} className="group/q inline-flex items-center gap-2 text-sm font-bold text-offwhite">
                        Upload je tekening
                        <Icon name="arrow-right" size={16} className="text-red transition-transform group-hover/q:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? 'page' : undefined}
              className={`relative rounded-sm px-3.5 py-2 text-[0.9375rem] font-bold transition-colors ${isActive(n.href) ? 'text-offwhite' : 'text-mist hover:text-offwhite'}`}
            >
              {n.label}
              {isActive(n.href) && <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 bg-red" aria-hidden="true" />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block">
            <ButtonLink href={quoteHref()} icon="upload">
              Offerte aanvragen
            </ButtonLink>
          </span>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-sm border border-line-strong text-offwhite lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Menu sluiten' : 'Menu openen'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon name={menuOpen ? 'x' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-[var(--header-h)] bottom-0 overflow-y-auto bg-black lg:hidden"
          >
            <nav aria-label="Mobiele navigatie" className="container-x flex min-h-full flex-col pt-6 pb-10">
              <p className="label-caps text-muted">Productietechnieken</p>
              <ul className="mt-3 border-t border-line">
                {services.map((s, i) => (
                  <motion.li
                    key={s.slug}
                    initial={reduce ? false : { opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.35, ease: [0.2, 0.7, 0.1, 1] }}
                    className="border-b border-line"
                  >
                    <Link href={serviceHref(s.slug)} className="flex items-center justify-between py-3.5 text-lg font-bold">
                      <span>
                        <span className="mr-3 text-sm text-red">{s.index}</span>
                        {s.name}
                      </span>
                      <Icon name="arrow-right" size={18} className="text-muted" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <ul className="mt-8 space-y-1">
                {[{ label: 'Alle productietechnieken', href: href('services') }, ...nav].map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className={`block py-2 text-2xl font-black tracking-tight ${isActive(n.href) ? 'text-offwhite' : 'text-mist'}`}>
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-10">
                <ButtonLink href={quoteHref()} size="lg" icon="upload" className="w-full">
                  Upload je tekening
                </ButtonLink>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
