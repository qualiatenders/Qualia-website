import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GROTECH — Precision Manufacturing',
    short_name: 'GROTECH',
    start_url: '/',
    display: 'standalone',
    background_color: '#090B0E',
    theme_color: '#090B0E',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
