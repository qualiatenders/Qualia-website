'use client';

import { useRef, useState } from 'react';
import { GALLERY } from '@/lib/content';
import { Lightbox } from './Lightbox';
import { Media } from './Media';
import { SectionHeader } from './SectionHeader';

/**
 * 04 — the immersive rail.
 *
 * Drag or scroll horizontally on pointer devices, swipe natively on touch.
 * Mixed aspect ratios keep the rhythm editorial rather than grid-like.
 */
export function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const railRef = useRef<HTMLUListElement>(null);

  // Drag-to-pan state. `moved` suppresses the click that ends a drag.
  const drag = useRef({ startX: 0, startScroll: 0, moved: false });

  const onScroll = () => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  };

  /**
   * Drag-to-pan for mouse and pen; touch keeps native momentum scrolling.
   * Tracking happens on `window` rather than via `setPointerCapture`, which
   * would retarget the closing click away from the card and break the lightbox.
   */
  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === 'touch' || !railRef.current) return;
    drag.current = { startX: event.clientX, startScroll: railRef.current.scrollLeft, moved: false };

    const onMove = (move: PointerEvent) => {
      const rail = railRef.current;
      if (!rail) return;
      const delta = move.clientX - drag.current.startX;
      if (Math.abs(delta) > 4) {
        drag.current.moved = true;
        move.preventDefault();
      }
      rail.scrollLeft = drag.current.startScroll - delta;
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  return (
    <section id="gallery" className="border-t border-white/10 bg-hull py-24 lg:py-36">
      <div className="shell">
        <SectionHeader index="04" eyebrow="Details" title="Take a closer look." className="max-w-xl" />
      </div>

      {/* Full-bleed rail — starts at the shell gutter, runs off the right edge. */}
      <div className="mt-12 lg:mt-16">
        <ul
          ref={railRef}
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          className="rail-scroll flex snap-x snap-mandatory select-none gap-4 overflow-x-auto px-[clamp(1.25rem,4.5vw,5rem)] pb-2 lg:snap-none lg:cursor-grab lg:gap-6 lg:active:cursor-grabbing"
        >
          {GALLERY.map((item, i) => (
            <li
              key={item.slot}
              className="h-[clamp(15rem,50vh,32rem)] flex-none snap-start"
              style={{ aspectRatio: item.ratio }}
            >
              <button
                type="button"
                onClick={() => {
                  if (drag.current.moved) return;
                  setLightboxIndex(i);
                }}
                className="group relative block h-full w-full text-left"
                aria-label={`Vergroot: ${item.caption}`}
              >
                <Media
                  media={item}
                  sizes="(max-width: 768px) 85vw, 40vw"
                  className="h-full w-full !aspect-auto"
                  hoverZoom
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-[linear-gradient(to_top,rgba(0,0,0,0.75),transparent)] p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="type-label text-bone">{item.caption}</span>
                  <span className="type-label text-red">{String(i + 1).padStart(2, '0')}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Scroll indicator — the only affordance the rail needs. */}
        <div className="shell mt-8 flex items-center gap-5">
          <div className="h-px flex-1 bg-white/12" aria-hidden="true">
            <div
              className="h-px bg-red transition-[width] duration-150 ease-linear"
              style={{ width: `${Math.max(8, progress * 100)}%` }}
            />
          </div>
          <span className="type-label text-deck">
            <span className="hidden lg:inline">Sleep of scroll</span>
            <span className="lg:hidden">Swipe</span>
          </span>
        </div>
      </div>

      <Lightbox items={GALLERY} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
    </section>
  );
}
