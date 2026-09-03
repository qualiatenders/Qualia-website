import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

type Crumb = { name: string; path: string };

/**
 * Kop van een onderliggende pagina.
 *
 * Zelfde opbouw als de secties op de homepage — mono-label, display-kop,
 * rode streep — maar zonder de volle-hoogte hero, zodat de inhoud meteen
 * begint. Hull Black, dus hij sluit aan op de vaste header erboven.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  aside,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: string;
  crumbs?: Crumb[];
  /** Optionele kolom rechts: beeld of cijfers. */
  aside?: ReactNode;
}) {
  return (
    <section className="border-b border-white/10 bg-hull pb-16 pt-28 text-bone lg:pb-24 lg:pt-44">
      <div className="shell">
        {crumbs?.length ? (
          <Reveal>
            <nav aria-label="Kruimelpad" className="mb-10 lg:mb-14">
              <ol className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {crumbs.map((crumb, i) => (
                  <li key={crumb.path} className="flex items-center gap-3">
                    {i > 0 ? (
                      <span aria-hidden="true" className="type-label text-deck">
                        /
                      </span>
                    ) : null}
                    {i === crumbs.length - 1 ? (
                      <span className="type-label text-mill" aria-current="page">
                        {crumb.name}
                      </span>
                    ) : (
                      <a href={crumb.path} className="-my-1.5 inline-block py-1.5 type-label text-deck transition-colors hover:text-bone">
                        {crumb.name}
                      </a>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </Reveal>
        ) : null}

        <div className={aside ? 'grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-16' : ''}>
          <div className={aside ? 'lg:col-span-7' : 'max-w-4xl'}>
            <Reveal>
              <span className="type-label text-mill">{eyebrow}</span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="type-h2 mt-6">{title}</h1>
              <span className="rule-red mt-7" aria-hidden="true" />
            </Reveal>
            {lead ? (
              <Reveal delay={0.14}>
                <p className="type-body mt-7 max-w-2xl text-mill">{lead}</p>
              </Reveal>
            ) : null}
          </div>
          {aside ? (
            <Reveal delay={0.18} className="lg:col-span-5">
              {aside}
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
