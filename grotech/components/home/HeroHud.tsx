'use client';

import { useEffect, useRef } from 'react';

/**
 * Subtiel bewegend grafisch detail in de hero: een meetkruis met
 * coördinatenuitlezing. Draait op lage framerate en stopt bij reduced motion
 * of wanneer de hero niet in beeld is.
 */
export function HeroHud() {
  const xRef = useRef<HTMLSpanElement>(null);
  const yRef = useRef<HTMLSpanElement>(null);
  const zRef = useRef<HTMLSpanElement>(null);
  const reticle = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let last = 0;
    let visible = true;
    const start = performance.now();
    const io = new IntersectionObserver(([e]) => (visible = Boolean(e?.isIntersecting)));
    if (reticle.current) io.observe(reticle.current);
    const fmt = (n: number) => (n < 0 ? '−' : ' ') + Math.abs(n).toFixed(3).padStart(7, ' ');
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || t - last < 90) return;
      last = t;
      const s = (t - start) / 1000;
      const x = 124.5 + Math.sin(s * 0.31) * 18.2 + Math.sin(s * 0.9) * 2.1;
      const y = -38.25 + Math.cos(s * 0.23) * 12.6;
      const z = -12 + Math.sin(s * 0.17) * 0.6;
      if (xRef.current) xRef.current.textContent = fmt(x);
      if (yRef.current) yRef.current.textContent = fmt(y);
      if (zRef.current) zRef.current.textContent = fmt(z);
      if (reticle.current) reticle.current.style.transform = `translate3d(${Math.sin(s * 0.31) * 26}px, ${Math.cos(s * 0.23) * 16}px, 0)`;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
      {/* meetkruis rond de freespunt */}
      <div className="absolute top-[56%] left-[69%] -translate-x-1/2 -translate-y-1/2">
        <div ref={reticle} className="relative size-28 will-change-transform">
          <span className="absolute inset-0 rounded-full border border-red/70" />
          <span className="absolute inset-[38%] rounded-full border border-red" />
          <span className="absolute top-[-14px] left-1/2 h-6 w-px -translate-x-1/2 bg-red" />
          <span className="absolute bottom-[-14px] left-1/2 h-6 w-px -translate-x-1/2 bg-red" />
          <span className="absolute top-1/2 left-[-14px] h-px w-6 -translate-y-1/2 bg-red" />
          <span className="absolute top-1/2 right-[-14px] h-px w-6 -translate-y-1/2 bg-red" />
        </div>
      </div>
      {/* hoekmarkeringen als zoeker */}
      {['top-28 left-[44%] border-t border-l', 'top-28 right-8 border-t border-r', 'bottom-36 left-[44%] border-b border-l', 'bottom-36 right-8 border-b border-r'].map((c) => (
        <span key={c} className={`absolute size-6 border-offwhite/40 ${c}`} />
      ))}
      {/* uitlezing */}
      <div className="absolute right-8 bottom-36 min-w-[13.5rem] rounded-[3px] border border-line-strong bg-black/55 px-4 py-3 font-mono text-[0.75rem] leading-6 text-mist backdrop-blur-md">
        <div className="mb-1 flex items-center justify-between gap-6 font-sans text-[0.625rem] font-bold tracking-[0.2em] text-muted uppercase">
          <span>Positie</span>
          <span className="flex items-center gap-1.5 text-offwhite">
            <span className="pulse-dot size-1.5 rounded-full bg-red" /> Live
          </span>
        </div>
        <div className="flex justify-between"><span className="text-red">X</span><span ref={xRef} className="tabular-nums text-offwhite">{' '}124.500</span></div>
        <div className="flex justify-between"><span className="text-red">Y</span><span ref={yRef} className="tabular-nums text-offwhite">−38.250</span></div>
        <div className="flex justify-between"><span className="text-red">Z</span><span ref={zRef} className="tabular-nums text-offwhite">−12.000</span></div>
      </div>
    </div>
  );
}
