import { Icon } from './Icon';
import { JsonLd } from './JsonLd';
import { faqJsonLd } from '@/lib/seo';

export function Faq({ items, title = 'Veelgestelde vragen' }: { items: { q: string; a: string }[]; title?: string }) {
  return (
    <div>
      <h2 className="text-[length:var(--text-h3)] text-offwhite">{title}</h2>
      <div className="mt-8 border-t border-line">
        {items.map((f) => (
          <details key={f.q} className="group border-b border-line">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-bold text-offwhite transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line-strong text-red transition-transform duration-300 group-open:rotate-45">
                <Icon name="plus" size={16} strokeWidth={2} />
              </span>
            </summary>
            <p className="max-w-3xl pb-6 text-[0.9375rem] leading-relaxed text-mist">{f.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={faqJsonLd(items)} />
    </div>
  );
}
