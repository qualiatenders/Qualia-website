import Link from 'next/link';
import type { Article, Category, EventItem } from '@/lib/types';
import { deskShort, kindLabel } from '@/lib/taxonomy';
import { formatDate, pad2, timeAgo } from '@/lib/format';
import { ArticleMedia } from '../ArticleMedia';
import { CategoryTag, SponsoredBadge, TimeMeta } from '../ArticleMeta';
import { Coordinates } from '../Coordinates';
import { NewsletterForm } from '../NewsletterForm';
import { AdSlot } from '../ads/AdSlot';
import { Icon } from '../Icon';

/*
 * Front-page building blocks. The homepage is a newspaper front: dense,
 * scannable, every block a door into a section. Cards are single links
 * stretched over the card, so whole cards are clickable.
 */

const stretch = 'after:absolute after:inset-0 after:content-[""]';

/** "3h ago" today, "16 Oct" before that: the newswire's clock. */
export const wireTime = (iso: string) => timeAgo(iso).replace(/ \d{4}$/, '');

function BlockHead({ title, href, more = 'More', tone = 'light', id }: { title: string; href?: string; more?: string; tone?: 'light' | 'dark'; id?: string }) {
  return (
    <div className={`mb-5 flex items-center justify-between border-t-4 border-red pt-3`}>
      <h2 id={id} className="font-sans text-[1.05rem] font-extrabold tracking-[-0.01em] uppercase">
        {href ? (
          <Link href={href} className="hover:text-red">
            {title}
          </Link>
        ) : (
          title
        )}
      </h2>
      {href && (
        <Link href={href} className={`group inline-flex items-center gap-1.5 text-sm font-bold ${tone === 'dark' ? 'text-white' : ''}`}>
          {more} <Icon name="arrow" className="arrow size-3.5" />
        </Link>
      )}
    </div>
  );
}

/* ── Top stories (dark) ─────────────────────────────────────────────── */

export function TopStories({ lead, related, side, river }: { lead: Article; related: Article[]; side: Article[]; river: Article[] }) {
  return (
    <section aria-labelledby="top-stories" className="bg-ink pt-6 pb-10 lg:pt-8 lg:pb-12">
      <h2 id="top-stories" className="sr-only">
        Top stories
      </h2>
      <div className="shell grid gap-8 lg:grid-cols-12 lg:gap-8">
        {/* Lead */}
        <article className="group relative lg:col-span-6">
          <ArticleMedia article={lead} priority kenBurns geoCursor sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[16/10]" />
          <div className="mt-5">
            <CategoryTag article={lead} />
            <h3 className="rise mt-3 font-display text-[clamp(1.9rem,1.1rem+2.4vw,3.25rem)] leading-[1.04] font-semibold tracking-[-0.015em]">
              <Link href={lead.path} className={`headline-link ${stretch}`}>
                {lead.title}
              </Link>
            </h3>
            <p className="mt-3 font-display text-[1.125rem] leading-relaxed lg:text-[1.2rem]">{lead.excerpt}</p>
            <TimeMeta article={lead} showAuthor className="mt-3" />
            {lead.location && <Coordinates point={lead.location} className="mt-1.5" />}
          </div>
        </article>

        {/* Second column: three stories + related to the lead */}
        <div className="grid content-start gap-6 border-white/10 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1 lg:border-l lg:pl-8">
          {side.map((a) => (
            <article key={a.id} className="group relative grid grid-cols-[7rem_1fr] gap-4 sm:block">
              <ArticleMedia article={a} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 50vw, 112px" className="aspect-square sm:aspect-[16/9]" />
              <div className="min-w-0 sm:mt-3">
                <CategoryTag article={a} />
                <h3 className="mt-1.5 font-display text-[1.15rem] leading-snug font-semibold">
                  <Link href={a.path} className={`headline-link ${stretch}`}>
                    {a.title}
                  </Link>
                </h3>
                <p className="meta mt-1.5">{wireTime(a.publishedAt)}</p>
              </div>
            </article>
          ))}
          {related.length > 0 && (
            <div className="border-t border-white/15 pt-4 sm:col-span-2 lg:col-span-1">
              <p className="kicker text-red-ink">More on {deskShort[lead.category.slug] ?? lead.category.name}</p>
              <ul className="mt-2 space-y-2">
                {related.map((a) => (
                  <li key={a.id}>
                    <Link href={a.path} className="font-display text-[1rem] leading-snug hover:underline">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Newswire river */}
        <aside aria-labelledby="river-title" className="lg:col-span-3 lg:border-l lg:border-white/10 lg:pl-8">
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <h2 id="river-title" className="kicker flex items-center gap-2 text-white">
              <span className="live-dot" aria-hidden="true" /> Latest
            </h2>
            <Link href="/latest/" className="text-sm font-bold hover:underline">
              Newswire →
            </Link>
          </div>
          <ol className="divide-y divide-white/10">
            {river.map((a, i) => (
              <li key={a.id} className={`group relative ${i >= 6 ? 'max-sm:hidden' : ''} grid grid-cols-[3.75rem_1fr] gap-3 py-3`}>
                <time dateTime={a.publishedAt} className="pt-0.5 text-[0.75rem] font-bold tabular-nums">
                  {wireTime(a.publishedAt)}
                </time>
                <div className="min-w-0">
                  <p className="kicker text-red-ink">{deskShort[a.category.slug] ?? a.category.name}</p>
                  <h3 className="mt-1 font-display text-[0.98rem] leading-snug font-medium">
                    <Link href={a.path} className={`headline-link ${stretch}`}>
                      {a.title}
                    </Link>
                  </h3>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}

/* ── Desk blocks (white): 1 visual lead + headlines per section ─────── */

function DeskBox({ desk, items, rich }: { desk: Category; items: Article[]; rich: boolean }) {
  const [lead, ...rest] = items;
  return (
    <section aria-labelledby={`dk-${desk.slug}`} className="min-w-0" data-reveal>
      <BlockHead id={`dk-${desk.slug}`} title={desk.name} href={desk.path} />
      {lead && rich && (
        <article className="group relative">
          <ArticleMedia article={lead} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" className="aspect-[16/9]" />
          <h3 className="mt-3 font-display text-[1.25rem] leading-snug font-semibold">
            <Link href={lead.path} className={`headline-link ${stretch}`}>
              {lead.title}
            </Link>
          </h3>
          <p className="meta mt-1.5">
            {kindLabel[lead.kind]} · {wireTime(lead.publishedAt)}
          </p>
        </article>
      )}
      <ul className={`divide-y divide-[color:var(--line)] ${lead && rich ? 'mt-4 border-t border-line' : ''}`}>
        {(rich ? rest : items).slice(0, rich ? 3 : 4).map((a) => (
          <li key={a.id} className="group relative py-3">
            <h3 className="font-display text-[1.02rem] leading-snug font-medium">
              <Link href={a.path} className={`headline-link ${stretch}`}>
                {a.title}
              </Link>
            </h3>
            <p className="meta mt-1">{wireTime(a.publishedAt)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DeskGrid({ blocks }: { blocks: { desk: Category; items: Article[] }[] }) {
  const rich = blocks.filter((b) => b.items.length >= 2).slice(0, 6);
  const compact = blocks.filter((b) => !rich.includes(b) && b.items.length > 0);
  return (
    <section aria-label="News by industry" className="surface-white py-12 lg:py-16">
      <div className="shell">
        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {rich.map((b) => (
            <DeskBox key={b.desk.slug} desk={b.desk} items={b.items} rich />
          ))}
        </div>
        {compact.length > 0 && (
          <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {compact.map((b) => (
              <DeskBox key={b.desk.slug} desk={b.desk} items={b.items} rich={false} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Most read, as a horizontal ranked strip ─────────────────────────── */

export function MostReadRow({ items }: { items: Article[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="mr-title" className="surface-paper border-y border-line py-10">
      <div className="shell">
        <BlockHead id="mr-title" title="Most read this week" />
        <ol className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((a, i) => (
            <li key={a.id} className="group relative grid grid-cols-[3rem_1fr] gap-3">
              <span aria-hidden="true" className={`num-outline font-display text-[2.75rem] leading-[0.85] font-semibold ${i === 0 ? 'is-first' : ''}`}>
                {pad2(i + 1)}
              </span>
              <div>
                <p className="kicker text-accent">{deskShort[a.category.slug] ?? a.category.name}</p>
                <h3 className="mt-1 font-display text-[1rem] leading-snug font-medium">
                  <Link href={a.path} className={`headline-link ${stretch}`}>
                    {a.title}
                  </Link>
                </h3>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Analysis & features row ─────────────────────────────────────────── */

export function AnalysisRow({ items }: { items: Article[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="an-title" className="bg-ink py-12 text-white lg:py-16">
      <div className="shell">
        <BlockHead id="an-title" title="Analysis, features & interviews" href="/analysis/" more="All analysis" tone="dark" />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((a) => (
            <article key={a.id} className="group relative">
              <ArticleMedia article={a} sizes="(min-width: 1024px) 23vw, 50vw" className="aspect-[4/3]" />
              <p className="kicker mt-3 text-red-ink">
                {kindLabel[a.kind]} · {deskShort[a.category.slug] ?? a.category.name}
              </p>
              <h3 className="mt-1.5 font-display text-[1.15rem] leading-snug font-semibold">
                <Link href={a.path} className={`headline-link ${stretch}`}>
                  {a.title}
                </Link>
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Product radar · Deals · ad ─────────────────────────────────────── */

function ListBox({ title, items, href }: { title: string; items: Article[]; href: string }) {
  return (
    <section className="min-w-0">
      <BlockHead title={title} href={href} />
      <ul className="divide-y divide-[color:var(--line)]">
        {items.map((a) => (
          <li key={a.id} className="group relative grid grid-cols-[4.5rem_1fr] gap-3 py-3">
            <ArticleMedia article={a} sizes="72px" className="aspect-square" />
            <div className="min-w-0">
              <h3 className="font-display text-[1rem] leading-snug font-medium">
                <Link href={a.path} className={`headline-link ${stretch}`}>
                  {a.title}
                </Link>
              </h3>
              <p className="meta mt-1">
                {deskShort[a.category.slug] ?? a.category.name} · {wireTime(a.publishedAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RadarRow({ launches, deals }: { launches: Article[]; deals: Article[] }) {
  return (
    <section aria-label="Products and deals" className="surface-white py-12 lg:py-16">
      <div className="shell grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        <ListBox title="Product radar" items={launches} href="/products/" />
        <ListBox title="Deals & partnerships" items={deals} href="/deals/" />
        <div className="space-y-6">
          <AdSlot placement="sidebar-rectangle" />
        </div>
      </div>
    </section>
  );
}

/* ── Modules: newsletter · news map · next events ───────────────────── */

export function ModulesRow({ mapCount, places, events, mapSlot }: { mapCount: number; places: number; events: EventItem[]; mapSlot: React.ReactNode }) {
  return (
    <section aria-label="More from GeoInformatics" className="bg-anthracite py-12 text-white lg:py-14">
      <div className="shell grid gap-10 lg:grid-cols-3">
        <div>
          <BlockHead title="The weekly briefing" tone="dark" />
          <p className="font-display text-[1.35rem] leading-snug">The stories that matter in geospatial, selected by our editors. Free, every week.</p>
          <div className="mt-5">
            <NewsletterForm source="home-module" />
          </div>
        </div>
        <div>
          <BlockHead title="Live news map" href="/news-map/" more="Open map" tone="dark" />
          {mapSlot}
          <p className="mt-3 text-sm">
            <span className="font-bold">{mapCount} stories</span> pinned across <span className="font-bold">{places} places</span>.
          </p>
        </div>
        <div>
          <BlockHead title="Where to be next" href="/events/" more="Calendar" tone="dark" />
          <ul className="divide-y divide-white/10">
            {events.map((e) => (
              <li key={e.id} className="py-3">
                <p className="kicker text-red-ink">{e.startDate ? formatDate(e.startDate) : e.dateNote ?? 'Dates TBC'}</p>
                <a href={e.url} target="_blank" rel="noopener" className="mt-1 block font-display text-[1.05rem] leading-snug font-medium hover:underline">
                  {e.title}
                </a>
                <p className="mt-0.5 text-sm">{e.online ? 'Online' : [e.city, e.country].filter(Boolean).join(', ') || e.kind}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export { SponsoredBadge };

/* ── Compact newswire for sidebars ───────────────────────────────────── */

export function LatestList({ items }: { items: Article[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="side-latest">
      <div className="flex items-center justify-between border-t-4 border-red pt-3 pb-2">
        <h2 id="side-latest" className="font-sans text-[1.05rem] font-extrabold uppercase">
          Latest
        </h2>
        <Link href="/latest/" className="text-sm font-bold hover:underline">
          Newswire →
        </Link>
      </div>
      <ol className="divide-y divide-[color:var(--line)]">
        {items.map((a) => (
          <li key={a.id} className="group relative grid grid-cols-[3.5rem_1fr] gap-3 py-3">
            <time dateTime={a.publishedAt} className="pt-0.5 text-[0.75rem] font-bold tabular-nums">
              {wireTime(a.publishedAt)}
            </time>
            <h3 className="font-display text-[0.98rem] leading-snug font-medium">
              <Link href={a.path} className={`headline-link ${stretch}`}>
                {a.title}
              </Link>
            </h3>
          </li>
        ))}
      </ol>
    </section>
  );
}
