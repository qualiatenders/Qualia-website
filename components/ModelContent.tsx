'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MODELS } from '@/lib/content';
import { ArrowLink } from './ArrowLink';
import { FeatureList } from './FeatureList';
import { Media } from './Media';

type Props = { activeIndex: number };

const EASE = [0.16, 1, 0.3, 1] as const;

/** The panel behind the selector: media crossfades, copy and features swap. */
export function ModelContent({ activeIndex }: Props) {
  const reduced = useReducedMotion();
  const model = MODELS[activeIndex];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
      {/* Media — both frames stacked so the swap is a true crossfade. */}
      <div className="lg:col-span-7">
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: model.media.ratio }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={model.id}
              className="absolute inset-0"
              initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.55, ease: EASE }}
            >
              <Media
                media={model.media}
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="h-full w-full !aspect-auto"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Besturing indicator — tiller is the standard setup, console is an option. */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="type-label text-mill">Besturing</span>
          <span className="flex items-center gap-2 rounded-[2px] border border-red/40 bg-red/8 px-3 py-1.5 type-label text-red">
            <span className="h-1.5 w-1.5 bg-red" aria-hidden="true" />
            Tiller · standaard
          </span>
          <span className="rounded-[2px] border border-black/15 px-3 py-1.5 type-label text-deck">
            Console · optioneel
          </span>
        </div>
      </div>

      {/*
        Copy — both setups occupy the same grid cell so the column is always as
        tall as the longest of the two. Swapping a tab then crossfades in place
        instead of reflowing everything below it.
      */}
      <div className="grid lg:col-span-5">
        {MODELS.map((entry, i) => {
          const active = i === activeIndex;
          return (
            <div
              key={entry.id}
              // Same cell for every setup.
              className={`col-start-1 row-start-1 transition-opacity duration-400 ease-[var(--ease-out-a)] ${
                active ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
              aria-hidden={!active}
              inert={!active}
            >
              <p className="type-label text-mill">{entry.name}</p>
              <h3 className="type-h3 mt-4 text-hull">{entry.title}</h3>
              <p className="type-body mt-5 text-deck">{entry.body}</p>

              <div className="mt-9">
                <FeatureList features={entry.features} tone="light" />
              </div>

              <ArrowLink href="#contact" variant="ghost" className="mt-9" tabIndex={active ? undefined : -1}>
                {entry.cta}
              </ArrowLink>
            </div>
          );
        })}
      </div>
    </div>
  );
}
