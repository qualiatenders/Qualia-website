'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { NAV_LINKS } from '@/lib/content';

type Props = {
  open: boolean;
  onClose: () => void;
};

/** Fullscreen menu overlay for touch. Locks the page, traps Escape, closes on nav. */
export function MobileNavigation({ open, onClose }: Props) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    // Move focus into the overlay so keyboard users land in the menu.
    panelRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Hoofdmenu"
          className="fixed inset-0 z-40 flex flex-col bg-hull lg:hidden"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: reduced ? 0.15 : 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="shell flex flex-1 flex-col justify-between pb-10 pt-28">
            <nav aria-label="Hoofdmenu">
              <ul className="flex flex-col">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    className="border-b border-white/10"
                    initial={reduced ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: reduced ? 0 : 0.06 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <a
                      href={link.href}
                      onClick={onClose}
                      className="flex items-baseline gap-4 py-5 type-h3 text-bone transition-colors hover:text-red"
                    >
                      <span className="type-label text-deck">{String(i + 1).padStart(2, '0')}</span>
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="flex flex-col gap-5">
              <a
                href="#prijslijst"
                onClick={onClose}
                className="flex items-center justify-between rounded-[2px] bg-red px-6 py-5 type-label text-white"
              >
                Prijslijst
                <svg aria-hidden="true" viewBox="0 0 16 12" className="h-2.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M0 6h14M9.5 1.5 14.5 6l-5 4.5" />
                </svg>
              </a>
              <p className="type-label text-deck">Built in the Netherlands</p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
