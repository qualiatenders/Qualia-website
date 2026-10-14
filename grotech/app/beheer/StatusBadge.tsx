const map = {
  nieuw: ['Nieuw', 'bg-red text-black'],
  'in-behandeling': ['In behandeling', 'bg-offwhite text-black'],
  geoffreerd: ['Geoffreerd', 'bg-steel text-offwhite'],
  afgesloten: ['Afgesloten', 'border border-line-strong text-muted'],
} as const;

export function StatusBadge({ status }: { status: keyof typeof map }) {
  const [label, cls] = map[status] ?? [status, ''];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}`}>{label}</span>;
}
