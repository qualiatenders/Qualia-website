'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  /** Stagger offset in seconds. */
  delay?: number;
  /** Distance travelled on entry. */
  y?: number;
  as?: 'div' | 'li' | 'span' | 'p';
};

/**
 * Scroll-triggered entrance. Motion is the only thing this adds — under
 * `prefers-reduced-motion` the element simply renders in place.
 */
export function Reveal({ children, className = '', delay = 0, y = 24, as = 'div' }: Props) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      data-reveal
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px -8% 0px' }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Headline mask reveal — the line slides up from behind a clipped edge.
 * Used sparingly, on the hero and section headlines only.
 */
export function MaskReveal({
  children,
  className = '',
  delay = 0,
  inView = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  inView?: boolean;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <span className={className}>{children}</span>;

  const animation = { y: '0%', opacity: 1 };
  const transition = { duration: 1.05, delay, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <span className={`block overflow-hidden pb-[0.08em] ${className}`}>
      <motion.span
        data-reveal
        className="block will-change-transform"
        initial={{ y: '105%', opacity: 0 }}
        {...(inView
          ? { animate: animation, transition }
          : { whileInView: animation, viewport: { once: true, margin: '-10%' }, transition })}
      >
        {children}
      </motion.span>
    </span>
  );
}
