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
    <section id="assault-500" className="border-t border-white/10 bg-hull py-24 lg:py-36">
      <div className="shell">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5 lg:pr-6">
            <SectionHeader index={INTRO.index} eyebrow={INTRO.eyebrow} title={INTRO.title} />

            <div className="mt-8 space-y-4">
              {INTRO.body.map((paragraph, i) => (
                <Reveal key={paragraph} delay={0.06 + i * 0.06} as="p" className="type-body text-mill">
                  {paragraph}
                </Reveal>
              ))}
            </div>
          </div>

          <div ref={ref} className="lg:col-span-7">
            <Reveal y={36}>
              <Media
                media={INTRO.media.primary}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="w-full"
                hoverZoom
              />
            </Reveal>

            {/* Offset plate — the asymmetry that keeps the grid alive. */}
            <motion.div
              className="relative z-10 -mt-14 ml-auto w-[52%] sm:w-[38%] lg:-mt-24 lg:ml-0 lg:-translate-x-10"
              style={reduced ? undefined : { y: drift }}
            >
              <Reveal delay={0.15} y={28}>
                <div className="border-4 border-hull">
                  <Media media={INTRO.media.detail} sizes="(max-width: 1024px) 50vw, 25vw" hoverZoom />
                </div>
              </Reveal>
            </motion.div>

            <Reveal delay={0.2} as="p" className="type-label mt-6 text-deck lg:mt-8">
              Al 5083 · 4 mm · binnen + buiten gelast
            </Reveal>
          </div>
        </div>

        {/*
          The three points get the full width rather than the narrow text
          column: at a third of that column the headings broke across three
          lines. No numbering here — the page already numbers its sections and
          its feature lists, and a third counter reads as decoration.
        */}
        <ul className="mt-20 grid gap-10 border-t border-white/12 sm:grid-cols-3 sm:gap-0 lg:mt-28">
          {INTRO.points.map((point, i) => (
            <Reveal
              key={point.title}
              as="li"
              delay={0.08 + i * 0.07}
              className={`pt-8 sm:px-8 lg:pt-10 ${i === 0 ? 'sm:pl-0' : 'sm:border-l sm:border-white/12'}`}
            >
              <span className="rule-red" aria-hidden="true" />
              <h3 className="mt-6 font-[family-name:var(--font-display)] text-[1.5rem] font-bold uppercase leading-[1.05] tracking-[-0.025em] text-bone lg:text-[1.75rem]">
                {point.title}
              </h3>
              <p className="type-body mt-3 text-mill">{point.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
