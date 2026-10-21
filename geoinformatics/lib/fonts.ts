import localFont from 'next/font/local';

/*
 * Self-hosted variable fonts (from @fontsource-variable), so there is no
 * request to Google at runtime and no build-time network dependency.
 *   Space Grotesk — headlines: geometric, technical, distinctive
 *   Inter         — body and UI: neutral, highly legible at length
 *   JetBrains Mono — metadata: coordinates, timestamps, desk codes
 */
export const display = localFont({
  src: '../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2',
  variable: '--font-display-face',
  weight: '300 700',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
  adjustFontFallback: 'Arial',
});

export const sans = localFont({
  src: [
    { path: '../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', style: 'normal' },
    { path: '../node_modules/@fontsource-variable/inter/files/inter-latin-wght-italic.woff2', style: 'italic' },
  ],
  variable: '--font-sans-face',
  weight: '100 900',
  display: 'swap',
  adjustFontFallback: 'Arial',
});

export const mono = localFont({
  src: '../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
  variable: '--font-mono-face',
  weight: '100 800',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});
