import type { AnchorHTMLAttributes, ReactNode } from 'react';

type Variant = 'solid' | 'outline' | 'ghost';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
};

/**
 * Primary actions are cut tags in Assault Red; secondary ones are plain
 * rectangles with a second outline offset behind them. The arrow steps
 * forward a few pixels on hover.
 */
export function ArrowLink({ children, variant = 'solid', icon, className = '', ...rest }: Props) {
  const base = 'group inline-flex items-center gap-3 px-7 py-4 type-label transition-colors duration-300';

  if (variant === 'solid') {
    return (
      <a {...rest} className={`${base} cut-tag bg-red text-white hover:bg-red-hot ${className}`}>
        {icon}
        <span>{children}</span>
        <Arrow />
      </a>
    );
  }

  // Outline variants carry an offset ghost border — the reference detail that
  // keeps a secondary action from reading as a disabled primary.
  const ink = variant === 'outline' ? 'border-white/30 text-bone hover:border-red' : 'border-black/25 text-hull hover:border-red';
  const ghost = variant === 'outline' ? 'border-white/15' : 'border-black/15';

  return (
    <a {...rest} className={`relative ${base} border ${ink} ${className}`}>
      <span aria-hidden="true" className={`pointer-events-none absolute left-1.5 top-1.5 h-full w-full border ${ghost}`} />
      {icon}
      <span className="relative">{children}</span>
      <Arrow />
    </a>
  );
}

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 12"
      className="relative h-2.5 w-3.5 shrink-0 transition-transform duration-300 ease-[var(--ease-out-a)] group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M0 6h14M9.5 1.5 14.5 6l-5 4.5" />
    </svg>
  );
}
