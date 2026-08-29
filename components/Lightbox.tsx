'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';
import type { GalleryItem } from '@/lib/content';
import { Media } from './Media';

type Props = {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

/** Fullscreen viewer. Escape closes, arrows step, focus returns on close. */
export function Lightbox({ items, index, onClose, onNavigate }: Props) {
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null;

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onNavigate((index + delta + items.length) % items.length);
    },
    [index, items.length, onNavigate],
  );

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [open, onClose, step]);

  const item = index === null ? null : items[index];

  return (
    <AnimatePresence>
      {item ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Afbeelding ${(index ?? 0) + 1} van ${items.length}: ${item.caption}`}
          className="fixed inset-0 z-[60] flex flex-col bg-hull/97 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.1 : 0.28 }}
        >
          <div className="flex items-center justify-between px-5 py-4 lg:px-10">
            <span className="type-label text-mill">
              {String((index ?? 0) + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')} · {item.caption}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Sluiten"
              className="flex h-11 w-11 items-center justify-center text-mill transition-colors hover:text-white"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <path d="M4 4l12 12M16 4L4 16" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center px-4 pb-4 lg:px-16">
            <motion.div
              key={item.slot}
              className="max-h-full w-full max-w-6xl"
              initial={reduced ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Media media={item} sizes="90vw" className="max-h-[76svh] w-full" />
            </motion.div>
          </div>

          <div className="flex items-center justify-center gap-3 pb-8">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Vorige afbeelding"
              className="flex h-12 w-12 items-center justify-center border border-white/20 text-bone transition-colors hover:border-red hover:text-red"
            >
              <svg viewBox="0 0 16 12" className="h-3 w-4 rotate-180" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M0 6h14M9.5 1.5 14.5 6l-5 4.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Volgende afbeelding"
              className="flex h-12 w-12 items-center justify-center border border-white/20 text-bone transition-colors hover:border-red hover:text-red"
            >
              <svg viewBox="0 0 16 12" className="h-3 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M0 6h14M9.5 1.5 14.5 6l-5 4.5" />
              </svg>
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
