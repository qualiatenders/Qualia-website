'use client';

import { useRef, useState } from 'react';
import { COMPANY } from '@/lib/site';

/**
 * Contactformulier.
 *
 * De site is een statische export: er draait geen server die een POST kan
 * afhandelen. Daarom twee routes:
 *
 *  1. Staat NEXT_PUBLIC_FORM_ENDPOINT ingesteld (Formspree, Basin,
 *     Web3Forms — elke dienst die een JSON-POST accepteert), dan gaat het
 *     bericht daarheen en komt de bezoeker op /bedankt/.
 *  2. Staat die niet ingesteld, dan opent het formulier de mailclient met
 *     alles al ingevuld. Minder mooi, maar het loopt nooit dood.
 *
 * Validatie gebeurt in de browser; de dienst achter het endpoint doet zijn
 * eigen controle. Er wordt niets naar de console geschreven.
 */

const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT;

const INTERESSES = ['Assault 500', 'Assault 500 Fish', 'Nog niet zeker', 'Anders'] as const;

type Velden = { naam: string; email: string; telefoon: string; interesse: string; bericht: string };
type Fouten = Partial<Record<keyof Velden, string>>;

const LEEG: Velden = { naam: '', email: '', telefoon: '', interesse: INTERESSES[0], bericht: '' };

function valideer(v: Velden): Fouten {
  const f: Fouten = {};
  if (!v.naam.trim()) f.naam = 'Vul je naam in.';
  if (!v.email.trim()) f.email = 'Vul je e-mailadres in.';
  // Bewust ruim: één @ met iets ervoor en een punt erachter. Strengere
  // patronen wijzen geldige adressen af.
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) f.email = 'Vul een geldig e-mailadres in.';
  if (v.telefoon.trim() && !/^[\d\s+()-]{6,}$/.test(v.telefoon.trim())) f.telefoon = 'Vul een geldig telefoonnummer in.';
  if (!v.bericht.trim()) f.bericht = 'Schrijf kort waar je vraag over gaat.';
  else if (v.bericht.trim().length < 10) f.bericht = 'Een paar woorden meer helpt ons je sneller te antwoorden.';
  return f;
}

const veldKlasse = (fout?: string) =>
  `w-full border bg-transparent px-4 py-3.5 type-body text-hull transition-colors placeholder:text-mill focus:outline-none focus-visible:border-red ${
    fout ? 'border-red' : 'border-black/25 hover:border-black/45'
  }`;

export function ContactForm() {
  const [waarden, setWaarden] = useState<Velden>(LEEG);
  const [fouten, setFouten] = useState<Fouten>({});
  const [status, setStatus] = useState<'idle' | 'bezig' | 'mislukt'>('idle');
  const honeypot = useRef<HTMLInputElement>(null);

  const zet = (veld: keyof Velden) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setWaarden((v) => ({ ...v, [veld]: e.target.value }));
    // Fout weghalen zodra iemand hem aan het herstellen is.
    setFouten((f) => (f[veld] ? { ...f, [veld]: undefined } : f));
  };

  async function verstuur(e: React.FormEvent) {
    e.preventDefault();
    // Verborgen veld: alleen een bot vult dit in.
    if (honeypot.current?.value) return;

    const nieuwe = valideer(waarden);
    setFouten(nieuwe);
    if (Object.keys(nieuwe).length) {
      // Na de volgende render staat aria-invalid pas in de DOM; daarvoor
      // zoeken levert niets op en springt de focus nergens heen.
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }

    if (!ENDPOINT) {
      const onderwerp = `Aanvraag ${waarden.interesse} — ${waarden.naam}`;
      const regels = [
        `Naam: ${waarden.naam}`,
        `E-mail: ${waarden.email}`,
        waarden.telefoon ? `Telefoon: ${waarden.telefoon}` : null,
        `Interesse: ${waarden.interesse}`,
        '',
        waarden.bericht,
      ].filter(Boolean);
      window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(onderwerp)}&body=${encodeURIComponent(
        regels.join('\n'),
      )}`;
      return;
    }

    setStatus('bezig');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(waarden),
      });
      if (!res.ok) throw new Error(String(res.status));
      window.location.href = '/bedankt/';
    } catch {
      setStatus('mislukt');
    }
  }

  const bezig = status === 'bezig';

  return (
    <form onSubmit={verstuur} noValidate className="mt-10 max-w-2xl">
      {/* Honeypot: buiten beeld en buiten de tabvolgorde, niet display:none —
          sommige bots slaan verborgen velden juist over. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor="bedrijfsnaam">Laat dit veld leeg</label>
        <input ref={honeypot} id="bedrijfsnaam" name="bedrijfsnaam" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Veld id="naam" label="Naam" fout={fouten.naam}>
          <input
            id="naam"
            name="naam"
            type="text"
            autoComplete="name"
            required
            value={waarden.naam}
            onChange={zet('naam')}
            aria-invalid={Boolean(fouten.naam)}
            aria-describedby={fouten.naam ? 'naam-fout' : undefined}
            className={veldKlasse(fouten.naam)}
          />
        </Veld>

        <Veld id="email" label="E-mail" fout={fouten.email}>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={waarden.email}
            onChange={zet('email')}
            aria-invalid={Boolean(fouten.email)}
            aria-describedby={fouten.email ? 'email-fout' : undefined}
            className={veldKlasse(fouten.email)}
          />
        </Veld>

        <Veld id="telefoon" label="Telefoon" optioneel fout={fouten.telefoon}>
          <input
            id="telefoon"
            name="telefoon"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={waarden.telefoon}
            onChange={zet('telefoon')}
            aria-invalid={Boolean(fouten.telefoon)}
            aria-describedby={fouten.telefoon ? 'telefoon-fout' : undefined}
            className={veldKlasse(fouten.telefoon)}
          />
        </Veld>

        <Veld id="interesse" label="Interesse">
          <select
            id="interesse"
            name="interesse"
            value={waarden.interesse}
            onChange={zet('interesse')}
            className={`${veldKlasse()} appearance-none bg-[length:0.7rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath fill='none' stroke='%234a4a4a' stroke-width='1.5' d='M1 1.5 6 6.5 11 1.5'/%3E%3C/svg%3E\")",
            }}
          >
            {INTERESSES.map((optie) => (
              <option key={optie} value={optie}>
                {optie}
              </option>
            ))}
          </select>
        </Veld>
      </div>

      <div className="mt-6">
        <Veld id="bericht" label="Bericht" fout={fouten.bericht}>
          <textarea
            id="bericht"
            name="bericht"
            rows={5}
            required
            value={waarden.bericht}
            onChange={zet('bericht')}
            aria-invalid={Boolean(fouten.bericht)}
            aria-describedby={fouten.bericht ? 'bericht-fout' : undefined}
            className={`${veldKlasse(fouten.bericht)} resize-y`}
          />
        </Veld>
      </div>

      {status === 'mislukt' ? (
        <p role="alert" className="type-body mt-6 border-l-2 border-red pl-4 text-hull">
          Het versturen lukte niet. Probeer het zo nog eens, of bel ons even op{' '}
          <a href={`tel:${COMPANY.phoneE164}`} className="underline decoration-red underline-offset-4">
            {COMPANY.phoneDisplay}
          </a>
          .
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={bezig}
          data-track="contact_verstuurd"
          className="cut-tag inline-flex items-center gap-3 bg-red px-7 py-4 type-label text-white transition-colors duration-300 hover:bg-red-hot disabled:cursor-not-allowed disabled:opacity-60"
        >
          {bezig ? (
            <>
              <span
                aria-hidden="true"
                className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white"
              />
              Versturen…
            </>
          ) : (
            <>
              Verstuur bericht
              <svg viewBox="0 0 16 12" className="h-2.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M0 6h14M9.5 1.5 14.5 6l-5 4.5" />
              </svg>
            </>
          )}
        </button>
        <p className="type-label max-w-xs leading-[1.7] text-mill">
          We gebruiken je gegevens alleen om te reageren.{' '}
          <a href="/privacy/" className="underline underline-offset-4 hover:text-deck">
            Privacy
          </a>
        </p>
      </div>
    </form>
  );
}

function Veld({
  id,
  label,
  children,
  fout,
  optioneel = false,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  fout?: string;
  optioneel?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 type-label text-deck">
        {label}
        {optioneel ? <span className="text-mill">Optioneel</span> : null}
      </label>
      <div className="mt-2.5">{children}</div>
      {fout ? (
        <p id={`${id}-fout`} role="alert" className="type-label mt-2 text-red">
          {fout}
        </p>
      ) : null}
    </div>
  );
}
