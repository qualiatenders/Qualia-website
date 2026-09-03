import { MOTORS, OPTIONS, euro, type Option } from '@/lib/content';
import { Reveal } from './Reveal';

/** Beschikbaar of niet — één vinkje, één streep, verder niets. */
function Compat({ ja, uitvoering }: { ja: boolean; uitvoering: string }) {
  return (
    <div className="flex items-center justify-center pt-1">
      {ja ? (
        <svg viewBox="0 0 14 11" className="h-3 w-4 text-hull" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M1 5.6 5.2 9.8 13 1.4" />
        </svg>
      ) : (
        <span aria-hidden="true" className="block h-px w-3.5 bg-mill" />
      )}
      <span className="sr-only">{ja ? `Leverbaar op de ${uitvoering}` : `Niet leverbaar op de ${uitvoering}`}</span>
    </div>
  );
}

/**
 * Optielijst met twee compatibiliteitskolommen.
 *
 * Zelfde opzet als pagina 2 van de prijslijst, zodat wie de PDF gezien heeft
 * hier niets nieuws hoeft te leren. Met `variant` toont de tabel maar één
 * uitvoering — handig op een productpagina waar de andere niet ter zake doet.
 */
export function OptionsTable({ variant }: { variant?: 'open' | 'fish' }) {
  const rijen: Option[] = variant ? OPTIONS.filter((o) => (variant === 'open' ? o.open : o.fish)) : OPTIONS;
  const kolommen = variant ? 'grid-cols-[1fr_5.5rem]' : 'grid-cols-[1fr_3rem_3rem_5.5rem] sm:grid-cols-[1fr_4rem_4rem_7rem]';

  return (
    <div className="mt-10 lg:mt-14">
      <div className={`grid ${kolommen} gap-x-4 border-b border-black/15 pb-3`}>
        <span className="type-label text-deck">Optie</span>
        {!variant ? (
          <>
            <span className="type-label text-center text-deck">Open</span>
            <span className="type-label text-center text-deck">Fish</span>
          </>
        ) : null}
        <span className="type-label text-right text-deck">Prijs</span>
      </div>

      {rijen.map((optie, i) => (
        <Reveal key={optie.name} delay={0.04 + Math.min(i, 6) * 0.04}>
          <div className={`grid ${kolommen} gap-x-4 border-b border-black/15 py-5`}>
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-[1rem] font-bold uppercase leading-[1.15] tracking-[-0.02em] text-hull lg:text-[1.125rem]">
                {optie.name}
              </h3>
              <p className="type-body mt-1.5 max-w-xl text-deck">{optie.description}</p>
            </div>
            {!variant ? (
              <>
                <Compat ja={optie.open} uitvoering="Assault 500 Open" />
                <Compat ja={optie.fish} uitvoering="Assault 500 Fish" />
              </>
            ) : null}
            <div className="pt-0.5 text-right">
              <span className="type-label block text-mill">EUR</span>
              <span className="mt-1.5 block font-[family-name:var(--font-display)] text-[1.25rem] font-bold leading-none tracking-[-0.03em] text-hull [font-variant-numeric:tabular-nums] lg:text-[1.5rem]">
                {euro(optie.price)}
              </span>
            </div>
          </div>
        </Reveal>
      ))}

      <p className="type-label mt-6 leading-[1.7] text-mill">
        Consumentenprijzen inclusief 21% btw. Buitenboordmotor, trailer en accu zijn niet inbegrepen.
      </p>
    </div>
  );
}

/** De vier vermogens die geleverd worden, met de meerprijs van de stuurhendel. */
export function MotorTable() {
  return (
    <div className="mt-10 lg:mt-14">
      <div className="grid grid-cols-[1fr_5rem_5rem] gap-x-4 border-b border-black/15 pb-3 sm:grid-cols-[1fr_7rem_7rem]">
        <span className="type-label text-deck">Motor</span>
        <span className="type-label text-right text-deck">Prijs</span>
        <span className="type-label text-right text-deck">Stuurhendel</span>
      </div>

      {MOTORS.map((motor, i) => (
        <Reveal key={motor.model} delay={0.05 + i * 0.05}>
          <div className="grid grid-cols-[1fr_5rem_5rem] gap-x-4 border-b border-black/15 py-5 sm:grid-cols-[1fr_7rem_7rem]">
            <div>
              <span className="font-[family-name:var(--font-display)] text-[1.125rem] font-extrabold leading-none tracking-[-0.03em] text-red">
                {motor.pk}
                <span className="ml-1.5 type-label font-medium">PK</span>
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-[1rem] font-bold uppercase leading-[1.15] tracking-[-0.02em] text-hull lg:text-[1.125rem]">
                {motor.model}
              </h3>
              <p className="type-body mt-1 text-deck">{motor.spec}</p>
            </div>
            <div className="pt-1 text-right font-[family-name:var(--font-display)] text-[1.125rem] font-bold leading-none tracking-[-0.03em] text-hull [font-variant-numeric:tabular-nums] lg:text-[1.25rem]">
              {euro(motor.price)}
            </div>
            <div
              className={`pt-1 text-right [font-variant-numeric:tabular-nums] ${
                motor.tiller === 'Standaard'
                  ? 'type-label pt-2 text-mill'
                  : 'font-[family-name:var(--font-display)] text-[1.125rem] font-bold leading-none tracking-[-0.03em] text-deck lg:text-[1.25rem]'
              }`}
            >
              {motor.tiller}
            </div>
          </div>
        </Reveal>
      ))}

      <p className="type-label mt-6 max-w-3xl leading-[1.7] text-mill">
        Adviesprijzen Honda Marine 2026, inclusief 21% btw. Alle motoren in langstaartuitvoering. Bij de BF20 zit de
        stuurhendel standaard op de motor; bij de andere is het een meerprijs. Levering en montage in overleg.
      </p>
    </div>
  );
}
