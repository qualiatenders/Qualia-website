'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoLockup } from './Logo';
import { Icon } from './Icon';
import { ButtonLink } from './Button';
import { href, quoteHref } from '@/lib/i18n/routes';

const nav = [
  { label: 'Diensten', href: href('services') },
  { label: 'Werkwijze', href: href('process') },
  { label: 'Over GROTECH', href: href('about') },
  { label: 'Contact', href: href('contact') },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (h: string) => !h.includes('#') && (pathname === h || pathname.startsWith(`${h}/`));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
        // Geen backdrop-filter als het menu open is: die maakt van de header het
        // containing block voor het fixed menu, waardoor het menu onzichtbaar wordt.
        open ? 'border-b border-line bg-black' : scrolled ? 'border-b border-line bg-black/90 backdrop-blur-lg' : 'border-b border-transparent'
      }`}
    >
      <div className="h-[3px] w-full bg-red" aria-hidden="true" />
      <div className="container-x flex h-[calc(var(--header-h)-3px)] items-center justify-between gap-6">
        <Link href={href('home')} className="shrink-0 rounded-sm" aria-label="GROTECH — naar de homepage" onClick={() => setOpen(false)}>
          <LogoLockup />
        </Link>

        <nav aria-label="Hoofdnavigatie" className="hidden items-center gap-1 lg:flex">
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
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Menu sluiten' : 'Menu openen'}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? 'x' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="anim-fade fixed inset-x-0 top-[var(--header-h)] bottom-0 overflow-y-auto bg-black lg:hidden">
          <nav aria-label="Mobiele navigatie" className="container-x flex min-h-full flex-col pt-8 pb-10">
            <ul className="space-y-1">
              {[{ label: 'Home', href: href('home') }, ...nav].map((n) => (
                <li key={n.href}>
                  <Link href={n.href} onClick={() => setOpen(false)} className={`block border-b border-line py-4 text-2xl font-black tracking-tight ${isActive(n.href) ? 'text-offwhite' : 'text-mist'}`}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-10">
              <ButtonLink href={quoteHref()} size="lg" icon="upload" className="w-full" onClick={() => setOpen(false)}>
                Upload je tekening
              </ButtonLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
