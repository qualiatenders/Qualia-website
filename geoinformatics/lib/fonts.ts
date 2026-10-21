import localFont from 'next/font/local';

/*
 * Self-hosted variable fonts (from @fontsource-variable): no request to
 * Google at runtime and no build-time network dependency.
 *   Newsreader       — headlines and article text. A serif drawn for news
 *                      (Production Type), with optical sizes from caption
 *                      to display: the authority of a newspaper of record.
 *   Schibsted Grotesk — navigation, labels, metadata and UI. Designed for the
 *                      Schibsted news group: compact, sturdy, made for screens.
 */
export const display = localFont({
  src: [
    { path: '../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2', style: 'normal' },
    { path: '../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2', style: 'italic' },
  ],
  variable: '--font-display-face',
  weight: '200 800',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

export const sans = localFont({
  src: [
    { path: '../node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2', style: 'normal' },
    { path: '../node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-italic.woff2', style: 'italic' },
  ],
  variable: '--font-sans-face',
  weight: '400 900',
  display: 'swap',
  adjustFontFallback: 'Arial',
});
