type Props = {
  features: string[];
  tone?: 'dark' | 'light';
};

/** Numbered feature rows with hairline dividers — no icon grid. */
export function FeatureList({ features, tone = 'light' }: Props) {
  const border = tone === 'light' ? 'border-black/12' : 'border-white/12';
  const index = tone === 'light' ? 'text-mill' : 'text-deck';
  const text = tone === 'light' ? 'text-hull' : 'text-bone';

  return (
    <ul className={`border-t ${border}`}>
      {features.map((feature, i) => (
        <li key={feature} className={`flex items-baseline gap-5 border-b py-3.5 ${border}`}>
          <span className={`type-label w-6 shrink-0 ${index}`}>{String(i + 1).padStart(2, '0')}</span>
          <span className={`text-[0.9375rem] font-medium leading-snug ${text}`}>{feature}</span>
        </li>
      ))}
    </ul>
  );
}
