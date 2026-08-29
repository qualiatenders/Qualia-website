import type { Metadata, Viewport } from 'next';
import { Archivo, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

/* Self-hosted via next/font: no render-blocking request, no layout shift. */
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-archivo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-tech',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://assaultboats.nl'),
  title: 'Assault 500 — Assault Boats',
  description:
    'De Assault 500 is een moderne aluminium V-jon van 5 meter, gebouwd in Nederland. Verkrijgbaar als open uitvoering en als Fish met verhoogd werpdek.',
  keywords: ['Assault Boats', 'Assault 500', 'aluminium boot', 'V-jon', 'visboot', 'Nederland'],
  openGraph: {
    title: 'Assault 500 — Assault Boats',
    description: 'Eén boot. Twee manieren om het water op te gaan.',
    locale: 'nl_NL',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${archivo.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a
          href="#assault-500"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-red focus:px-4 focus:py-3 focus:type-label focus:text-white"
        >
          Naar de inhoud
        </a>
        {children}
      </body>
    </html>
  );
}
