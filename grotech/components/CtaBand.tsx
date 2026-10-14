import { ButtonLink } from './Button';
import { href, quoteHref } from '@/lib/i18n/routes';

export function CtaBand({
  title = 'Klaar om te produceren?',
  text = 'Upload je tekening met aantallen en materiaal. We beoordelen je aanvraag technisch en sturen je een heldere offerte.',
  technique,
  secondary = { label: 'Bekijk onze productietechnieken', href: href('services') },
}: {
  title?: string;
  text?: string;
  technique?: string;
  secondary?: { label: string; href: string } | null;
}) {
  return (
    <section className="relative overflow-hidden border-t border-line py-20 md:py-28" aria-label="Offerte aanvragen">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(50%_90%_at_100%_100%,rgba(241,10,29,0.14),transparent_65%)]" aria-hidden="true" />
      <div className="container-x flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl" data-reveal>
          <p className="eyebrow">Offerte aanvragen</p>
          <h2 className="mt-5 text-[length:var(--text-h2)] text-offwhite">
            {title}
          </h2>
          <p className="mt-5 text-[length:var(--text-lead)] leading-relaxed text-mist">{text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row" data-reveal style={{ '--reveal-delay': 120 } as React.CSSProperties}>
          <ButtonLink href={quoteHref(technique)} size="lg" icon="upload">
            Upload je tekening
          </ButtonLink>
          {secondary && (
            <ButtonLink href={secondary.href} size="lg" variant="secondary">
              {secondary.label}
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}
