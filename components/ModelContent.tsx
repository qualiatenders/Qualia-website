'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MODELS } from '@/lib/content';
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

        {/*
          Besturing: one black strip split in two, so what is standard and what
          is an option read as a single fact instead of two loose chips.
        */}
        <div className="cut-tag mt-5 flex w-full items-stretch bg-hull text-bone sm:w-fit">
          <span className="hidden items-center px-5 type-label text-mill sm:flex">Besturing</span>
          <span className="flex flex-1 flex-col gap-1 border-l border-white/12 px-5 py-3.5 sm:flex-none sm:px-7">
            <span className="flex items-center gap-2 type-label">
              <span className="h-1.5 w-1.5 shrink-0 bg-red" aria-hidden="true" />
              Tiller
            </span>
            <span className="type-label text-mill">Standaard</span>
          </span>
          <span className="flex flex-1 flex-col gap-1 border-l border-white/12 px-5 py-3.5 sm:flex-none sm:px-7">
            <span className="type-label text-bone/70">Console</span>
            <span className="type-label text-mill">Optioneel</span>
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

            </div>
          );
        })}
      </div>
    </div>
  );
}
