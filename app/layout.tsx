import type { Metadata, Viewport } from 'next';
import { Archivo, Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@/components/Analytics';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { StickyCTA } from '@/components/StickyCTA';
import { jsonLd, organizationSchema } from '@/lib/seo';
import { SITE, SITE_URL } from '@/lib/site';
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

/**
 * Site-brede standaarden. Elke pagina zet zijn eigen title, omschrijving,
 * canonical en Open Graph via pageMetadata() in lib/seo.ts.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Aluminium visboot & V-jon uit Nederland | Assault Boats',
    // Paginatitels vullen alleen hun eigen deel in.
    template: '%s | Assault Boats',
  },
  description:
    'Assault Boats bouwt aluminium V-jons in Nederland. De Assault 500 is 5 meter lang, 4 mm dik en leverbaar als open uitvoering of als Fish met vast werpdek.',
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  formatDetection: { telephone: true, address: false, email: true },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.webmanifest',
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={SITE.lang} className={`${archivo.variable} ${inter.variable} ${mono.variable}`}>
      <head>
        {/*
          Organization staat in de root, dus op elke pagina. De @id maakt hem
          herbruikbaar: het productschema verwijst ernaar in plaats van de
          gegevens te herhalen.
        */}
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organizationSchema())} />
      </head>
      <body>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a
          href="#inhoud"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-red focus:px-4 focus:py-3 focus:type-label focus:text-white"
        >
          Naar de inhoud
        </a>
        {/*
          Header, footer en de meescrollende CTA staan in de root: elke
          route krijgt ze zo automatisch, en ze hoeven niet per pagina
          herhaald te worden.
        */}
        <Header />
        <main id="inhoud">{children}</main>
        <Footer />
        <StickyCTA />
        <Analytics />
      </body>
    </html>
  );
}
