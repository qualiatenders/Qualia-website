import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

type Props = {
  index: string;
  eyebrow: string;
  title: ReactNode;
  subcopy?: string;
  className?: string;
  /** Light sections invert the hairline and label colours. */
  tone?: 'dark' | 'light';
};

/** Numbered section opener: 01 / ASSAULT 500 — the technical spine of the page. */
export function SectionHeader({ index, eyebrow, title, subcopy, className = '', tone = 'dark' }: Props) {
  const rule = tone === 'dark' ? 'bg-white/15' : 'bg-black/15';
  const labelColor = tone === 'dark' ? 'text-mill' : 'text-deck';

  return (
    <div className={className}>
      <Reveal className="flex items-center gap-4">
        <span className="type-label text-red">{index}</span>
        <span className={`h-px w-8 ${rule}`} aria-hidden="true" />
        <span className={`type-label ${labelColor}`}>{eyebrow}</span>
      </Reveal>
      <Reveal delay={0.08} className="mt-7">
        <h2 className="type-h2">{title}</h2>
      </Reveal>
      {subcopy ? (
        <Reveal delay={0.14} className="mt-5">
          <p className={`type-body ${tone === 'dark' ? 'text-mill' : 'text-deck'}`}>{subcopy}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
