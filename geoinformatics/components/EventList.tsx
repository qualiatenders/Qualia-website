import type { EventItem } from '@/lib/types';
import { Icon } from './Icon';

const mon = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' });
const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit', timeZone: 'UTC' });
const full = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Upcoming first; events without confirmed dates follow, in editorial order. */
export function sortEvents(events: EventItem[], now = Date.now()) {
  const dated = events.filter((e) => e.startDate && new Date(e.endDate ?? e.startDate).getTime() >= now - 86_400_000);
  const undated = events.filter((e) => !e.startDate);
  return [...dated.sort((a, b) => a.startDate!.localeCompare(b.startDate!)), ...undated];
}

function DateBlock({ e }: { e: EventItem }) {
  if (!e.startDate)
    return (
      <div className="flex h-full min-h-20 flex-col justify-center border border-line px-3 py-2 text-center">
        <span className="kicker text-fg-subtle">Dates</span>
        <span className="mt-1 text-xs leading-tight font-medium">TBC</span>
      </div>
    );
  const s = new Date(e.startDate);
  return (
    <div className="flex min-h-20 flex-col items-center justify-center bg-ink px-3 py-2 text-center text-white">
      <span className="kicker text-red-ink">{mon.format(s)}</span>
      <span className="font-display text-3xl leading-none font-semibold tabular">{day.format(s)}</span>
    </div>
  );
}

export function EventList({ events, compact = false }: { events: EventItem[]; compact?: boolean }) {
  return (
    <ul className="divide-y divide-[color:var(--line)] border-y border-line">
      {events.map((e, i) => {
        const when = e.startDate ? `${full.format(new Date(e.startDate))}${e.endDate && e.endDate !== e.startDate ? ` – ${full.format(new Date(e.endDate))}` : ''}` : e.dateNote ?? 'Dates to be confirmed';
        const where = e.online ? 'Online' : [e.city, e.country].filter((x) => x && x !== 'Varies').join(', ') || 'Location varies';
        return (
          <li key={e.id} className="group relative grid grid-cols-[4.5rem_1fr] gap-5 py-6 sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:gap-8" data-reveal style={{ ['--reveal-delay' as string]: `${(i % 6) * 50}ms` }}>
            <DateBlock e={e} />
            <div className="min-w-0">
              <p className="kicker text-accent">{e.kind}</p>
              <h3 className="mt-1.5 font-display text-xl leading-tight font-semibold tracking-[-0.02em]">
                <a href={e.url} target="_blank" rel="noopener" className="headline-link after:absolute after:inset-0 after:content-['']">
                  {e.title}
                  <span className="sr-only"> (opens the organiser’s website)</span>
                </a>
              </h3>
              <p className="meta mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="calendar" className="size-3.5" />
                  {when}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="pin" className="size-3.5" />
                  {where}
                </span>
              </p>
              {!compact && <p className="mt-3 max-w-2xl text-[0.9375rem] text-fg-muted">{e.description}</p>}
            </div>
            <Icon name="arrowUpRight" className="hidden size-6 text-fg-subtle transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent sm:block" />
          </li>
        );
      })}
    </ul>
  );
}
