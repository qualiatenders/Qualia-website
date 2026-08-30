'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { INTRO } from '@/lib/content';
import { Media } from './Media';
import { Reveal } from './Reveal';
import { SectionHeader } from './SectionHeader';

/** 01 — the brand statement, told mostly in detail photography. */
export function Intro() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const drift = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);

  return (
    <section id="assault-500" className="bg-bone py-24 text-hull lg:py-36">
      <div className="shell grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5 lg:pr-6">
          <SectionHeader index={INTRO.index} eyebrow={INTRO.eyebrow} title={INTRO.title} tone="light" />

          <div className="mt-8 space-y-4">
            {INTRO.body.map((paragraph, i) => (
              <Reveal key={paragraph} delay={0.06 + i * 0.06} as="p" className="type-body text-deck">
                {paragraph}
              </Reveal>
            ))}
          </div>

          <ul className="mt-12 border-t border-black/12">
            {INTRO.points.map((point, i) => (
              <Reveal key={point.title} as="li" delay={0.08 + i * 0.07} className="border-b border-black/12">
                <div className="flex gap-5 py-6">
                  <span className="type-label mt-1 w-8 shrink-0 text-red">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="type-label text-hull">{point.title}</h3>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-deck">{point.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <div ref={ref} className="relative lg:col-span-7">
          <Reveal y={36}>
            <Media
              media={INTRO.media.primary}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="w-full"
              hoverZoom
            />
          </Reveal>

          {/* Offset detail plate — the asymmetry that keeps the grid alive. */}
          <motion.div
            className="relative z-10 -mt-16 ml-auto w-[58%] sm:w-[44%] lg:-mt-28 lg:ml-0 lg:-translate-x-10"
            style={reduced ? undefined : { y: drift }}
          >
            <Reveal delay={0.15} y={28}>
              <div className="border-8 border-bone">
                <Media media={INTRO.media.detail} sizes="(max-width: 1024px) 50vw, 25vw" hoverZoom />
              </div>
              <p className="type-label mt-3 text-mill">Al 5083 · 4 mm · binnen + buiten gelast</p>
            </Reveal>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
