'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Icon } from '../Icon';
import { ButtonLink } from '../Button';
import { href, quoteHref } from '@/lib/i18n/routes';
import { setPendingFiles } from '@/lib/quote/draft-files';
import { acceptAttribute, uploadLimits } from '@/lib/quote/options';

export function ClosingCta() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const handoff = (list: FileList | null) => {
    if (!list || !list.length) return;
    setPendingFiles(Array.from(list));
    router.push(`${quoteHref()}?bestanden=1`);
  };

  return (
    <section className="relative overflow-hidden border-t border-line py-24 md:py-36" aria-labelledby="cta-title">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_85%_100%,rgba(241,10,29,0.16),transparent_60%)]" aria-hidden="true" />
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6" data-reveal>
          <p className="eyebrow">Offerte aanvragen</p>
          <h2 id="cta-title" className="mt-6 text-[length:var(--text-h1)] text-offwhite">
            Upload je tekening<span className="text-red">.</span>
            <br />
            <span className="text-mist">Wij doen de rest.</span>
          </h2>
          <p className="mt-6 max-w-lg text-[length:var(--text-lead)] leading-relaxed text-mist">
            Stuur je STEP-, DXF- of PDF-bestanden met aantallen en materiaal. Elke aanvraag wordt technisch beoordeeld en handmatig geoffreerd.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href={quoteHref()} size="lg" icon="upload">
              Upload je tekening — vraag een offerte aan
            </ButtonLink>
          </div>
          <div className="mt-5">
            <ButtonLink href={href('services')} variant="ghost" className="!min-h-10">
              Bekijk onze productietechnieken
            </ButtonLink>
          </div>
        </div>

        <div className="lg:col-span-6" data-reveal style={{ '--reveal-delay': 140 } as React.CSSProperties}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              handoff(e.dataTransfer.files);
            }}
            className={`relative flex min-h-[22rem] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center transition-all duration-500 ${
              over ? 'scale-[1.01] border-red bg-red/[0.06]' : 'border-line-strong bg-charcoal/50'
            }`}
          >
            {['top-3 left-3 border-t border-l', 'top-3 right-3 border-t border-r', 'bottom-3 left-3 border-b border-l', 'bottom-3 right-3 border-b border-r'].map((c) => (
              <span key={c} className={`absolute size-5 border-red ${c}`} aria-hidden="true" />
            ))}
            <span className={`grid size-16 place-items-center rounded-full border transition-colors duration-500 ${over ? 'border-red bg-red text-black' : 'border-line-strong text-red'}`}>
              <Icon name="upload" size={26} strokeWidth={1.8} />
            </span>
            <p className="mt-6 text-xl font-black text-offwhite">Sleep je tekeningen hierheen</p>
            <p className="mt-2 text-[0.9375rem] text-muted">STEP, STP, IGES, DXF, DWG, PDF, ZIP · max. {uploadLimits.maxFiles} bestanden</p>
            <button type="button" onClick={() => input.current?.click()} className="mt-6 rounded-[3px] border border-line-strong px-5 py-3 text-[0.8125rem] font-bold tracking-[0.12em] text-offwhite uppercase transition-colors hover:border-offwhite/60">
              Of kies bestanden
            </button>
            <input ref={input} type="file" multiple accept={acceptAttribute} className="sr-only" tabIndex={-1} aria-label="Tekeningen kiezen" onChange={(e) => handoff(e.target.files)} />
            <p className="mt-6 flex items-center gap-2 text-[0.8125rem] text-muted">
              <Icon name="lock" size={15} className="text-red" /> Vertrouwelijk behandeld. Er wordt pas iets verzonden als jij de aanvraag verstuurt.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
