import Script from 'next/script';

/**
 * Optional cookieless analytics (e.g. Plausible EU or self-hosted Umami).
 * Only loads when NEXT_PUBLIC_ANALYTICS_SRC is set. It sets no cookies, so
 * no consent banner is required for it (see the cookie policy).
 */
export function Analytics() {
  const src = process.env.NEXT_PUBLIC_ANALYTICS_SRC;
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
  if (!src || !domain) return null;
  return <Script src={src} data-domain={domain} data-website-id={domain} strategy="afterInteractive" />;
}
