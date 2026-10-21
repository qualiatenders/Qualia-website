import Link from 'next/link';
import { Icon } from './Icon';

/** Section opener: index number, title, optional "see all" link, red rule. */
export function SectionHeading({ index, title, href, linkLabel = 'View all', id, intro }: { index?: string; title: string; href?: string; linkLabel?: string; id?: string; intro?: string }) {
  return (
    <div className="mb-8 lg:mb-10">
      <div className="flex items-end justify-between gap-6 border-b border-line-strong pb-4">
        <div className="flex items-baseline gap-4">
          {index && <span className="meta tabular text-accent">{index}</span>}
          <h2 id={id} className="font-sans text-[clamp(1.6rem,1.2rem+1.4vw,2.5rem)] font-extrabold tracking-[-0.01em] uppercase">
            {title}
          </h2>
        </div>
        {href && (
          <Link href={href} className="group btn-link inline-flex flex-none items-center gap-2 text-sm font-semibold">
            <span className="nav-link">{linkLabel}</span>
            <Icon name="arrow" className="arrow size-4" />
          </Link>
        )}
      </div>
      {intro && <p className="mt-4 max-w-2xl text-fg-muted">{intro}</p>}
    </div>
  );
}
