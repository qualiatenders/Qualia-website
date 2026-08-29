import type { AnchorHTMLAttributes, ReactNode } from 'react';

type Variant = 'solid' | 'outline' | 'ghost';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  solid: 'bg-red text-white hover:bg-red-hot border border-red hover:border-red-hot',
  outline: 'border border-white/25 text-bone hover:border-red hover:text-white',
  ghost: 'border border-black/20 text-hull hover:border-red hover:text-red',
};

/** Primary call to action. The arrow steps forward a few pixels on hover. */
export function ArrowLink({ children, variant = 'solid', icon, className = '', ...rest }: Props) {
  return (
    <a
      {...rest}
      className={`group inline-flex items-center gap-3 rounded-[2px] px-6 py-4 type-label transition-colors duration-300 ${VARIANTS[variant]} ${className}`}
    >
      {icon}
      <span>{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 12"
        className="h-2.5 w-3.5 shrink-0 transition-transform duration-300 ease-[var(--ease-out-a)] group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M0 6h14M9.5 1.5 14.5 6l-5 4.5" />
      </svg>
    </a>
  );
}
