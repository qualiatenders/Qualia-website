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
  // "Assault 500" splits into a solid word and an outlined number.
  const [model, number] = [HERO.title.replace(/\s+\S+$/, ''), HERO.title.split(' ').pop() ?? ''];
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const drift = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const fade = useTransform(scrollYProgress, [0, 1], [1, 0.2]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[88svh] flex-col justify-end overflow-hidden bg-hull pt-24 lg:min-h-[92svh] lg:pt-28"
    >
      {/* Cropped in close, the way a deck shot fills the frame — atmosphere
          rather than a product cut-out. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={reduced ? undefined : { y: drift, opacity: fade }}
        initial={reduced ? false : { scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Media
          media={HERO.media}
          priority
          sizes="100vw"
          className="h-full w-full !aspect-auto !bg-transparent"
          imageClassName="scale-[2.6] object-center sm:scale-[2] lg:scale-[1.5]"
        />
      </motion.div>

      {/* Legibility veil, weighted to the bottom where the type sits. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.82)_34%,rgba(0,0,0,0.55)_66%,rgba(0,0,0,0.75)_100%)]"
      />

      <div className="shell relative w-full">
        <div className="flex flex-col gap-7 pb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pb-14">
          <div>
            <motion.p
              data-reveal
              className="type-label flex items-center gap-3 text-red sm:gap-4"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <span className="rule-red shrink-0" aria-hidden="true" />
              {HERO.eyebrow}
            </motion.p>

            {/* Model name solid, number in outline — the two-tone opener. */}
            <h1 className="type-display mt-5 text-bone lg:mt-6">
              <MaskReveal delay={0.28}>{model}</MaskReveal>
              <MaskReveal delay={0.4} className="type-outline">
                {number}
              </MaskReveal>
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
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:mt-8">
              <ArrowLink href={HERO.cta.href} className="justify-center sm:justify-start">
                {HERO.cta.label}
              </ArrowLink>
              <ArrowLink href="#specs" variant="outline" className="justify-center sm:justify-start">
                Bekijk specificaties
              </ArrowLink>
            </div>
          </motion.div>
        </div>

        <ProductStats />
      </div>
    </section>
  );
}
