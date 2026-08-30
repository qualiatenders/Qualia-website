'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { HERO } from '@/lib/content';
import { ArrowLink } from './ArrowLink';
import { Media } from './Media';
import { MaskReveal } from './Reveal';
import { ProductStats } from './ProductStats';

/**
 * Near-fullscreen opener.
 *
 * Light, because the product does: the renders are cut out but keep their
 * studio shadow, which only reads as a shadow against a light ground. The
 * boat floats in the upper two thirds, the headline and the numbers close
 * the frame at the bottom.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const drift = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const fade = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[92svh] flex-col overflow-hidden bg-bone pt-20 text-hull lg:pt-24"
    >
      {/* The boat, floating. */}
      <motion.div
        /*
          Narrow screens keep the boat in flow, above the type — overlapping it
          there buries the headline. From lg it moves to the upper right, where
          the hull can bleed past the edge and the headline keeps its own space.
        */
        className="pointer-events-none relative h-[26svh] w-full shrink-0 sm:h-[32svh] lg:absolute lg:left-[30%] lg:right-[-3%] lg:top-[2%] lg:h-[44%] lg:w-auto"
        style={reduced ? undefined : { y: drift, opacity: fade }}
        initial={reduced ? false : { scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Media media={HERO.media} priority sizes="100vw" className="h-full w-full !aspect-auto !bg-transparent !ring-0" />
      </motion.div>

      <div className="shell relative mt-auto w-full">
        <div className="flex flex-col gap-8 pb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pb-14">
          <div>
            <motion.p
              data-reveal
              className="type-label flex items-center gap-3 text-deck"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <span className="h-1.5 w-1.5 shrink-0 bg-red" aria-hidden="true" />
              {HERO.eyebrow}
            </motion.p>

            <h1 className="type-display mt-5 text-hull">
              <MaskReveal delay={0.28}>{HERO.title}</MaskReveal>
            </h1>
          </div>

          <motion.div
            data-reveal
            className="max-w-md lg:pb-3"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[1.0625rem] font-medium leading-snug text-hull lg:text-xl">{HERO.lead}</p>
            <p className="type-body mt-3 text-deck">{HERO.body}</p>
            <ArrowLink href={HERO.cta.href} className="mt-7">
              {HERO.cta.label}
            </ArrowLink>
          </motion.div>
        </div>

        <ProductStats />
      </div>
    </section>
  );
}
