import Image from 'next/image';
import { ButtonLink } from '../Button';
import { href, quoteHref } from '@/lib/i18n/routes';

const usps = [
  ['01', 'Eén aanspreekpunt'],
  ['02', 'Productie volgens tekening'],
  ['03', 'Nationaal & internationaal netwerk'],
  ['04', 'Persoonlijk, in het Nederlands'],
];

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[max(38rem,92svh)] flex-col overflow-hidden bg-black" aria-labelledby="hero-title">
      {/* fotografie */}
      <div className="absolute inset-0 -z-10 md:left-[38%]">
        <Image
          src="/images/spindle.jpg"
          alt="Close-up van een CNC-freesspindel die een aluminium werkstuk bewerkt"
          fill
          priority
          sizes="(min-width: 768px) 62vw, 100vw"
          quality={60}
          className="img-grade object-cover object-[50%_40%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/0 md:via-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/40" />
        <div className="absolute inset-0 bg-black/45 md:hidden" />
      </div>
      <div className="tech-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,black,transparent_60%)] opacity-70" aria-hidden="true" />

      <div className="container-x relative flex flex-1 flex-col justify-center pt-[calc(var(--header-h)+3rem)] pb-14">
        <div className="max-w-[46rem]">
          <p className="eyebrow" data-reveal>
            Precision Manufacturing — Nederland
          </p>
          <h1 id="hero-title" className="mt-7 text-[length:var(--text-display)] leading-[0.92] font-black tracking-[-0.035em] text-offwhite uppercase" data-reveal style={{ '--reveal-delay': 80 } as React.CSSProperties}>
            Precision
            <br />
            without
            <br />
            compromise<span className="text-red">.</span>
          </h1>
          <p className="mt-8 max-w-[36rem] text-[length:var(--text-lead)] leading-relaxed text-mist" data-reveal style={{ '--reveal-delay': 180 } as React.CSSProperties}>
            Van CNC-precisieonderdelen tot complete metalen samenstellingen. Technische expertise, internationale productiemogelijkheden en één betrouwbaar aanspreekpunt.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap" data-reveal style={{ '--reveal-delay': 260 } as React.CSSProperties}>
            <ButtonLink href={quoteHref()} size="lg" icon="upload">
              Vraag een offerte aan
            </ButtonLink>
            <ButtonLink href={href('services')} size="lg" variant="secondary">
              Ontdek onze mogelijkheden
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="relative border-t border-line bg-black/40 backdrop-blur-sm">
        <ul className="container-x grid grid-cols-2 lg:grid-cols-4">
          {usps.map(([i, t], n) => (
            <li key={i} className={`flex items-center gap-3 py-5 text-[0.8125rem] font-bold text-offwhite sm:text-sm ${n % 2 ? 'pl-4 sm:pl-6' : ''} ${n > 0 ? 'lg:border-l lg:border-line lg:pl-6' : ''} ${n < 2 ? 'border-b border-line lg:border-b-0' : ''}`}>
              <span className="text-[0.75rem] font-black text-red">{i}</span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
