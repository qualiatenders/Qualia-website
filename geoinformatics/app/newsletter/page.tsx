import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { content } from '@/lib/content';
import { NewsletterForm } from '@/components/NewsletterForm';
import { GeoArt } from '@/components/GeoArt';
import { HeadlineItem } from '@/components/Cards';
import { Icon } from '@/components/Icon';

export const revalidate = 600;

export const metadata: Metadata = pageMetadata({
  title: 'The GeoInformatics newsletter',
  description: 'The stories that matter across surveying, mapping, Earth observation, LiDAR and GeoAI — curated by our editors, delivered free to your inbox.',
  path: '/newsletter/',
});

const promises = [
  'Editor-selected stories, not an automated feed',
  'Analysis and interviews you won’t find in press releases',
  'Upcoming events and deadlines worth your calendar',
  'One click to unsubscribe, any time. We never sell your address.',
];

export default async function NewsletterPage() {
  const recent = (await content.list({ perPage: 5 })).items.filter((a) => !a.sponsored).slice(0, 4);
  return (
    <>
      <section className="relative overflow-hidden bg-ink">
        <div aria-hidden="true" className="absolute inset-0 opacity-50">
          <GeoArt visual="constellation" seed="newsletter" className="size-full" />
        </div>
        <div className="shell relative grid gap-12 py-16 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-7">
            <p className="kicker flex items-center gap-3 text-red-ink">
              <span className="rule-red" aria-hidden="true" /> Free newsletter
            </p>
            <h1 className="mt-6 font-display text-[clamp(2.75rem,1rem+6vw,7rem)] leading-[0.86] font-semibold tracking-[-0.06em] uppercase">
              The world of geospatial. Delivered.
            </h1>
          </div>
          <div className="lg:col-span-5 lg:self-end">
            <p className="mb-8 text-lead text-fog">Join the professionals who start their week with GeoInformatics: the essential news and analysis from across the industry, in one concise briefing.</p>
            <NewsletterForm source="newsletter-page" size="lg" />
          </div>
        </div>
      </section>
      <section className="surface-paper py-16 lg:py-24">
        <div className="shell grid gap-14 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] uppercase">What you get</h2>
            <ul className="mt-8 space-y-5">
              {promises.map((p) => (
                <li key={p} className="flex gap-4 border-b border-line pb-5 text-lg">
                  <Icon name="check" className="mt-1 size-5 flex-none text-red" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          {recent.length > 0 && (
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] uppercase">Recently on GeoInformatics</h2>
              <div className="mt-6 divide-y divide-[color:var(--line)]">
                {recent.map((a) => (
                  <HeadlineItem key={a.id} article={a} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
