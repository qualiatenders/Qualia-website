'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Icon } from '../Icon';
import { ButtonLink } from '../Button';
import { SectionHeader } from '../Section';
import { services } from '@/lib/content/nl/services';
import { href, serviceHref, quoteHref } from '@/lib/i18n/routes';

export function ServicesExplorer() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const s = services[active]!;

  return (
    <section className="relative border-t border-line bg-charcoal/40 py-24 md:py-36" aria-labelledby="services-title">
      <div className="container-x">
        <SectionHeader
          index="02"
          eyebrow="Productietechnieken"
          title={<span id="services-title">Vijf technieken. Eén aanspreekpunt.</span>}
          intro="Kies één techniek of combineer ze in één aanvraag. Wij stemmen de productie af en leveren het geheel, van losse onderdelen tot complete samenstellingen."
        />

        {/* desktop: interactieve lijst + voorbeeldpaneel */}
        <div className="mt-16 hidden gap-12 lg:grid lg:grid-cols-12">
          <ul className="lg:col-span-6">
            {services.map((svc, i) => {
              const on = i === active;
              return (
                <li key={svc.slug} className="border-b border-line first:border-t">
                  <Link
                    href={serviceHref(svc.slug)}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    aria-describedby={on ? 'service-preview' : undefined}
                    className="group relative flex items-center gap-6 py-6 pr-2 pl-6"
                  >
                    <span className={`absolute top-0 bottom-0 left-0 w-0.5 bg-red transition-transform duration-500 ease-[var(--ease-precise)] ${on ? 'scale-y-100' : 'scale-y-0'}`} aria-hidden="true" />
                    <span className={`w-8 text-sm font-black transition-colors ${on ? 'text-red' : 'text-muted'}`}>{svc.index}</span>
                    <span className={`flex-1 transition-transform duration-500 ease-[var(--ease-precise)] ${on ? 'translate-x-2' : ''}`}>
                      <span className={`block text-[clamp(1.5rem,1rem+1.2vw,2.125rem)] leading-tight font-black tracking-tight transition-colors duration-500 ${on ? 'text-offwhite' : 'text-mist group-hover:text-offwhite'}`}>{svc.name}</span>
                      <span className="label-caps mt-1.5 block text-[0.6875rem] text-muted">{svc.label}</span>
                    </span>
                    <Icon name="arrow-up-right" size={22} className={`transition-all duration-500 ${on ? 'text-red opacity-100' : 'text-muted opacity-0 group-hover:opacity-100'}`} />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="lg:col-span-6">
            <div id="service-preview" className="sticky top-[calc(var(--header-h)+2rem)] overflow-hidden rounded-md border border-line bg-black" aria-live="polite">
              <div className="relative aspect-[4/3]">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={s.slug}
                    className="absolute inset-0"
                    initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.7, ease: [0.2, 0.7, 0.1, 1] }}
                  >
                    <Image src={s.image.src} alt={s.image.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
                <span className="label-caps absolute top-5 left-5 text-[0.625rem] text-muted">Illustratieve render</span>
                <span className="absolute top-5 right-5 font-mono text-xs text-mist">
                  <span className="text-red">{s.index}</span> / 05
                </span>
              </div>
              <div className="p-8">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div key={s.slug} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
                    <p className="text-lg font-bold text-offwhite">{s.tagline}</p>
                    <ul className="mt-5 space-y-2.5">
                      {s.highlights.map((h) => (
                        <li key={h} className="flex gap-3 text-[0.9375rem] text-mist">
                          <Icon name="check" size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-red" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <ButtonLink href={serviceHref(s.slug)} variant="secondary">
                        Bekijk {s.short}
                      </ButtonLink>
                      <ButtonLink href={quoteHref(s.slug)} icon="upload">
                        Offerte aanvragen
                      </ButtonLink>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* mobiel/tablet: kaarten met horizontale snap */}
        <ul className="-mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:hidden">
          {services.map((svc) => (
            <li key={svc.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%]">
              <Link href={serviceHref(svc.slug)} className="group block overflow-hidden rounded-md border border-line bg-black">
                <div className="relative aspect-[4/3]">
                  <Image src={svc.image.src} alt={svc.image.alt} fill sizes="(min-width: 640px) 46vw, 82vw" className="object-cover" />
                </div>
                <div className="p-5">
                  <p className="label-caps text-muted">
                    <span className="text-red">{svc.index}</span> / {svc.label}
                  </p>
                  <p className="mt-2 flex items-center justify-between text-xl font-black text-offwhite">
                    {svc.name}
                    <Icon name="arrow-right" size={20} className="text-red" />
                  </p>
                  <p className="mt-2 text-[0.9375rem] text-muted">{svc.tagline}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between lg:mt-16">
          <p className="text-mist">
            <span className="font-bold text-offwhite">Complete samenstelling nodig?</span> Combineer meerdere technieken in één aanvraag.
          </p>
          <ButtonLink href={href('services')} variant="secondary">
            Bekijk onze productietechnieken
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
