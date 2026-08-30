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
        <div className="relative overflow-hidden bg-white ring-1 ring-inset ring-black/10" style={{ aspectRatio: model.media.ratio }}>
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

      {/* Copy */}
      <div className="lg:col-span-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={model.id}
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
          >
            <p className="type-label text-mill">{model.name}</p>
            <h3 className="type-h3 mt-4 text-hull">{model.title}</h3>
            <p className="type-body mt-5 text-deck">{model.body}</p>

            <div className="mt-9">
              <FeatureList features={model.features} tone="light" />
            </div>

            <ArrowLink href="#contact" variant="ghost" className="mt-9">
              {model.cta}
            </ArrowLink>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
