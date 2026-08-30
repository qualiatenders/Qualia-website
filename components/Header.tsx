'use client';

import { useEffect, useState } from 'react';
import { LOGO_MARK, NAV_LINKS } from '@/lib/content';
import { MobileNavigation } from './MobileNavigation';

/**
 * Sticky header. Transparent over the hero, then settles onto a solid
 * hull-black bar with a single hairline once the page scrolls.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = scrolled || menuOpen;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 text-bone transition-[background-color,border-color,backdrop-filter] duration-500 ${
          solid ? 'border-b border-white/10 bg-hull/92 backdrop-blur-md' : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="shell flex h-20 items-center justify-between gap-8 lg:h-[6.5rem]">
          <a href="#top" className="flex items-baseline gap-1.5" aria-label="Assault Boats — naar boven">
            {LOGO_MARK?.src ? (
              /* Fixed box keeps the header height stable whatever the mark's ratio. */
              <span className="flex h-14 items-center overflow-hidden lg:h-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOGO_MARK.src} alt="Assault Boats" className="h-full w-auto" />
              </span>
            ) : (
              <>
                <span className="font-[family-name:var(--font-display)] text-[1.0625rem] font-extrabold uppercase tracking-[-0.02em] leading-none">
                  Assault
                </span>
                <span className="text-[0.625rem] leading-none text-red" aria-hidden="true">
                  &reg;
                </span>
              </>
            )}
          </a>

          <nav className="hidden lg:block" aria-label="Hoofdnavigatie">
            <ul className="flex items-center gap-9">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="group relative block py-2 type-label opacity-80 transition-opacity hover:opacity-100">
                    {link.label}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-red transition-transform duration-400 ease-[var(--ease-out-a)] group-hover:scale-x-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="cut-tag hidden bg-red px-7 py-3 type-label text-white transition-colors duration-300 hover:bg-red-hot lg:inline-block"
            >
              Prijslijst
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Menu sluiten' : 'Menu openen'}
              className="relative z-50 -mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
            >
              <span className="relative block h-3 w-6">
                <span
                  className={`absolute left-0 block h-px w-6 bg-current transition-transform duration-400 ease-[var(--ease-out-a)] ${
                    menuOpen ? 'top-1.5 rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute left-0 block h-px w-6 bg-current transition-transform duration-400 ease-[var(--ease-out-a)] ${
                    menuOpen ? 'top-1.5 -rotate-45' : 'top-3'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileNavigation open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
