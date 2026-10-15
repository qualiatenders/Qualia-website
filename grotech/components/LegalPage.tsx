import type { ReactNode } from 'react';
import { Breadcrumbs } from './PageHero';
import { site, hasAddress } from '@/lib/site';
import { href } from '@/lib/i18n/routes';
import Link from 'next/link';

export const LEGAL_UPDATED = '14 oktober 2026';

export function LegalPage({ title, path, intro, children }: { title: string; path: string; intro: ReactNode; children: ReactNode }) {
  return (
    <article>
      <header className="border-b border-line pt-[calc(var(--header-h)+2rem)] pb-10">
        <div className="container-x">
          <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: title, path }]} />
          <p className="eyebrow mt-8">Juridisch</p>
          <h1 className="mt-5 text-[length:var(--text-h2)] text-offwhite">{title}</h1>
          <p className="mt-4 text-sm text-muted">Laatst bijgewerkt: {LEGAL_UPDATED}</p>
        </div>
      </header>
      <div className="theme-light py-14 md:py-20">
        <div className="container-x">
          <div className="prose-grotech">
            <p className="text-[length:var(--text-lead)] text-mist">{intro}</p>
            {children}
          </div>
        </div>
      </div>
    </article>
  );
}

/** Bedrijfsgegevens zoals ingesteld; ontbrekende gegevens worden niet verzonnen. */
export function CompanyBlock() {
  return (
    <p>
      <strong>{site.legalName}</strong>
      {hasAddress() && (
        <>
          <br />
          {site.address.street}, {site.address.postalCode} {site.address.city}
        </>
      )}
      {site.kvk && <><br />KvK-nummer: {site.kvk}</>}
      {site.email && <><br />E-mail: <a href={`mailto:${site.email}`}>{site.email}</a></>}
      {site.phone && <><br />Telefoon: {site.phone}</>}
      {!site.email && !site.phone && (
        <>
          <br />
          Bereikbaar via de <Link href={href('contact')}>contactpagina</Link>.
        </>
      )}
    </p>
  );
}
