import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

/**
 * Tekstblokken op de kennis- en informatiepagina's.
 *
 * Bewust geen generieke prose-plugin: dit is dezelfde typografie als de
 * rest van de site, in een smalle kolom, zodat een langere uitleg niet als
 * een tekstmuur uit een ander sjabloon voelt.
 */

export function Section({
  tone = 'light',
  children,
  className = '',
  id,
}: {
  tone?: 'light' | 'dark';
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ground = tone === 'dark' ? 'border-white/10 bg-hull text-bone' : 'border-black/10 bg-bone text-hull';
  return (
    <section id={id} className={`border-t ${ground} py-20 lg:py-28 ${className}`}>
      <div className="shell">{children}</div>
    </section>
  );
}

/** Kop van een tekstblok: rode streep, kop, optionele inleiding. */
export function Heading({
  children,
  tone = 'light',
  as: Tag = 'h2',
  lead,
}: {
  children: ReactNode;
  tone?: 'light' | 'dark';
  as?: 'h2' | 'h3';
  lead?: string;
}) {
  return (
    <Reveal>
      <span className="rule-red" aria-hidden="true" />
      <Tag className={`${Tag === 'h2' ? 'type-h3' : 'type-h3 text-[1.375rem] lg:text-[1.75rem]'} mt-6`}>{children}</Tag>
      {lead ? <p className={`type-body mt-5 max-w-2xl ${tone === 'dark' ? 'text-mill' : 'text-deck'}`}>{lead}</p> : null}
    </Reveal>
  );
}

/** Lopende tekst in een leesbare kolom. */
export function Body({
  paragraphs,
  tone = 'light',
  className = '',
}: {
  paragraphs: string[];
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <div className={`mt-8 max-w-2xl space-y-5 ${className}`}>
      {paragraphs.map((p, i) => (
        <Reveal key={p.slice(0, 40)} delay={0.05 + i * 0.05} as="p" className={`type-body ${tone === 'dark' ? 'text-mill' : 'text-deck'}`}>
          {p}
        </Reveal>
      ))}
    </div>
  );
}

/**
 * Genummerde punten, dezelfde vorm als de kernpunten op de homepage:
 * rode streep, display-kop, korte uitleg.
 */
export function Points({
  items,
  tone = 'light',
  columns = 3,
}: {
  items: { title: string; body: string }[];
  tone?: 'light' | 'dark';
  columns?: 2 | 3;
}) {
  const rand = tone === 'dark' ? 'border-white/12' : 'border-black/15';
  const kop = tone === 'dark' ? 'text-bone' : 'text-hull';
  const tekst = tone === 'dark' ? 'text-mill' : 'text-deck';
  const raster = columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3';

  return (
    <ul className={`mt-14 grid gap-10 border-t ${rand} ${raster} sm:gap-0 lg:mt-20`}>
      {items.map((item, i) => (
        <Reveal
          key={item.title}
          as="li"
          delay={0.08 + i * 0.07}
          className={`pt-8 sm:px-8 lg:pt-10 ${i === 0 ? 'sm:pl-0' : `sm:border-l ${rand}`}`}
        >
          <span className="rule-red" aria-hidden="true" />
          <h3
            className={`mt-6 font-[family-name:var(--font-display)] text-[1.25rem] font-bold uppercase leading-[1.1] tracking-[-0.025em] ${kop} lg:text-[1.5rem]`}
          >
            {item.title}
          </h3>
          <p className={`type-body mt-3 ${tekst}`}>{item.body}</p>
        </Reveal>
      ))}
    </ul>
  );
}

/** Opsomming met een rood blokje ervoor — zelfde markering als de prijslijst. */
export function Bullets({ items, tone = 'light' }: { items: string[]; tone?: 'light' | 'dark' }) {
  return (
    <ul className={`mt-8 max-w-2xl space-y-3 ${tone === 'dark' ? 'text-mill' : 'text-deck'}`}>
      {items.map((item, i) => (
        <Reveal key={item.slice(0, 40)} as="li" delay={0.04 + i * 0.04} className="type-body relative pl-6">
          <span aria-hidden="true" className="absolute left-0 top-[0.55em] block h-1.5 w-1.5 bg-red" />
          {item}
        </Reveal>
      ))}
    </ul>
  );
}

/**
 * Vraag en antwoord. Details/summary in plaats van JavaScript: open te
 * klikken, werkt zonder scripts en is doorzoekbaar in de pagina.
 */
export function Faq({ items, tone = 'light' }: { items: { q: string; a: string }[]; tone?: 'light' | 'dark' }) {
  const rand = tone === 'dark' ? 'border-white/12' : 'border-black/15';
  const kop = tone === 'dark' ? 'text-bone' : 'text-hull';
  const tekst = tone === 'dark' ? 'text-mill' : 'text-deck';

  return (
    <div className={`mt-12 border-t ${rand}`}>
      {items.map((item, i) => (
        <Reveal key={item.q} delay={0.05 + i * 0.04}>
          <details className={`group border-b ${rand}`}>
            <summary
              className={`flex cursor-pointer list-none items-start justify-between gap-6 py-6 font-[family-name:var(--font-display)] text-[1.0625rem] font-bold uppercase leading-[1.25] tracking-[-0.02em] ${kop} lg:text-[1.25rem]`}
            >
              {item.q}
              <span
                aria-hidden="true"
                className="relative mt-1 block h-4 w-4 shrink-0 transition-transform duration-300 group-open:rotate-45"
              >
                <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-red" />
                <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-red" />
              </span>
            </summary>
            <p className={`type-body max-w-2xl pb-7 ${tekst}`}>{item.a}</p>
          </details>
        </Reveal>
      ))}
    </div>
  );
}

/** Verwijzing naar een volgende pagina — dragen de interne linkstructuur. */
export function NextLinks({
  items,
  tone = 'light',
}: {
  items: { label: string; description: string; href: string }[];
  tone?: 'light' | 'dark';
}) {
  const rand = tone === 'dark' ? 'border-white/12' : 'border-black/15';
  const kop = tone === 'dark' ? 'text-bone' : 'text-hull';
  const tekst = tone === 'dark' ? 'text-mill' : 'text-deck';

  return (
    <ul className={`mt-12 grid gap-px border-t ${rand} sm:grid-cols-2 lg:mt-16`}>
      {items.map((item, i) => (
        <Reveal key={item.href} as="li" delay={0.06 + i * 0.06}>
          <a href={item.href} className={`group flex h-full flex-col border-b ${rand} py-7 pr-6 transition-colors sm:pr-10`}>
            <span className="flex items-center gap-3">
              <span
                className={`font-[family-name:var(--font-display)] text-[1.125rem] font-bold uppercase tracking-[-0.02em] ${kop} transition-colors group-hover:text-red lg:text-[1.375rem]`}
              >
                {item.label}
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 12"
                className="h-2.5 w-3.5 shrink-0 text-red transition-transform duration-300 ease-[var(--ease-out-a)] group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M0 6h14M9.5 1.5 14.5 6l-5 4.5" />
              </svg>
            </span>
            <span className={`type-body mt-2 ${tekst}`}>{item.description}</span>
          </a>
        </Reveal>
      ))}
    </ul>
  );
}
