'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { BreakingItem } from '@/lib/types';
import { Icon } from './Icon';

/**
 * Headline ticker. "Breaking" (with the live pulse) only appears when an
 * editor has flagged stories as breaking in WordPress; otherwise it is a calm
 * "Latest" strip. Moves slowly, pauses on hover/focus, and has an explicit
 * pause button (WCAG 2.2.2). With reduced motion it becomes a scrollable row.
 */
export function Ticker({ items, mode }: { items: BreakingItem[]; mode: 'breaking' | 'latest' }) {
  const [paused, setPaused] = useState(false);
  if (!items.length) return null;
  const loop = [...items, ...items];
  const breaking = mode === 'breaking';
  return (
    <section aria-label={breaking ? 'Breaking news' : 'Latest headlines'} className={`ticker relative border-b ${breaking ? 'border-red/40 bg-[#1a0b0c]' : 'border-white/10 bg-anthracite'}`} data-paused={paused}>
      <div className="flex h-11 items-stretch">
        <div className={`relative z-10 flex flex-none items-center gap-2.5 pr-4 pl-4 sm:pl-7 xl:pl-10 ${breaking ? 'bg-red text-white' : 'bg-anthracite text-white'}`}>
          {breaking ? <span className="live-dot bg-white!" aria-hidden="true" /> : <span className="size-1.5 bg-red" aria-hidden="true" />}
          <span className="kicker font-semibold">{breaking ? 'Breaking' : 'Latest'}</span>
        </div>
        <div className="relative min-w-0 flex-1 overflow-hidden motion-reduce:overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_2rem,black_calc(100%-3rem),transparent)]">
          <ul className="ticker-track flex h-full w-max items-center" style={{ ['--ticker-duration' as string]: `${Math.max(40, items.length * 12)}s` }}>
            {loop.map((it, i) => (
              <li key={`${it.id}-${i}`} className="flex items-center" aria-hidden={i >= items.length ? true : undefined}>
                <Link href={it.path} tabIndex={i >= items.length ? -1 : undefined} className="px-6 text-[0.875rem] font-medium whitespace-nowrap text-white transition-colors hover:text-white hover:underline">
                  {it.title}
                </Link>
                <span className="size-1 rotate-45 bg-red" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
        <button type="button" onClick={() => setPaused((p) => !p)} className="grid w-11 flex-none place-items-center border-l border-white/10 text-white hover:text-white motion-reduce:hidden" aria-label={paused ? 'Resume headline ticker' : 'Pause headline ticker'} aria-pressed={paused}>
          <Icon name={paused ? 'play' : 'pause'} className="size-4" />
        </button>
      </div>
    </section>
  );
}
