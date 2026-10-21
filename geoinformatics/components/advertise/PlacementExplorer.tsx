'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { placements, type PlacementId } from '@/lib/ads/placements';

/**
 * Interactive schematic of where each placement appears, on desktop and on
 * mobile. Selecting a placement in the list highlights it in both mockups.
 */
type View = 'home' | 'article' | 'category';

const onView: Record<View, PlacementId[]> = {
  home: ['home-takeover', 'home-leaderboard', 'sidebar-rectangle'],
  article: ['site-leaderboard', 'article-inline', 'sidebar-rectangle', 'article-halfpage', 'article-end'],
  category: ['category-leaderboard', 'sidebar-rectangle'],
};

const viewFor = (id: PlacementId): View => (onView.home.includes(id) ? 'home' : onView.article.includes(id) ? 'article' : 'category');

export function PlacementExplorer() {
  const [active, setActive] = useState<PlacementId>('home-takeover');
  const [view, setView] = useState<View>('home');
  const reduce = useReducedMotion();

  const choose = (id: PlacementId) => {
    setActive(id);
    if (!onView[view].includes(id)) setView(viewFor(id));
  };

  const Slot = ({ id, className, label }: { id: PlacementId; className: string; label?: string }) => {
    const on = active === id;
    return (
      <button
        type="button"
        onClick={() => choose(id)}
        aria-label={placements.find((p) => p.id === id)!.name}
        aria-pressed={on}
        // Colour follows state directly (no animated background), so text contrast holds at every moment.
        className={`relative grid place-items-center overflow-hidden border transition-colors duration-300 ${on ? 'border-red bg-red' : 'border-red/50 bg-[#fbe8e9]'} ${className}`}
      >
        <span className={`font-sans text-[0.6rem] font-bold tracking-[0.08em] uppercase sm:text-[0.65rem] ${on ? 'text-white' : 'text-ink'}`}>{label ?? placements.find((p) => p.id === id)!.format.split('·')[0]}</span>
      </button>
    );
  };

  const block = 'bg-ink/[0.07]';
  const line = (w: string) => <div className={`h-1.5 ${block} ${w}`} />;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <div role="tablist" aria-label="Page type" className="mb-6 inline-flex border border-line-strong p-1">
          {(['home', 'article', 'category'] as View[]).map((v) => (
            <button key={v} role="tab" type="button" aria-selected={view === v} onClick={() => { setView(v); setActive(onView[v][0]!); }} className={`relative px-4 py-2 text-sm font-medium capitalize ${view === v ? 'text-white' : 'text-fg-muted hover:text-fg'}`}>
              {view === v && <motion.span layoutId="pe-tab" className="absolute inset-0 bg-ink" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
              <span className="relative">{v === 'home' ? 'Homepage' : v}</span>
            </button>
          ))}
        </div>
        <ul className="divide-y divide-[color:var(--line)] border-y border-line">
          {placements.map((p) => {
            const on = active === p.id;
            return (
              <li key={p.id}>
                <button type="button" onClick={() => choose(p.id)} aria-pressed={on} className="group flex w-full items-start gap-4 py-4 text-left">
                  <span className={`mt-1.5 size-2.5 flex-none transition-colors ${on ? 'bg-red' : 'bg-[color:var(--line-strong)] group-hover:bg-red/60'}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <span className="font-display text-lg font-semibold">{p.name}</span>
                      <span className="meta">{p.format}</span>
                    </span>
                    <motion.span initial={false} animate={{ height: on ? 'auto' : 0, opacity: on ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.35 }} className="block overflow-hidden">
                      <span className="block pt-2 text-sm text-fg-muted">
                        {p.where}
                        <span className="meta mt-2 block">
                          Desktop {p.desktop.w}×{p.desktop.h}
                          {'mobile' in p && p.mobile ? ` · Mobile ${p.mobile.w}×${p.mobile.h}` : ' · Desktop only'}
                          {'premium' in p && p.premium ? ' · Premium, exclusive' : ''}
                        </span>
                      </span>
                    </motion.span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-start gap-4 sm:gap-6 lg:col-span-7" aria-hidden="false">
        {/* Desktop mockup */}
        <figure className="min-w-0 flex-1">
          <div className="border border-line-strong bg-white shadow-[0_30px_60px_-30px_rgb(0_0_0/0.35)]">
            <div className="flex items-center gap-1.5 border-b border-line bg-paper px-3 py-2">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-2 rounded-full bg-ink/15" />
              ))}
              <span className="ml-3 h-3 flex-1 bg-ink/[0.06]" />
            </div>
            <div className="flex h-6 items-center gap-2 bg-ink px-3">
              <span className="size-2.5 bg-red" />
              <span className="h-1.5 w-12 bg-white/40" />
              <span className="ml-auto h-1.5 w-20 bg-white/20" />
            </div>
            <div className="space-y-2.5 p-3">
              {view === 'home' && (
                <>
                  <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 bg-ink p-2">
                    <div className="aspect-[16/10] bg-white/15" />
                    <div className="space-y-1.5">
                      <div className="aspect-[16/10] bg-white/15" />
                      <div className="aspect-[16/10] bg-white/15" />
                    </div>
                    <div className="space-y-1.5 pt-1">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-1.5 bg-white/20" />)}</div>
                  </div>
                  <Slot id="home-takeover" className="aspect-[1600/400] w-full" label="Premium takeover" />
                  <div className="grid grid-cols-[2fr_1fr] gap-3">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`aspect-[16/10] ${block}`} />
                        <div className={`aspect-[16/10] ${block}`} />
                      </div>
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex gap-2">
                          <div className={`aspect-[4/3] w-1/4 ${block}`} />
                          <div className="flex-1 space-y-1">{line('w-full')}{line('w-2/3')}</div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="aspect-[4/5] bg-ink/80" />
                      <Slot id="sidebar-rectangle" className="aspect-[300/250] w-full" label="300×250" />
                    </div>
                  </div>
                  <Slot id="home-leaderboard" className="mx-auto aspect-[970/250] w-[78%]" label="970×250" />
                  <div className="h-14 bg-ink" />
                </>
              )}
              {view === 'article' && (
                <>
                  <div className="space-y-1.5 bg-ink p-3">
                    <div className="h-1.5 w-16 bg-red/80" />
                    <div className="h-3 w-3/4 bg-white/60" />
                    <div className="h-3 w-1/2 bg-white/60" />
                    <div className="mt-2 aspect-[21/7] bg-white/15" />
                  </div>
                  <Slot id="site-leaderboard" className="mx-auto aspect-[728/90] w-[62%]" label="728×90" />
                  <div className="grid grid-cols-[2fr_1fr] gap-3">
                    <div className="space-y-1.5">
                      {line('w-full')}
                      {line('w-full')}
                      {line('w-5/6')}
                      {line('w-full')}
                      <Slot id="article-inline" className="my-2 aspect-[640/360] w-full" label="In-article" />
                      {line('w-full')}
                      {line('w-4/6')}
                      {line('w-full')}
                      {line('w-5/6')}
                    </div>
                    <div className="space-y-2">
                      <Slot id="sidebar-rectangle" className="aspect-[300/250] w-full" label="300×250" />
                      <Slot id="article-halfpage" className="aspect-[300/600] w-full" label="300×600" />
                    </div>
                  </div>
                  <Slot id="article-end" className="mx-auto aspect-[728/90] w-[62%]" label="728×90" />
                </>
              )}
              {view === 'category' && (
                <>
                  <div className="space-y-1.5 bg-ink p-3">
                    <div className="h-1.5 w-10 bg-red/80" />
                    <div className="h-4 w-1/2 bg-white/60" />
                    {line('w-2/3 bg-white/20')}
                  </div>
                  <Slot id="category-leaderboard" className="mx-auto aspect-[970/250] w-[78%]" label="Desk 970×250" />
                  <div className="grid grid-cols-[2fr_1fr] gap-3">
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-2">
                          <div className={`aspect-[4/3] w-1/4 ${block}`} />
                          <div className="flex-1 space-y-1">{line('w-full')}{line('w-2/3')}</div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="aspect-[4/5] bg-ink/80" />
                      <Slot id="sidebar-rectangle" className="aspect-[300/250] w-full" label="300×250" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <figcaption className="meta mt-3">Desktop</figcaption>
        </figure>

        {/* Mobile mockup */}
        <figure className="w-[26%] max-w-[11rem] flex-none">
          <div className="overflow-hidden rounded-[1.25rem] border-[5px] border-ink bg-white shadow-[0_30px_60px_-30px_rgb(0_0_0/0.4)]">
            <div className="flex h-5 items-center bg-ink px-2">
              <span className="size-2 bg-red" />
            </div>
            <div className="space-y-2 p-2">
              {view === 'home' && (
                <>
                  <div className="aspect-[16/10] bg-ink" />
                  <Slot id="home-takeover" className="aspect-[320/100] w-full" label="320×100" />
                  {[0, 1].map((i) => <div key={i} className={`aspect-[16/9] ${block}`} />)}
                  <Slot id="sidebar-rectangle" className="mx-auto aspect-[300/250] w-[94%]" label="300×250" />
                  <Slot id="home-leaderboard" className="aspect-[320/100] w-full" label="320×100" />
                </>
              )}
              {view === 'article' && (
                <>
                  <div className="space-y-1 bg-ink p-1.5">
                    <div className="h-2 w-3/4 bg-white/60" />
                    <div className="aspect-[16/9] bg-white/15" />
                  </div>
                  <Slot id="site-leaderboard" className="aspect-[320/100] w-full" label="320×100" />
                  {line('w-full')}
                  {line('w-5/6')}
                  <Slot id="article-inline" className="mx-auto aspect-[300/250] w-[94%]" label="300×250" />
                  {line('w-full')}
                  {line('w-4/6')}
                  <Slot id="article-end" className="aspect-[320/100] w-full" label="320×100" />
                  <Slot id="sidebar-rectangle" className="mx-auto aspect-[300/250] w-[94%]" label="300×250" />
                </>
              )}
              {view === 'category' && (
                <>
                  <div className="h-10 bg-ink" />
                  <Slot id="category-leaderboard" className="aspect-[320/100] w-full" label="320×100" />
                  {[0, 1, 2].map((i) => <div key={i} className={`aspect-[16/9] ${block}`} />)}
                  <Slot id="sidebar-rectangle" className="mx-auto aspect-[300/250] w-[94%]" label="300×250" />
                </>
              )}
            </div>
          </div>
          <figcaption className="meta mt-3">Mobile</figcaption>
        </figure>
      </div>
    </div>
  );
}
