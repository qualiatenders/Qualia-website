import Link from 'next/link';
import { ButtonLink } from '@/components/Button';
import { href, serviceHref } from '@/lib/i18n/routes';
import { services } from '@/lib/content/nl/services';

export default function NotFound() {
  return (
    <main className="relative flex min-h-[80svh] items-center overflow-hidden pt-[var(--header-h)]">
      <div className="tech-grid absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse,black,transparent_70%)]" aria-hidden="true" />
      <div className="container-x py-24">
        <p className="font-mono text-sm text-red">ERROR 404 · BUITEN TOLERANTIE</p>
        <h1 className="mt-6 text-[length:var(--text-h1)] text-offwhite">Deze pagina bestaat niet<span className="text-red">.</span></h1>
        <p className="mt-6 max-w-xl text-[length:var(--text-lead)] text-mist">De link is mogelijk verouderd of verkeerd overgenomen. Kies hieronder waar je verder wilt.</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={href('home')} size="lg">Naar de homepage</ButtonLink>
          <ButtonLink href={href('quote')} size="lg" variant="secondary" icon="upload">Offerte aanvragen</ButtonLink>
        </div>
        <ul className="mt-14 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {services.map((s) => (
            <li key={s.slug}><Link href={serviceHref(s.slug)} className="text-muted hover:text-offwhite">{s.name}</Link></li>
          ))}
        </ul>
      </div>
    </main>
  );
}
