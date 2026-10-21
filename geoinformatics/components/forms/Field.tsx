export function Field({ id, label, error, hint, children, optional }: { id: string; label: string; error?: string; hint?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {optional && <span className="ml-1.5 font-normal text-fg-subtle">(optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-fg-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormStatus({ state }: { state: { status: string; message?: string } }) {
  if (state.status !== 'error') return null;
  return (
    <p role="alert" className="border-l-2 border-red pl-4 text-sm font-medium text-accent">
      {state.message}
    </p>
  );
}

export function Sent({ title, body }: { title: string; body: string }) {
  return (
    <div role="status" className="border-l-2 border-red py-4 pl-6">
      <p className="font-display text-3xl font-semibold tracking-[-0.015em]">{title}</p>
      <p className="mt-2 max-w-lg text-fg-muted">{body}</p>
    </div>
  );
}
