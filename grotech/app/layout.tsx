import type { Metadata, Viewport } from 'next';
import '@fontsource/lato/latin-400.css';
import '@fontsource/lato/latin-700.css';
import '@fontsource/lato/latin-900.css';
import '@fontsource/lato/latin-ext-400.css';
import '@fontsource/lato/latin-ext-700.css';
import '@fontsource/lato/latin-ext-900.css';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileCtaBar } from '@/components/MobileCtaBar';
import { RevealObserver } from '@/components/Reveal';
import { Analytics } from '@/components/Analytics';
import { JsonLd } from '@/components/JsonLd';
import { site } from '@/lib/site';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import { localeMeta, defaultLocale } from '@/lib/i18n/config';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: 'GROTECH — Precision Manufacturing', template: '%s | GROTECH' },
  description:
    'GROTECH is gespecialiseerd in aluminium: snijwerk, zetwerk en laswerk in aluminium, en CNC-frezen en -draaien in alle materialen. Upload je tekening en vraag een offerte aan.',
  applicationName: site.name,
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon-64.png', sizes: '64x64', type: 'image/png' }],
    apple: '/apple-touch-icon.png',
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: '#090B0E',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={localeMeta[defaultLocale].htmlLang} suppressHydrationWarning>
      <head>
        {/* Markeer dat JS draait vóór de eerste paint, zodat reveal-animaties niet flitsen. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <link rel="preload" href="/brand/monogram.svg" as="image" type="image/svg+xml" />
      </head>
      <body>
        <a href="#main" className="sr-only-focusable fixed top-3 left-3 z-[100] rounded-sm bg-offwhite px-4 py-3 font-bold text-black">
          Direct naar de inhoud
        </a>
        <Header />
        <div id="main" tabIndex={-1} className="outline-none">
          {children}
        </div>
        <Footer />
        <MobileCtaBar />
        <RevealObserver />
        <Analytics />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  );
}
