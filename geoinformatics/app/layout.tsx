import type { Metadata, Viewport } from 'next';
import './globals.css';
import { display, sans } from '@/lib/fonts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RevealObserver } from '@/components/Reveal';
import { GeoFx } from '@/components/GeoFx';
import { Analytics } from '@/components/Analytics';
import { JsonLd } from '@/components/JsonLd';
import { site } from '@/lib/site';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import { formatDay } from '@/lib/format';
import { isPreviewContent } from '@/lib/content';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Geospatial News & Intelligence`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: '/', types: { 'application/rss+xml': [{ url: '/feed.xml', title: `${site.name} — Latest news` }] } },
  openGraph: { type: 'website', siteName: site.name, locale: 'en_GB' },
  twitter: { card: 'summary_large_image' },
  icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }], apple: '/brand/apple-touch-icon.png' },
  formatDetection: { telephone: false, email: false, address: false },
  robots: isPreviewContent ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = {
  themeColor: '#0B0D10',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables reveal animations before first paint; without JS, content is simply visible. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a href="#main" className="sr-only-focusable fixed top-3 left-3 z-[100] bg-white px-4 py-3 font-semibold text-ink">
          Skip to content
        </a>
        <Header dateLine={formatDay()} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer preview={isPreviewContent} />
        <RevealObserver />
        <GeoFx />
        <Analytics />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  );
}
