import type { ReactNode } from 'react';

export const inputClass =
  'w-full rounded-[3px] border border-line-strong bg-black/60 px-4 py-3.5 text-offwhite placeholder:text-muted/70 transition-[border-color,box-shadow,background-color] duration-200 hover:border-offwhite/30 focus:border-offwhite focus:bg-black focus:shadow-[0_0_0_3px_rgba(246,247,248,0.08)] focus:outline-none aria-[invalid=true]:border-red aria-[invalid=true]:shadow-[0_0_0_3px_rgba(241,10,29,0.12)]';

export function Field({ id, label, required, optional, hint, error, children, className = '' }: { id: string; label: string; required?: boolean; optional?: boolean; hint?: ReactNode; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between gap-3 text-[0.9375rem] font-bold text-offwhite">
        <span>
          {label}
          {required && <span className="ml-1 text-red" aria-hidden="true">*</span>}
        </span>
        {optional && <span className="text-xs font-normal text-muted">Optioneel</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-2 text-[0.8125rem] text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-center gap-2 text-[0.8125rem] font-bold text-[#ff6b77]" role="alert">
          <span className="size-1.5 rounded-full bg-red" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, error?: string, hint?: boolean) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

/** Onzichtbaar veld dat alleen bots invullen. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label htmlFor="website">Website (niet invullen)</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
