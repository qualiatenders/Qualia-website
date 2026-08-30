'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { HERO } from '@/lib/content';
import { ArrowLink } from './ArrowLink';
import { Media } from './Media';
import { MaskReveal } from './Reveal';
import { ProductStats } from './ProductStats';

/**
 * Near-fullscreen opener on hull black.
 *
 * The render is cut out of its studio background and sits at low opacity,
 * masked so it dissolves into the ground rather than ending on an edge —
 * present enough to read as the product, quiet enough that the typography
 * still carries the page.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const drift = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const fade = useTransform(scrollYProgress, [0, 1], [1, 0.2]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden bg-hull pt-24 lg:pt-28"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-[-14%] w-[135%] sm:right-[-8%] sm:w-[105%] lg:right-[-6%] lg:w-[72%]"
        style={reduced ? undefined : { y: drift, opacity: fade }}
        initial={reduced ? false : { scale: 1.06, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Masked on both axes so the render melts into the black instead of
            stopping at a rectangle. */}
        <div className="h-full w-full opacity-[0.38] [mask-image:linear-gradient(to_right,transparent,black_38%,black_100%),linear-gradient(to_bottom,transparent,black_22%,black_72%,transparent)] [mask-composite:intersect]">
          <Media media={HERO.media} priority sizes="100vw" className="h-full w-full !aspect-auto !bg-transparent" />
        </div>
      </motion.div>

      <div className="shell relative w-full">
        <div className="flex flex-col gap-8 pb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pb-14">
          <div>
            <motion.p
              data-reveal
              className="type-label flex items-center gap-3 text-mill"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <span className="h-1.5 w-1.5 shrink-0 bg-red" aria-hidden="true" />
              {HERO.eyebrow}
            </motion.p>

            <h1 className="type-display mt-5 text-bone">
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
            <p className="text-[1.0625rem] font-medium leading-snug text-bone lg:text-xl">{HERO.lead}</p>
            <p className="type-body mt-3 text-mill">{HERO.body}</p>
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
