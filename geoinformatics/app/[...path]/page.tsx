import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { content, getArticle } from '@/lib/content';
import { articleJsonLd, articleMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { formatDateTime } from '@/lib/format';
import { kindLabel } from '@/lib/taxonomy';
import { GeoArt } from '@/components/GeoArt';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ReadingProgress } from '@/components/Motion';
import { ShareBar } from '@/components/article/ShareBar';
import { ViewBeacon } from '@/components/article/ViewBeacon';
import { AdSlot } from '@/components/ads/AdSlot';
import { Trending } from '@/components/Trending';
import { FeatureCard } from '@/components/Cards';
import { NewsletterForm } from '@/components/NewsletterForm';
import { Icon } from '@/components/Icon';
import { Coordinates } from '@/components/Coordinates';

export const revalidate = 300;
export const dynamicParams = true;
export const generateStaticParams = async () => [];

type Props = { params: Promise<{ path: string[] }> };

const toPath = (segs: string[]) => `/${segs.map(decodeURIComponent).join('/')}/`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getArticle(toPath((await params).path));
  return a ? articleMetadata(a) : { title: 'Not found', robots: { index: false } };
}

/**
 * Split the body after the third paragraph for the in-article ad — only in
 * articles long enough (6+ paragraphs) that the ad doesn't dominate.
 */
function splitForAd(html: string): [string, string | null] {
  const ends = [...html.matchAll(/<\/p>/g)];
  if (ends.length < 6) return [html, null];
  const at = ends[2]!.index! + 4;
  return [html.slice(0, at), html.slice(at)];
}

export default async function ArticlePage({ params }: Props) {
  const requested = toPath((await params).path);
  const a = await getArticle(requested);
  if (!a) notFound();
  // Same slug under an old permalink structure → one canonical URL.
  if (a.path !== requested) permanentRedirect(a.path);

  const [related, mostRead] = await Promise.all([content.related(a, 5), content.mostRead(5)]);
  const [before, after] = splitForAd(a.html ?? '');
  const url = absoluteUrl(a.path);
  const updated = new Date(a.updatedAt).getTime() - new Date(a.publishedAt).getTime() > 30 * 60_000;
  const next = related[0];

  return (
    <ReadingProgress>
      <article>
        <header className="bg-ink pt-8 pb-10 lg:pt-12 lg:pb-14">
          <div className="shell">
            <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: a.category.name, path: a.category.path }, { name: a.title, path: a.path }]} />
            <div className="mt-8 max-w-5xl lg:mt-12">
              {a.sponsored && (
                <p className="mb-6 inline-flex items-center gap-3 border border-white/25 px-3 py-2 text-sm">
                  <span className="kicker text-white">{a.sponsored.label}</span>
                  <span className="text-fog">
                    Content provided by {a.sponsored.sponsor}. Not written by the GeoInformatics editorial team.{' '}
                    <Link href="/legal/advertising-disclosure/" className="underline underline-offset-2 hover:text-white">
                      Learn more
                    </Link>
                  </span>
                </p>
              )}
              <p className="flex flex-wrap items-center gap-3">
                <Link href={a.category.path} className="cat-tag hover:underline">
                  {a.category.name}
                </Link>
                {a.kind !== 'news' && <span className="kicker text-fog">{kindLabel[a.kind]}</span>}
              </p>
              <h1 className="mt-5 font-display text-h1 leading-[1.02] font-semibold tracking-[-0.02em]">{a.title}</h1>
              <p className="mt-6 max-w-3xl font-display text-[clamp(1.2rem,1.05rem+0.6vw,1.5rem)] leading-relaxed text-fog">{a.excerpt}</p>
              {a.location && <Coordinates point={a.location} className="mt-5" />}
            </div>
            <div className="mt-10 flex flex-col gap-6 border-t border-white/15 pt-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="grid size-11 flex-none place-items-center bg-red font-display text-sm font-semibold">
                  {(a.sponsored?.sponsor ?? a.author.name)
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <div>
                  <p className="font-medium">
                    {a.sponsored ? (
                      a.sponsored.sponsor
                    ) : a.author.path ? (
                      <Link href={a.author.path} className="hover:underline">
                        {a.author.name}
                      </Link>
                    ) : (
                      a.author.name
                    )}
                    {a.author.role && !a.sponsored && <span className="text-fog"> · {a.author.role}</span>}
                  </p>
                  <p className="meta mt-1 flex flex-wrap gap-x-3">
                    <span>
                      Published <time dateTime={a.publishedAt}>{formatDateTime(a.publishedAt)}</time>
                    </span>
                    {updated && (
                      <span>
                        Updated <time dateTime={a.updatedAt}>{formatDateTime(a.updatedAt)}</time>
                      </span>
                    )}
                    <span>{a.readingMinutes} min read</span>
                  </p>
                </div>
              </div>
              <ShareBar url={url} title={a.title} />
            </div>
          </div>
        </header>

        <figure className="bg-ink">
          <div className="shell">
            <div
              className="relative aspect-[16/9] overflow-hidden bg-anthracite lg:aspect-[21/9]"
              data-tiles
              data-geo-cursor={a.location ? `${a.location.lat},${a.location.lon}` : undefined}
            >
              {a.image ? (
                <Image src={a.image.src} alt={a.image.alt} fill priority sizes="(min-width: 1472px) 1392px, 100vw" quality={85} className="object-cover" />
              ) : (
                <GeoArt visual={a.category.visual} seed={a.slug} className="absolute inset-0 size-full" label={`Illustration: ${a.category.name}`} />
              )}
            </div>
          </div>
          <figcaption className="surface-paper">
            <div className="shell meta flex flex-wrap justify-between gap-2 py-3">
              <span>{a.image?.caption ?? (a.image ? '' : `Illustration · ${a.category.name} desk`)}</span>
              {a.image?.credit && <span>Image: {a.image.credit}</span>}
            </div>
          </figcaption>
        </figure>

        <div className="surface-paper pb-16 lg:pb-24">
          <AdSlot placement="site-leaderboard" category={a.category.slug} className="shell pt-8" />
          <div className="shell grid gap-12 pt-10 lg:grid-cols-[3.5rem_minmax(0,1fr)_300px] lg:gap-10 lg:pt-14 xl:grid-cols-[5rem_minmax(0,1fr)_300px] xl:gap-16">
            <aside className="hidden lg:block" aria-label="Share">
              <div className="sticky top-[calc(var(--header-h)+2rem)]">
                <ShareBar url={url} title={a.title} vertical />
              </div>
            </aside>

            <div className="min-w-0">
              <div className={`article-body mx-auto max-w-[44rem] ${a.kind !== 'news' ? 'has-dropcap' : ''}`} dangerouslySetInnerHTML={{ __html: before }} />
              {after !== null && (
                <>
                  <AdSlot placement="article-inline" category={a.category.slug} className="mx-auto my-12 max-w-[44rem] border-y border-line py-6" />
                  <div className="article-body mx-auto max-w-[44rem]" dangerouslySetInnerHTML={{ __html: after }} />
                </>
              )}

              <footer className="mx-auto mt-12 max-w-[44rem] space-y-8">
                {a.source && (
                  <p className="border-l-2 border-red pl-4 text-sm text-fg-muted">
                    <span className="kicker mb-1 block text-fg">Source</span>
                    {a.source.url ? (
                      <a href={a.source.url} target="_blank" rel="noopener" className="underline underline-offset-2">
                        {a.source.name}
                      </a>
                    ) : (
                      a.source.name
                    )}
                  </p>
                )}
                {a.tags.length > 0 && (
                  <ul className="flex flex-wrap gap-2" aria-label="Topics">
                    {a.tags.map((t) => (
                      <li key={t.slug}>
                        <Link href={`/tag/${t.slug}/`} className="inline-block border border-line-strong px-3 py-1.5 text-sm transition-colors hover:border-[color:var(--fg)]">
                          {t.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="lg:hidden">
                  <ShareBar url={url} title={a.title} />
                </div>

                <section aria-labelledby="article-nl" className="surface-dark graticule relative p-6 sm:p-8">
                  <p className="kicker text-red-ink">Newsletter</p>
                  <h2 id="article-nl" className="mt-3 font-display text-2xl leading-tight font-semibold tracking-[-0.015em] sm:text-3xl">
                    Stories like this, in your inbox.
                  </h2>
                  <p className="mt-2 mb-6 text-fog">The week in geospatial — selected by our editors. Free.</p>
                  <NewsletterForm source={`article:${a.category.slug}`} />
                </section>
              </footer>
            </div>

            <aside className="space-y-10" aria-label="More from GeoInformatics">
              <AdSlot placement="sidebar-rectangle" category={a.category.slug} />
              <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:space-y-10">
                <AdSlot placement="article-halfpage" category={a.category.slug} />
                <Trending items={mostRead.filter((m) => m.id !== a.id).slice(0, 5)} tone="light" />
              </div>
            </aside>
          </div>
          <AdSlot placement="article-end" category={a.category.slug} className="shell mt-16" />
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="surface-white border-t border-line py-16 lg:py-20">
          <div className="shell">
            {next && (
              <Link href={next.path} className="group mb-14 flex flex-col gap-4 border-b border-line-strong pb-10 md:flex-row md:items-end md:justify-between">
                <span>
                  <span className="kicker text-accent">Up next · {next.category.name}</span>
                  <span className="mt-3 block max-w-4xl font-display text-[clamp(1.6rem,1.1rem+1.8vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.015em]">
                    <span className="headline-link">{next.title}</span>
                  </span>
                </span>
                <span className="grid size-14 flex-none place-items-center bg-ink text-white transition-colors group-hover:bg-red">
                  <Icon name="arrow" className="arrow size-5" />
                </span>
              </Link>
            )}
            <h2 id="related-title" className="font-sans text-2xl font-extrabold tracking-[-0.01em] uppercase">
              More from {a.category.name}
            </h2>
            <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {related.slice(next ? 1 : 0).map((r) => (
                <FeatureCard key={r.id} article={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ViewBeacon id={a.id} />
      <JsonLd data={articleJsonLd(a)} />
    </ReadingProgress>
  );
}
