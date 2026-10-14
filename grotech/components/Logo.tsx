/* eslint-disable @next/next/no-img-element */
/**
 * Originele GROTECH-merktekens (vector, één-op-één overgenomen uit het
 * brandbook). Nooit uitrekken, kantelen of van effecten voorzien.
 */
const MONO_RATIO = 1932 / 1296;
const WORD_RATIO = 5020 / 531;

export function Monogram({ height = 28, className = '' }: { height?: number; className?: string }) {
  return <img src="/brand/monogram.svg" alt="" width={Math.round(height * MONO_RATIO)} height={height} className={className} decoding="async" />;
}

export function Wordmark({ height = 14, className = '' }: { height?: number; className?: string }) {
  return <img src="/brand/wordmark.svg" alt="GROTECH" width={Math.round(height * WORD_RATIO)} height={height} className={className} decoding="async" />;
}

/** Horizontale lock-up voor navigatie: GT-teken + woordmerk. */
export function LogoLockup({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const h = size === 'lg' ? 40 : size === 'sm' ? 24 : 30;
  return (
    <span className="flex items-center gap-3">
      <Monogram height={h} />
      <span className="flex flex-col gap-[5px]">
        <Wordmark height={Math.round(h * 0.47)} />
        <span className="text-[0.5625rem] leading-none font-bold tracking-[0.32em] text-muted uppercase" aria-hidden="true">
          Precision Manufacturing
        </span>
      </span>
    </span>
  );
}
