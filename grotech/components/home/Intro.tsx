import { Icon, type IconName } from '../Icon';
import { ArrowLink } from '../Button';
import { href } from '@/lib/i18n/routes';
import { benefits } from '@/lib/content/nl/process';

export function Intro() {
  return (
    <section className="relative border-t border-line py-24 md:py-36" aria-labelledby="intro-title">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4" data-reveal>
            <p className="label-caps flex items-center gap-3 text-mist">
              <span className="text-[0.8125rem] font-black tracking-normal text-red">01</span>
              <span className="h-px w-6 bg-line-strong" aria-hidden="true" />
              Wat GROTECH is
            </p>
          </div>
          <div className="lg:col-span-8">
            <h2 id="intro-title" className="text-[clamp(1.5rem,1.05rem+1.8vw,2.75rem)] leading-[1.14] font-black tracking-[-0.025em] text-offwhite" data-reveal>
              Een onafhankelijke B2B-partner voor de inkoop en realisatie van technische maatwerkonderdelen.{' '}
              <span className="text-muted">Technische kennis en persoonlijk contact in Nederland, gecombineerd met internationale productiecapaciteit.</span>
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-2" data-reveal style={{ '--reveal-delay': 120 } as React.CSSProperties}>
              <p className="text-mist">
                GROTECH produceert via zorgvuldig geselecteerde nationale en internationale productiepartners. Bepaalde werkzaamheden voeren we in eigen beheer uit. Zo krijg je de juiste techniek voor elk onderdeel, tegen een concurrerende prijs.
              </p>
              <p className="text-mist">
                Wij beoordelen je tekening, organiseren de productie, bewaken de kwaliteit en communiceren helder over planning en uitvoering. Niet goedkoop. Wel slim.
                <span className="mt-6 block">
                  <ArrowLink href={href('about')}>Over ons productiepartnermodel</ArrowLink>
                </span>
              </p>
            </div>
          </div>
        </div>

        <ul className="mt-20 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-5 md:mt-28">
          {benefits.map((b, i) => (
            <li key={b.title} className="group relative bg-black p-7 transition-colors duration-500 hover:bg-charcoal" data-reveal style={{ '--reveal-delay': i * 70 } as React.CSSProperties}>
              <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-red transition-transform duration-700 ease-[var(--ease-precise)] group-hover:scale-x-100" aria-hidden="true" />
              <Icon name={b.icon as IconName} size={34} strokeWidth={1.4} className="text-red" />
              <h3 className="mt-8 text-lg font-black tracking-tight text-offwhite">{b.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{b.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
