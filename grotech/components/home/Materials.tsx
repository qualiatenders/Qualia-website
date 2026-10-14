import Link from 'next/link';
import { SectionHeader } from '../Section';
import { ArrowLink } from '../Button';
import { materials } from '@/lib/content/nl/materials';
import { href } from '@/lib/i18n/routes';

export function Materials() {
  return (
    <section className="relative border-t border-line bg-charcoal/40 py-24 md:py-36" aria-labelledby="materials-title">
      <div className="container-x">
        <SectionHeader
          index="04"
          eyebrow="Materialen"
          title={<span id="materials-title">Van aluminium tot technische kunststof.</span>}
          intro="We werken met de gangbare technische metalen en kunststoffen. Specifieke kwaliteiten en bewerkingsmogelijkheden bevestigen we altijd per aanvraag."
        />
        <ul className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-3 lg:grid-cols-6">
          {materials.map((m, i) => (
            <li key={m.id} className="bg-black" data-reveal="fade" style={{ '--reveal-delay': i * 60 } as React.CSSProperties}>
              <Link href={`${href('materials')}#${m.id}`} className="group relative flex h-full min-h-[13rem] flex-col p-5 transition-colors duration-500 hover:bg-graphite md:min-h-[15rem] md:p-6">
                <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>
                <span className="mt-6 text-[2.75rem] leading-none font-black tracking-tight text-offwhite transition-colors duration-500 group-hover:text-red md:text-5xl">
                  {m.symbol.split(' ')[0]}
                </span>
                <span className="mt-8">
                  <span className="block font-bold text-offwhite">{m.name}</span>
                  <span className="mt-1.5 block text-[0.8125rem] leading-snug text-muted">{m.applications.slice(0, 2).join(' · ')}</span>
                </span>
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-red transition-transform duration-500 ease-[var(--ease-precise)] group-hover:scale-x-100" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ArrowLink href={href('materials')}>Bekijk het materiaaloverzicht</ArrowLink>
        </div>
      </div>
    </section>
  );
}
