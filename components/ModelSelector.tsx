'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';
import { MODELS } from '@/lib/content';
import { ModelContent } from './ModelContent';
import { Reveal } from './Reveal';
import { SectionHeader } from './SectionHeader';

/**
 * 02 — the two setups.
 *
 * Custom control, standard semantics: it reads as a tablist to assistive tech
 * and supports arrow-key traversal, but looks nothing like browser tabs.
 * Light section — the studio renders sit on a white ground.
 */
export function ModelSelector() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (active + delta + MODELS.length) % MODELS.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="uitvoeringen" className="bg-bone py-24 text-hull lg:py-36">
      <div className="shell">
        <SectionHeader
          index="02"
          eyebrow="Two setups"
          title="Pick your setup."
          subcopy="Dezelfde Assault 500. Jij bepaalt wat je ermee gaat doen."
          tone="light"
          className="max-w-2xl"
        />

        <Reveal delay={0.1} className="mt-12 lg:mt-16">
          <div
            role="tablist"
            aria-label="Kies een uitvoering"
            onKeyDown={onKeyDown}
            className="flex w-full max-w-lg border-b border-black/15"
          >
            {MODELS.map((model, i) => {
              const selected = i === active;
              return (
                <button
                  key={model.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  type="button"
                  id={`tab-${model.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${model.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  className="group relative flex flex-1 items-center gap-2.5 px-1 pb-4 pt-2 text-left transition-colors duration-300"
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 shrink-0 transition-colors duration-300 ${
                      selected ? 'bg-red' : 'bg-black/20 group-hover:bg-black/40'
                    }`}
                  />
                  <span
                    className={`type-label transition-colors duration-300 ${
                      selected ? 'text-hull' : 'text-mill group-hover:text-deck'
                    }`}
                  >
                    {model.name}
                  </span>

                  {selected ? (
                    <motion.span
                      layoutId={reduced ? undefined : 'selector-indicator'}
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-red"
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div
          role="tabpanel"
          id={`panel-${MODELS[active].id}`}
          aria-labelledby={`tab-${MODELS[active].id}`}
          className="mt-12 lg:mt-16"
        >
          <ModelContent activeIndex={active} />
        </div>
      </div>
    </section>
  );
}
