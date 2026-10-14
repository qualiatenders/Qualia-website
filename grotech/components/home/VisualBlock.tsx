import Image from 'next/image';

/** Groot fotografisch blok — compositie naar brandbook p. 11 ("Materiaal is de hoofdrolspeler"). */
export function VisualBlock() {
  return (
    <section className="relative border-t border-line bg-black py-6 md:py-8" aria-labelledby="visual-title">
      <div className="container-x">
        <div className="grid gap-3 md:grid-cols-12 md:gap-4">
          <figure className="group relative overflow-hidden rounded-md md:col-span-8 md:row-span-2" data-reveal="fade">
            <div className="relative aspect-[4/5] sm:aspect-[16/11] md:aspect-auto md:h-full md:min-h-[38rem]">
              <Image src="/images/spindle.jpg" alt="Freesgereedschap in een aluminium werkstuk, met spanen en reflecterend metaal" fill sizes="(min-width: 768px) 66vw, 100vw" className="img-grade object-cover object-[50%_55%] transition-transform duration-[2.5s] ease-[var(--ease-precise)] group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 p-6 md:p-10">
              <h2 id="visual-title" className="max-w-xl text-[length:var(--text-h2)] text-offwhite">
                Materiaal is de hoofdrolspeler<span className="text-red">.</span>
              </h2>
              <p className="label-caps mt-5 text-mist">
                Staal <span className="text-red">/</span> Aluminium <span className="text-red">/</span> CNC-proces <span className="text-red">/</span> Exacte afwerking
              </p>
            </figcaption>
          </figure>
          <figure className="group relative overflow-hidden rounded-md md:col-span-4" data-reveal="fade" style={{ '--reveal-delay': 120 } as React.CSSProperties}>
            <div className="relative aspect-[4/3] md:aspect-auto md:h-full md:min-h-[18.5rem]">
              <Image src="/images/part-housing.jpg" alt="Gefreesd metalen onderdeel met boringen en kamer" fill sizes="(min-width: 768px) 33vw, 100vw" className="img-grade object-cover transition-transform duration-[2.5s] ease-[var(--ease-precise)] group-hover:scale-[1.04]" />
            </div>
          </figure>
          <figure className="group relative overflow-hidden rounded-md md:col-span-4" data-reveal="fade" style={{ '--reveal-delay': 220 } as React.CSSProperties}>
            <div className="relative aspect-[4/3] md:aspect-auto md:h-full md:min-h-[18.5rem]">
              <Image src="/images/milling-chips.jpg" alt="Freesbewerking met spanen in close-up" fill sizes="(min-width: 768px) 33vw, 100vw" className="img-grade object-cover transition-transform duration-[2.5s] ease-[var(--ease-precise)] group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <p className="absolute right-5 bottom-5 left-5 text-[0.9375rem] leading-snug text-mist">
                Echte oppervlakte, strakke details, diepe schaduwen. <span className="text-offwhite">Precisie in elke stap.</span>
              </p>
            </div>
          </figure>
        </div>
        <p className="mt-4 text-right text-[0.75rem] text-muted">Beelden zijn illustratief en tonen geen specifieke productielocatie.</p>
      </div>
    </section>
  );
}
