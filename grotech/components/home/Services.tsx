import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '../Icon';
import { ButtonLink } from '../Button';
import { services } from '@/lib/content/nl/services';
import { href, serviceHref, quoteHref } from '@/lib/i18n/routes';

export function Services() {
  return (
    <section className="theme-light py-20 md:py-28" aria-labelledby="services-title">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl" data-reveal>
            <p className="eyebrow">Diensten</p>
            <h2 id="services-title" className="mt-5 text-[length:var(--text-h2)]">Gespecialiseerd in aluminium.</h2>
          </div>
          <p className="max-w-md text-mist" data-reveal>Snijwerk, zetwerk en laswerk uitsluitend in aluminium. CNC-frezen en -draaien in alle materialen. Combineer ze gerust in één aanvraag.</p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <li key={s.slug} data-reveal style={{ '--reveal-delay': i * 60 } as React.CSSProperties}>
              <Link href={serviceHref(s.slug)} className="group flex h-full flex-col overflow-hidden rounded-md border border-line bg-charcoal transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_18px_40px_-24px_rgba(9,11,14,0.45)]">
                <div className="relative aspect-[16/10] overflow-hidden bg-[#090b0e]">
                  <Image src={s.image.src} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="label-caps text-muted"><span className="text-red">{s.index}</span> / {s.label}</p>
                  <h3 className="mt-2 text-xl font-black">{s.name}</h3>
                  <p className="mt-2 text-[0.9375rem] text-mist">{s.tagline}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold tracking-[0.1em] uppercase">
                    Meer info <Icon name="arrow-right" size={16} className="text-red transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
          <li data-reveal style={{ '--reveal-delay': 300 } as React.CSSProperties}>
            <div className="flex h-full flex-col justify-between gap-8 rounded-md bg-[#090b0e] p-7 text-[#f6f7f8]">
              <div>
                <Icon name="layers" size={34} strokeWidth={1.4} className="text-red" />
                <h3 className="mt-6 text-2xl font-black">Complete samenstelling?</h3>
                <p className="mt-3 text-[0.9375rem] text-[#b4bac2]">Aluminium snijden, zetten, frezen en lassen tot één onderdeel. Eén aanvraag, één offerte, één levering.</p>
              </div>
              <div>
                <Link href={quoteHref()} className="inline-flex min-h-12 items-center justify-between gap-4 rounded-[3px] bg-[#f6f7f8] pr-2 pl-5 text-[0.8125rem] font-bold tracking-[0.12em] text-[#090b0e] uppercase transition-colors hover:bg-white">
                  Offerte aanvragen
                  <span className="grid size-9 place-items-center rounded-[2px] bg-red text-[#090b0e]"><Icon name="upload" size={18} strokeWidth={2} /></span>
                </Link>
              </div>
            </div>
          </li>
        </ul>
        <div className="mt-10" data-reveal>
          <ButtonLink href={href('services')} variant="secondary">Alle diensten en specificaties</ButtonLink>
        </div>
      </div>
    </section>
  );
}
