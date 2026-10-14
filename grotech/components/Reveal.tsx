'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Eén IntersectionObserver voor de hele site: elementen met [data-reveal] of
 * [data-draw] krijgen .is-visible zodra ze in beeld komen. Zonder JS of met
 * reduced motion is alles direct zichtbaar (zie globals.css).
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible), [data-draw]:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    els.forEach((el) => {
      if (el.hasAttribute('data-draw')) {
        el.querySelectorAll<SVGGeometryElement>('.dr').forEach((p) => {
          try {
            p.style.setProperty('--len', String(Math.ceil(p.getTotalLength()) + 2));
          } catch {}
        });
      }
      io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
