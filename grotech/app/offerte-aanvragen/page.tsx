import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Breadcrumbs } from '@/components/PageHero';
import { QuoteWizard } from '@/components/quote/QuoteWizard';
import { href } from '@/lib/i18n/routes';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Offerte aanvragen — upload je tekening',
  description: 'Vraag een offerte aan voor CNC-frezen, CNC-draaien, snijwerk, zetwerk, laswerk of een complete samenstelling. Upload je STEP-, DXF- of PDF-tekening veilig.',
  path: href('quote'),
});

export default function QuotePage() {
  return (
    <>
    <section className="relative border-b border-line pt-[calc(var(--header-h)+2rem)] pb-10 md:pb-12">
      <div className="container-x">
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Offerte aanvragen', path: href('quote') }]} />
        <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow">Offerte aanvragen</p>
            <h1 className="mt-5 text-[length:var(--text-h1)] text-offwhite">
              Upload je tekening<span className="text-red">.</span>
            </h1>
          </div>
          <p className="text-mist lg:col-span-4">
            In vijf korte stappen naar een complete aanvraag. Geen automatische prijs: we beoordelen je aanvraag technisch en sturen een heldere offerte.
          </p>
        </div>
      </div>
    </section>
    <section className="theme-light bg-tint pt-10 pb-20 md:pt-14 md:pb-28">
      <div className="container-x">
        <Suspense fallback={<div className="h-[40rem] animate-pulse rounded-md border border-line bg-charcoal/40" />}>
          <QuoteWizard />
        </Suspense>
      </div>
    </section>
    </>
  );
}
