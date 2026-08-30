'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { HERO } from '@/lib/content';
import { ArrowLink } from './ArrowLink';
import { Media } from './Media';
import { MaskReveal } from './Reveal';
import { ProductStats } from './ProductStats';

/**
 * Near-fullscreen opener. The photograph carries it; the overlay stays light
 * enough that the product reads, and the headline masks up on load so the
 * page is navigable immediately — no gated intro sequence.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const parallax = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const veil = useTransform(scrollYProgress, [0, 1], [0, 0.45]);

  return (
    <section id="top" ref={ref} className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden pt-24">
      {/* Media plate */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={reduced ? undefined : { y: parallax }}
        initial={reduced ? false : { scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Media
          media={HERO.media}
          priority
          sizes="100vw"
          className="!aspect-auto h-[112%] w-full"
        />
      </motion.div>

      {/* Legibility veil — bottom-weighted so the product stays visible. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.45)_34%,rgba(0,0,0,0.04)_64%,rgba(0,0,0,0.38)_100%)]"
      />
      <motion.div aria-hidden="true" className="absolute inset-0 -z-10 bg-hull" style={reduced ? undefined : { opacity: veil }} />

      <div className="shell relative w-full pb-0">
        <div className="flex flex-col gap-8 pb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pb-14">
          <div>
            <motion.p
              className="type-label flex items-center gap-3 text-mill"
              data-reveal
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
            className="max-w-md lg:pb-3"
            data-reveal
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
