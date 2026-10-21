'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { PlacementId } from '@/lib/ads/placements';
import type { AdEvent, Creative } from '@/lib/ads/types';

/**
 * Picks one creative per page view and measures it.
 *
 * Rotation: only creatives with the highest priority present compete (a
 * priority-10 booking is therefore exclusive); within that tier the pick is
 * random. Measurement follows the IAB/MRC display definitions:
 *   impression — the creative was rendered on the page
 *   viewable   — ≥ 50% of its pixels were in view for ≥ 1 continuous second
 * Clicks go through /api/ads/click, which records them and redirects.
 * No cookies or identifiers are used; events are anonymous counts.
 */
function pick(list: Creative[]) {
  const top = Math.max(...list.map((c) => c.priority));
  const tier = list.filter((c) => c.priority === top);
  return tier[Math.floor(Math.random() * tier.length)]!;
}

function device(): AdEvent['device'] {
  const w = window.innerWidth;
  return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
}

function send(ev: AdEvent) {
  const body = JSON.stringify(ev);
  if (navigator.sendBeacon?.('/api/ads/event/', new Blob([body], { type: 'application/json' }))) return;
  fetch('/api/ads/event/', { method: 'POST', body, headers: { 'content-type': 'application/json' }, keepalive: true }).catch(() => {});
}

export function AdRotator({ creatives, placement }: { creatives: Creative[]; placement: PlacementId }) {
  const [creative, setCreative] = useState<Creative | null>(null);
  const [dev, setDev] = useState<AdEvent['device']>('desktop');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCreative(pick(creatives));
    setDev(device());
  }, [creatives]);

  useEffect(() => {
    const el = ref.current;
    if (!creative || !el || creative.house) return;
    const base = { creative: creative.id, placement, device: dev };
    send({ ...base, type: 'impression' });
    let timer: number | undefined;
    let done = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (done) return;
        if (entry!.intersectionRatio >= 0.5 && document.visibilityState === 'visible') {
          timer ??= window.setTimeout(() => {
            done = true;
            send({ ...base, type: 'viewable' });
            io.disconnect();
          }, 1000);
        } else if (timer !== undefined) {
          window.clearTimeout(timer);
          timer = undefined;
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [creative, placement, dev]);

  if (!creative) return <div ref={ref} className="absolute inset-0 bg-[var(--line)]" aria-hidden="true" />;

  if (creative.house)
    return (
      <div ref={ref} className="absolute inset-0">
        <HouseAd kind={creative.house} placement={placement} />
      </div>
    );

  const href = `/api/ads/click/${encodeURIComponent(creative.id)}/?p=${placement}&d=${dev}`;
  return (
    <div ref={ref} className="group absolute inset-0 overflow-hidden">
      <a href={href} rel="sponsored noopener" target="_blank" className="block size-full">
        <picture>
          {creative.imageMobile && <source media="(max-width: 767px)" srcSet={creative.imageMobile} />}
          {/* Creatives are delivered at their final size; no optimisation pass needed. */}
          <img src={creative.image} alt={creative.alt} loading="lazy" decoding="async" className="size-full object-contain transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.01]" />
        </picture>
      </a>
    </div>
  );
}

/** GeoInformatics' own promotions, shown in preview mode instead of invented advertisers. */
function HouseAd({ kind, placement }: { kind: 'advertise' | 'newsletter'; placement: PlacementId }) {
  const tall = placement === 'article-halfpage';
  const square = placement === 'sidebar-rectangle' || tall;
  const href = kind === 'advertise' ? '/advertise/' : '/newsletter/';
  const title = kind === 'advertise' ? 'Put your brand at the centre of geospatial innovation.' : 'The world of geospatial. Delivered.';
  const cta = kind === 'advertise' ? 'Advertise with us' : 'Subscribe free';
  return (
    <Link
      href={href}
      className={`group graticule flex size-full overflow-hidden border border-white/10 bg-ink text-white transition-colors hover:border-white/25 ${square ? 'flex-col justify-between p-6' : 'items-center justify-between gap-4 px-4 sm:px-8'}`}
    >
      <span className={`flex min-w-0 ${square ? 'flex-col gap-4' : 'flex-col gap-1 sm:flex-row sm:items-center sm:gap-5'}`}>
        <span className="kicker text-red-ink">GeoInformatics</span>
        <span className={`font-display leading-[1.08] font-semibold tracking-[-0.015em] ${tall ? 'text-4xl' : square ? 'text-2xl' : 'text-[0.95rem] sm:text-xl lg:text-2xl'}`}>{title}</span>
      </span>
      <span className="btn btn-red min-h-9 flex-none px-3 text-xs sm:text-sm">
        {cta} <span className="arrow" aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
