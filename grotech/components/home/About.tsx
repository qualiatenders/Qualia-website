import Image from 'next/image';
import { Icon, type IconName } from '../Icon';
import { materials } from '@/lib/content/nl/materials';

const points: { icon: IconName; title: string; text: string }[] = [
  { icon: 'target', title: 'Technische kennis in Nederland', text: 'We beoordelen je tekening, stellen de juiste vragen en zijn je vaste aanspreekpunt.' },
  { icon: 'globe', title: 'Geselecteerde productiepartners', text: 'Productie bij nationale en internationale partners; bepaalde werkzaamheden in eigen beheer.' },
  { icon: 'shield', title: 'Kwaliteit volgens afspraak', text: 'Specificaties vooraf vastgelegd, bij series eerst een proefexemplaar, controle na productie.' },
];

/** Donkere band: wie GROTECH is, het partnermodel en de materialen. */
export function About() {
  return (
    <section id="over-grotech" className="scroll-mt-20 overflow-hidden py-20 md:py-28" aria-labelledby="about-title">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md lg:col-span-5 lg:aspect-[4/5]" data-reveal="fade">
          <Image src="/images/spindle.jpg" alt="Freesgereedschap in een aluminium werkstuk" fill sizes="(min-width: 1024px) 40vw, 100vw" className="img-grade object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <p className="absolute bottom-4 left-4 text-xs text-muted">Illustratief beeld</p>
        </div>
        <div className="lg:col-span-7 lg:pl-6">
          <p className="eyebrow" data-reveal>Over GROTECH</p>
          <h2 id="about-title" className="mt-5 text-[length:var(--text-h2)] text-offwhite" data-reveal>
            Niet goedkoop. <span className="text-mist">Wel slim.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-mist" data-reveal>
            GROTECH is een onafhankelijke B2B-partner voor technische maatwerkonderdelen. We zijn geen eigenaar van grote fabrieken, en zeggen dat ook eerlijk: onze kracht is de regie.
          </p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {points.map((p, i) => (
              <li key={p.title} data-reveal style={{ '--reveal-delay': i * 80 } as React.CSSProperties}>
                <Icon name={p.icon} size={30} strokeWidth={1.4} className="text-red" />
                <h3 className="mt-4 font-black text-offwhite">{p.title}</h3>
                <p className="mt-2 text-[0.9375rem] text-muted">{p.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 border-t border-line pt-8" data-reveal>
            <p className="label-caps text-muted">Materialen</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {materials.map((m) => (
                <li key={m.id} className="rounded-full border border-line-strong px-4 py-1.5 text-sm font-bold text-offwhite">{m.name}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">Specifieke kwaliteiten en bewerkingen bevestigen we per aanvraag.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
