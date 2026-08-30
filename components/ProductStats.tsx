'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { HERO } from '@/lib/content';

/**
 * The four headline numbers, built into the bottom edge of the hero as one
 * measured rail rather than four cards. 2x2 on phones, 4-up from tablet.
 */
export function ProductStats() {
  const reduced = useReducedMotion();

  return (
    <dl className="grid grid-cols-2 border-t border-black/15 sm:grid-cols-4">
      {HERO.stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          data-reveal
          className={`flex flex-col gap-1 py-5 pr-4 sm:py-7 ${
            i % 2 === 1 ? 'border-l border-black/15 pl-4 sm:pl-6' : 'sm:pl-0'
          } ${i >= 2 ? 'border-t border-black/15 sm:border-t-0' : ''} ${
            i === 2 ? 'sm:border-l sm:pl-6' : ''
          }`}
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: reduced ? 0 : 0.85 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
        >
          <dd className="type-stat text-hull">
            {stat.value}
            <span className="ml-1.5 align-baseline text-[0.4em] font-semibold tracking-[0.08em] text-mill">
              {stat.unit}
            </span>
          </dd>
          <dt className="type-label text-deck">{stat.label}</dt>
        </motion.div>
      ))}
    </dl>
  );
}
