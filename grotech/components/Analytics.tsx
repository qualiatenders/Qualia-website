import Script from 'next/script';

/**
 * Optionele, cookieloze analytics (bijv. Plausible EU of zelf-gehoste Umami).
 * Alleen actief als NEXT_PUBLIC_ANALYTICS_SRC is gezet; plaatst geen cookies,
 * dus geen toestemmingsbanner nodig (zie cookieverklaring).
 */
export function Analytics() {
  const src = process.env.NEXT_PUBLIC_ANALYTICS_SRC;
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
  if (!src || !domain) return null;
  return <Script src={src} data-domain={domain} data-website-id={domain} strategy="afterInteractive" />;
}
