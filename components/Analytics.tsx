'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Meting en toestemming.
 *
 * Zonder NEXT_PUBLIC_GA_MEASUREMENT_ID gebeurt hier niets: geen script, geen
 * cookie, en dus ook geen cookiebanner. Dat is de stand vandaag — de site
 * zet zelf geen enkele cookie.
 *
 * Zodra dat ID er wel is, laadt Google Analytics pas *na* toestemming. De
 * banner is dus geen sierstuk: zonder "Accepteren" wordt er niets geladen en
 * niets opgeslagen. Weigeren is één klik, net zo groot als accepteren.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const OPSLAG = 'assault-consent';

type Keuze = 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function leesKeuze(): Keuze | null {
  try {
    const v = localStorage.getItem(OPSLAG);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    // Privémodus of geblokkeerde opslag: dan vragen we het gewoon opnieuw.
    return null;
  }
}

export function Analytics() {
  const [keuze, setKeuze] = useState<Keuze | null>(null);
  const [gevraagd, setGevraagd] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;
    const opgeslagen = leesKeuze();
    setKeuze(opgeslagen);
    setGevraagd(opgeslagen !== null);
  }, []);

  // Laadt het script pas als er toestemming is.
  useEffect(() => {
    if (!GA_ID || keuze !== 'granted') return;
    if (document.getElementById('ga-src')) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('consent', 'default', { analytics_storage: 'granted' });
    // Geen advertentiecookies: deze site adverteert niet.
    window.gtag('config', GA_ID, { anonymize_ip: true });

    const s = document.createElement('script');
    s.id = 'ga-src';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
  }, [keuze]);

  /*
    Eén gedelegeerde luisteraar in plaats van een handler per knop: zo hoeft
    geen enkel component iets van meting te weten, en kan er ook niets
    vergeten worden bij een nieuwe pagina.
  */
  useEffect(() => {
    if (!GA_ID) return;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.('a, button');
      if (!el) return;
      const href = el.getAttribute('href') ?? '';
      const eigen = el.getAttribute('data-track');

      let naam: string | null = null;
      if (eigen) naam = eigen;
      else if (href.endsWith('.pdf')) naam = 'prijslijst_openen';
      else if (href.startsWith('tel:')) naam = 'telefoon_klik';
      else if (href.startsWith('mailto:')) naam = 'email_klik';
      else if (href.includes('wa.me')) naam = 'whatsapp_klik';
      if (!naam) return;

      window.gtag?.('event', naam, {
        link_url: href || undefined,
        link_text: (el.textContent ?? '').trim().slice(0, 80) || undefined,
      });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  const kies = useCallback((v: Keuze) => {
    try {
      localStorage.setItem(OPSLAG, v);
    } catch {
      /* opslag geblokkeerd — de keuze geldt dan alleen dit bezoek */
    }
    setKeuze(v);
    setGevraagd(true);
  }, []);

  if (!GA_ID || gevraagd) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-[55] border-t border-white/12 bg-hull/97 backdrop-blur-md pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5"
    >
      <div className="shell flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <p className="type-body max-w-2xl text-mill">
          We meten graag anoniem hoe de site gebruikt wordt. Alleen met je toestemming — weiger je, dan wordt er niets
          geladen en niets opgeslagen.{' '}
          <a href="/privacy/" className="text-bone underline underline-offset-4 hover:text-red">
            Privacyverklaring
          </a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => kies('denied')}
            className="border border-white/25 px-5 py-3 type-label text-bone transition-colors hover:border-white/50"
          >
            Weigeren
          </button>
          <button
            type="button"
            onClick={() => kies('granted')}
            className="bg-red px-5 py-3 type-label text-white transition-colors hover:bg-red-hot"
          >
            Accepteren
          </button>
        </div>
      </div>
    </div>
  );
}
