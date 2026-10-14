import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { JsonLd } from './JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';

export type Crumb = { name: string; path: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav aria-label="Kruimelpad">
        <ol className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-muted">
          {items.map((c, i) => (
            <li key={c.path} className="flex items-center gap-2">
              {i > 0 && <span className="text-line-strong" aria-hidden="true">/</span>}
              {i === items.length - 1 ? (
                <span aria-current="page" className="text-mist">{c.name}</span>
              ) : (
                <Link href={c.path} className="transition-colors hover:text-offwhite">{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}

export function PageHero({
  crumbs,
  eyebrow,
  title,
  lead,
  actions,
  image,
  imageNote = 'Illustratieve render',
  children,
}: {
  crumbs: Crumb[];
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  image?: { src: string; alt: string };
  imageNote?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line pt-[calc(var(--header-h)+2.5rem)] pb-16 md:pb-24">
      <div className="tech-grid absolute inset-0 -z-10 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true" />
      <div className="absolute top-0 right-0 -z-10 h-[34rem] w-[50rem] bg-[radial-gradient(closest-side,rgba(241,10,29,0.10),transparent)]" aria-hidden="true" />
      <div className="container-x">
        <Breadcrumbs items={crumbs} />
        <div className={`mt-10 grid gap-12 md:mt-14 ${image ? 'lg:grid-cols-12 lg:items-center' : ''}`}>
          <div className={image ? 'lg:col-span-6' : 'max-w-4xl'}>
            <p className="eyebrow" data-reveal>{eyebrow}</p>
            <h1 className="mt-6 text-[length:var(--text-h1)] text-offwhite" data-reveal style={{ '--reveal-delay': 60 } as React.CSSProperties}>
              {title}
            </h1>
            {lead && (
              <p className="mt-7 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-mist" data-reveal style={{ '--reveal-delay': 140 } as React.CSSProperties}>
                {lead}
              </p>
            )}
            {actions && (
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap" data-reveal style={{ '--reveal-delay': 220 } as React.CSSProperties}>
                {actions}
              </div>
            )}
            {children}
          </div>
          {image && (
            <div className="lg:col-span-6" data-reveal="fade" style={{ '--reveal-delay': 160 } as React.CSSProperties}>
              <figure className="relative overflow-hidden rounded-md border border-line bg-black">
                <div className="relative aspect-[4/3]">
                  <Image src={image.src} alt={image.alt} fill priority sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" />
                </div>
                <figcaption className="label-caps absolute top-4 left-4 text-[0.625rem] text-muted">{imageNote}</figcaption>
              </figure>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
