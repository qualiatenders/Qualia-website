import type { ReactNode } from 'react';

export function SectionHeader({
  index,
  eyebrow,
  title,
  intro,
  aside,
  className = '',
  as: Tag = 'h2',
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode;
  className?: string;
  as?: 'h1' | 'h2';
}) {
  return (
    <div className={`grid gap-8 lg:grid-cols-12 lg:items-end ${className}`}>
      <div className="lg:col-span-7" data-reveal>
        <p className="label-caps flex items-center gap-3 text-mist">
          {index && <span className="text-[0.8125rem] font-black tracking-normal text-red">{index}</span>}
          {index && <span className="h-px w-6 bg-line-strong" aria-hidden="true" />}
          <span>{eyebrow}</span>
        </p>
        <Tag className="mt-5 text-[length:var(--text-h2)] text-offwhite">{title}</Tag>
      </div>
      {(intro || aside) && (
        <div className="lg:col-span-5 lg:pb-1" data-reveal style={{ '--reveal-delay': 120 } as React.CSSProperties}>
          {intro && <p className="text-[length:var(--text-lead)] leading-relaxed text-mist">{intro}</p>}
          {aside}
        </div>
      )}
    </div>
  );
}

/** Rode indexmarkering zoals in het brandbook: "01 / ENGINEERING" */
export function IndexLabel({ index, label, className = '' }: { index: string; label: string; className?: string }) {
  return (
    <span className={`label-caps inline-flex items-center gap-2 text-mist ${className}`}>
      <span className="text-red">{index}</span>
      <span aria-hidden="true">/</span>
      <span>{label}</span>
    </span>
  );
}
