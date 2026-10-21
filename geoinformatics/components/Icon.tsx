const paths = {
  search: 'M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm5.3-2.2L21 21',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  arrowUpRight: 'M7 17 17 7M8 7h9v9',
  close: 'M6 6l12 12M18 6 6 18',
  menu: 'M3 7h18M3 12h18M3 17h18',
  chevron: 'm6 9 6 6 6-6',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 5v14l11-7z',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  pin: 'M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Zm0-9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  download: 'M12 4v11m-5-5 5 5 5-5M5 20h14',
  check: 'm5 12 5 5 9-10',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z',
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = 'size-5', strokeWidth = 1.6 }: { name: IconName; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" focusable="false">
      <path d={paths[name]} />
    </svg>
  );
}

/** Brand glyphs for share buttons (filled). */
export function BrandIcon({ name, className = 'size-4' }: { name: 'linkedin' | 'x' | 'facebook'; className?: string }) {
  const d = {
    linkedin: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1v5.45h-4V15.9c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.93h-4v-11Z',
    x: 'M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.57L16.67 19.2Z',
    facebook: 'M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.86.25-1.45 1.48-1.45h1.57V4.47A21 21 0 0 0 14.27 4.3c-2.27 0-3.82 1.38-3.82 3.92v2.28H7.9v3h2.55V21h3.05Z',
  }[name];
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
}
