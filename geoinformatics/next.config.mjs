import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */

/** Origin of the WordPress install (images, REST API). Empty in preview mode. */
function wpOrigin() {
  try {
    return process.env.WORDPRESS_URL ? new URL(process.env.WORDPRESS_URL).origin : '';
  } catch {
    return '';
  }
}

function originOf(value) {
  try {
    return value ? new URL(value).origin : '';
  } catch {
    return '';
  }
}

const extraImg = (process.env.IMAGE_HOSTS || '')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean);

const imgSources = [wpOrigin(), ...extraImg.map((h) => `https://${h}`)].filter(Boolean).join(' ');
const scriptSources = [originOf(process.env.NEXT_PUBLIC_ANALYTICS_SRC)].filter(Boolean).join(' ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''} ${scriptSources}`.trim(),
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: ${imgSources}`.trim(),
      "font-src 'self'",
      `connect-src 'self' ${scriptSources}`.trim(),
      // Article bodies may embed video from these hosts.
      "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; '),
  },
];

const remotePatterns = [
  ...(wpOrigin() ? [new URL(wpOrigin())] : []),
  ...extraImg.map((hostname) => ({ protocol: 'https', hostname })),
].map((u) => (u instanceof URL ? { protocol: u.protocol.replace(':', ''), hostname: u.hostname } : u));

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // WordPress permalinks end in a slash; keeping that means existing URLs map one-to-one.
  trailingSlash: true,
  output: 'standalone',
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 75, 85],
    remotePatterns,
  },
  async headers() {
    const headers = [...securityHeaders];
    if (process.env.NODE_ENV === 'production') {
      headers.push({ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' });
    }
    return [
      { source: '/:path*', headers },
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }, { key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
  /*
   * WordPress URLs that the new frontend serves under a different path.
   * Article, category, tag and author URLs keep their WordPress paths, so they
   * need no redirect. Extra legacy paths go in lib/redirects.mjs.
   */
  async redirects() {
    const { legacyRedirects } = await import('./lib/redirects.mjs');
    return legacyRedirects;
  },
};

export default nextConfig;
