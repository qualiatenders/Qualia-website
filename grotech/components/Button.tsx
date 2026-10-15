import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost';
type Common = { variant?: Variant; icon?: IconName | null; children: ReactNode; className?: string; size?: 'md' | 'lg' };

const base =
  'group/btn relative inline-flex items-center justify-between gap-4 overflow-hidden text-left sm:whitespace-nowrap rounded-[3px] font-bold uppercase tracking-[0.12em] transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-precise)] active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50';
const sizes = { md: 'min-h-12 pl-5 pr-2 text-[0.8125rem]', lg: 'min-h-14 pl-6 pr-2 text-[0.875rem]' };
const variants: Record<Variant, string> = {
  // Off-white vlak + rood accentblok: hoogste contrast, rood blijft accent.
  primary: 'bg-offwhite text-black hover:bg-offwhite/90 shadow-[0_0_0_0_rgba(241,10,29,0)] hover:shadow-[0_10px_40px_-12px_rgba(241,10,29,0.55)]',
  secondary: 'border border-line-strong text-offwhite hover:border-offwhite/60 hover:bg-offwhite/[0.05]',
  ghost: 'text-offwhite !pl-0 hover:text-white',
};

function Inner({ children, icon, variant }: { children: ReactNode; icon: IconName | null; variant: Variant }) {
  return (
    <>
      <span className="relative z-10">{children}</span>
      {icon && (
        <span
          className={
            variant === 'primary'
              ? 'relative z-10 grid size-9 place-items-center rounded-[2px] bg-red text-black transition-transform duration-300 ease-[var(--ease-precise)] group-hover/btn:translate-x-0.5'
              : 'relative z-10 grid size-9 place-items-center text-red transition-transform duration-300 ease-[var(--ease-precise)] group-hover/btn:translate-x-1'
          }
        >
          <Icon name={icon} size={18} strokeWidth={2} />
        </span>
      )}
    </>
  );
}

export function ButtonLink({ href, variant = 'primary', icon = 'arrow-right', children, className = '', size = 'md', ...rest }: Common & Omit<ComponentProps<typeof Link>, 'children' | 'className'>) {
  return (
    <Link href={href} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      <Inner icon={icon} variant={variant}>{children}</Inner>
    </Link>
  );
}

export function Button({ variant = 'primary', icon = 'arrow-right', children, className = '', size = 'md', ...rest }: Common & Omit<ComponentProps<'button'>, 'children' | 'className'>) {
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      <Inner icon={icon} variant={variant}>{children}</Inner>
    </button>
  );
}

/** Tekstlink met pijl, voor secundaire navigatie binnen secties. */
export function ArrowLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`group/al inline-flex items-center gap-3 text-sm font-bold tracking-[0.12em] text-offwhite uppercase ${className}`}>
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 ease-[var(--ease-precise)] group-hover/al:bg-[length:100%_1px]">{children}</span>
      <Icon name="arrow-right" size={16} strokeWidth={2} className="text-red transition-transform duration-300 group-hover/al:translate-x-1" />
    </Link>
  );
}
